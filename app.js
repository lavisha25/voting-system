// app.js - UI and general functionality for DecentralVote

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Application
    initApp();
    
    // Set up event listeners
    setupEventListeners();
});

// Global state
const appState = {
    currentSection: 'home',
    theme: localStorage.getItem('theme') || 'dark',
    wallet: {
        connected: false,
        address: null,
    },
    selectedElection: null,
    selectedCandidate: null,
    notifications: [],
};

// Initialize application
function initApp() {
    // Apply saved theme
    document.body.classList.toggle('dark-mode', appState.theme === 'dark');
    updateThemeToggleIcon();
    
    // Show active section
    showSection(appState.currentSection);
    
    // Highlight active nav button
    updateNavButtons();
    
    // Initialize Web3 (from blockchain.js)
    if (typeof initWeb3 === 'function') {
        initWeb3().then(() => {
            // Check if wallet was previously connected
            const savedWalletAddress = localStorage.getItem('walletAddress');
            if (savedWalletAddress) {
                connectWallet(true);
            }
        }).catch(error => {
            console.error('Failed to initialize Web3:', error);
            showNotification('error', 'Failed to initialize blockchain connection');
        });
    }
    
    // Animate background particles
    initParticles();
}

// Set up event listeners
function setupEventListeners() {
    // Theme toggle
    document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);
    
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.getAttribute('data-section');
            navigateTo(section);
        });
    });
    


// Enhanced app.js for Voting System Project
// Includes features: prevent post-end voting, countdown timer, CSV export, transaction links, admin panel tools, and more.

// (Previous imports and appState definition remain unchanged)

function castVote() {
    if (!appState.selectedElection || appState.selectedCandidate === null) {
        showNotification('error', 'Please select a candidate');
        return;
    }

    const endDate = new Date(appState.selectedElection.endTime * 1000);
    if (Date.now() > endDate.getTime()) {
        showNotification('error', 'Election has ended. You cannot vote.');
        return;
    }

    showConfirmationModal(
        'Confirm Vote',
        `Are you sure you want to cast your vote? This action cannot be undone.`,
        () => {
            const button = document.getElementById('submit-vote');
            button.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; margin: 0;"></div>';
            button.disabled = true;

            vote(appState.selectedElection.id, appState.selectedCandidate)
                .then(receipt => {
                    showNotification(
                        'success',
                        `Vote cast! <a href='https://etherscan.io/tx/${receipt.transactionHash}' target='_blank'>View Transaction</a>`
                    );

                    // ✅ Log vote to MongoDB
                    fetch('http://localhost:5000/api/log-vote', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            wallet: appState.wallet.address,
                            electionId: appState.selectedElection.id,
                            candidateId: appState.selectedCandidate,
                            txHash: receipt.transactionHash
                        })
                    }).then(res => {
                        if (!res.ok) {
                            console.error('Failed to log vote to DB');
                        }
                    }).catch(err => {
                        console.error('MongoDB logging error:', err);
                    });

                    // ✅ Update UI
                    document.getElementById('voting-action').style.display = 'none';
                    document.getElementById('voting-results').style.display = 'block';
                    loadElectionResults(appState.selectedElection.id);
                })
                .catch(error => {
                    console.error('Failed to cast vote:', error);
                    showNotification('error', 'Failed to cast vote: ' + error.message);
                })
                .finally(() => {
                    button.innerHTML = 'Submit Vote';
                    button.disabled = false;
                });
        }
    );
}


function loadElectionResults(electionId) {
    const container = document.getElementById('results-chart');
    container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading results...</p></div>';

    getElectionResults(electionId)
        .then(results => getCandidates(electionId).then(candidates => ({ results, candidates })))
        .then(data => {
            container.innerHTML = '<canvas id="results-canvas"></canvas><button id="export-csv" class="btn secondary-btn">Export CSV</button>';

            const labels = data.candidates.map(c => c.name);
            const votes = data.results;

            const ctx = document.getElementById('results-canvas').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Votes',
                        data: votes,
                        backgroundColor: 'rgba(157, 118, 234, 0.7)',
                        borderColor: 'rgba(157, 118, 234, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                }
            });

            document.getElementById('export-csv').onclick = () => {
                const csv = ['Candidate,Votes'];
                labels.forEach((label, i) => csv.push(`${label},${votes[i]}`));
                const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `election_${electionId}_results.csv`;
                a.click();
            };
        })
        .catch(error => {
            console.error('Failed to load election results:', error);
            container.innerHTML = '<p class="empty-state">Failed to load results. Please try again later.</p>';
            showNotification('error', 'Failed to load election results');
        });
}

function createElectionCard(election) {
    const card = document.createElement('div');
    card.className = 'election-card';
    card.dataset.id = election.id;

    const endDate = new Date(election.endTime * 1000);
    const timeRemaining = getTimeRemaining(endDate);
    const isActive = Date.now() < endDate.getTime();

    card.innerHTML = `
        <h3>${election.name}</h3>
        <p>${election.description}</p>
        <div class="election-meta">
            <div class="election-status">
                <div class="status-indicator ${isActive ? 'active' : 'ended'}"></div>
                <span>${isActive ? 'Active' : 'Ended'}</span>
            </div>
            <div class="time-remaining">
                <i class="fas fa-clock"></i>
                <span>${isActive ? timeRemaining : 'Ended'}</span>
            </div>
        </div>`;

    card.addEventListener('click', () => viewElectionDetails(election));
    return card;
}


















    // Home page buttons
    document.getElementById('connect-wallet').addEventListener('click', () => connectWallet());
    document.getElementById('explore-btn').addEventListener('click', () => navigateTo('about'));
    document.getElementById('back-to-home').addEventListener('click', () => navigateTo('home'));
    
    // Voting section
    document.getElementById('connect-wallet-voting').addEventListener('click', () => connectWallet());
    document.getElementById('back-to-elections').addEventListener('click', () => {
        document.getElementById('elections-container').style.display = 'grid';
        document.getElementById('election-details').style.display = 'none';
        appState.selectedElection = null;
        appState.selectedCandidate = null;
    });
    
    document.getElementById('submit-vote').addEventListener('click', castVote);
    
    // Create election section
    document.getElementById('voter-restrictions').addEventListener('change', (e) => {
        document.getElementById('whitelist-container').style.display = 
            e.target.value === 'whitelist' ? 'block' : 'none';
    });
    
    document.getElementById('add-candidate').addEventListener('click', addCandidateInput);
    
    document.getElementById('create-election-form').addEventListener('submit', (e) => {
        e.preventDefault();
        createElection();
    });
    
    document.getElementById('back-from-create').addEventListener('click', () => navigateTo('home'));
    
    // Profile section
    document.getElementById('disconnect-wallet').addEventListener('click', disconnectWallet);
    document.getElementById('back-from-profile').addEventListener('click', () => navigateTo('home'));
    
    // Notifications
    document.querySelector('.notification-close').addEventListener('click', () => {
        document.getElementById('notification').classList.remove('show');
    });
    
    // Modal
    document.getElementById('modal-close').addEventListener('click', closeModal);
}

// Navigation Functions
function navigateTo(section) {
    showSection(section);
    appState.currentSection = section;
    updateNavButtons();
    
    // Section-specific initialization
    if (section === 'voting' && appState.wallet.connected) {
        loadElections();
    } else if (section === 'user-profile' && appState.wallet.connected) {
        loadUserProfile();
    }
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }
    
    // Update UI based on wallet connection status
    if (sectionId === 'voting') {
        document.getElementById('voting-not-connected').style.display = appState.wallet.connected ? 'none' : 'block';
        document.getElementById('voting-connected').style.display = appState.wallet.connected ? 'block' : 'none';
    }
}

function updateNavButtons() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        const section = btn.getAttribute('data-section');
        btn.classList.toggle('active', section === appState.currentSection);
    });
}

// Theme Functions
function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    appState.theme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', appState.theme);
    updateThemeToggleIcon();
}

function updateThemeToggleIcon() {
    const icon = document.querySelector('#theme-toggle-btn i');
    if (appState.theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// Wallet Functions
async function connectWallet(silent = false) {
    try {
        const address = await requestWalletConnection();
        
        if (address) {
            appState.wallet.connected = true;
            appState.wallet.address = address;
            
            // Update UI for connected state
            updateWalletUI();
            
            // Store wallet address in local storage
            localStorage.setItem('walletAddress', address);
            
            // Load user's elections and voting history if on profile page
            if (appState.currentSection === 'user-profile') {
                loadUserProfile();
            }
            
            // Load elections if on voting page
            if (appState.currentSection === 'voting') {
                loadElections();
            }
            
            if (!silent) {
                showNotification('success', 'Wallet connected successfully');
            }
        }
    } catch (error) {
        console.error('Failed to connect wallet:', error);
        if (!silent) {
            showNotification('error', 'Failed to connect wallet: ' + error.message);
        }
    }
}

function updateWalletUI() {
    // Update wallet address display
    const formattedAddress = formatAddress(appState.wallet.address);
    document.getElementById('wallet-address').textContent = formattedAddress;
    
    // Update UI elements that depend on connection status
    if (appState.currentSection === 'voting') {
        document.getElementById('voting-not-connected').style.display = 'none';
        document.getElementById('voting-connected').style.display = 'block';
    }
}

function disconnectWallet() {
    appState.wallet.connected = false;
    appState.wallet.address = null;
    
    // Remove wallet address from local storage
    localStorage.removeItem('walletAddress');
    
    // Update UI for disconnected state
    if (appState.currentSection === 'voting') {
        document.getElementById('voting-not-connected').style.display = 'block';
        document.getElementById('voting-connected').style.display = 'none';
    }
    
    // Navigate back to home
    navigateTo('home');
    
    showNotification('info', 'Wallet disconnected');
}

// Helper function to format wallet address
function formatAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Election Functions
function loadElections() {
    // Clear existing elections
    const container = document.getElementById('elections-container');
    container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading elections...</p></div>';
    
    // Show elections container, hide election details
    container.style.display = 'grid';
    document.getElementById('election-details').style.display = 'none';
    
    // Fetch elections from blockchain
    getActiveElections()
        .then(elections => {
            if (elections.length === 0) {
                container.innerHTML = '<p class="empty-state">No active elections found.</p>';
                return;
            }
            
            container.innerHTML = '';
            
            // Create election cards
            elections.forEach(election => {
                const card = createElectionCard(election);
                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Failed to load elections:', error);
            container.innerHTML = '<p class="empty-state">Failed to load elections. Please try again later.</p>';
            showNotification('error', 'Failed to load elections');
        });
}

function createElectionCard(election) {
    const card = document.createElement('div');
    card.className = 'election-card';
    
    // Format end date
    const endDate = new Date(election.endTime * 1000);
    const timeRemaining = getTimeRemaining(endDate);
    
    // Determine if election is active
    const isActive = Date.now() < endDate.getTime();
    
    card.innerHTML = `
        <h3>${election.name}</h3>
        <p>${election.description}</p>
        <div class="election-meta">
            <div class="election-status">
                <div class="status-indicator ${isActive ? 'active' : 'ended'}"></div>
                <span>${isActive ? 'Active' : 'Ended'}</span>
            </div>
            <div class="time-remaining">
                <i class="fas fa-clock"></i>
                <span>${isActive ? timeRemaining : 'Ended'}</span>
            </div>
        </div>
    `;
    
    // Add click event to view election details
    card.addEventListener('click', () => {
        viewElectionDetails(election);
    });
    
    return card;
}

function viewElectionDetails(election) {
    appState.selectedElection = election;
    
    // Hide elections container, show election details
    document.getElementById('elections-container').style.display = 'none';
    const detailsContainer = document.getElementById('election-details');
    detailsContainer.style.display = 'block';
    
    // Update election details
    document.getElementById('election-title').textContent = election.name;
    document.getElementById('election-description').textContent = election.description;
    
    // Format end date
    const endDate = new Date(election.endTime * 1000);
    const timeRemaining = getTimeRemaining(endDate);
    document.getElementById('time-remaining').textContent = timeRemaining;
    
    // Determine if election is active
    const isActive = Date.now() < endDate.getTime();
    const statusIndicator = document.querySelector('#election-details .status-indicator');
    statusIndicator.className = `status-indicator ${isActive ? 'active' : 'ended'}`;
    statusIndicator.nextElementSibling.textContent = isActive ? 'Active' : 'Ended';
    
    // Load candidates
    loadCandidates(election.id);
    
    // Check if user has already voted
    hasVoted(election.id, appState.wallet.address)
        .then(voted => {
            if (voted) {
                // Show results instead of voting options
                document.getElementById('voting-action').style.display = 'none';
                document.getElementById('voting-results').style.display = 'block';
                
                // Load results
                loadElectionResults(election.id);
            } else {
                // Show voting options
                document.getElementById('voting-action').style.display = 'block';
                document.getElementById('voting-results').style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Failed to check voting status:', error);
            showNotification('error', 'Failed to check if you have already voted');
        });
}

function loadCandidates(electionId) {
    // Clear existing candidates
    const container = document.getElementById('candidates-container');
    container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading candidates...</p></div>';
    
    // Fetch candidates from blockchain
    getCandidates(electionId)
        .then(candidates => {
            if (candidates.length === 0) {
                container.innerHTML = '<p class="empty-state">No candidates found for this election.</p>';
                return;
            }
            
            container.innerHTML = '';
            
            // Create candidate cards
            candidates.forEach((candidate, index) => {
                const card = createCandidateCard(candidate, index);
                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Failed to load candidates:', error);
            container.innerHTML = '<p class="empty-state">Failed to load candidates. Please try again later.</p>';
            showNotification('error', 'Failed to load candidates');
        });
}

function createCandidateCard(candidate, index) {
    const card = document.createElement('div');
    card.className = 'candidate-card';
    card.dataset.candidateId = index;
    
    card.innerHTML = `
        <div class="candidate-avatar">
            <i class="fas fa-user"></i>
        </div>
        <h4>${candidate.name}</h4>
        <p>${candidate.description || 'No additional information provided.'}</p>
    `;
    
    // Add click event to select candidate
    card.addEventListener('click', () => {
        selectCandidate(card, index);
    });
    
    return card;
}

function selectCandidate(card, candidateId) {
    // Deselect previously selected candidate
    document.querySelectorAll('.candidate-card').forEach(c => {
        c.classList.remove('selected');
    });
    
    // Select new candidate
    card.classList.add('selected');
    appState.selectedCandidate = candidateId;
}

function castVote() {
    if (!appState.selectedElection || appState.selectedCandidate === null) {
        showNotification('error', 'Please select a candidate');
        return;
    }
    
    // Confirm vote
    showConfirmationModal(
        'Confirm Vote',
        `Are you sure you want to cast your vote? This action cannot be undone.`,
        () => {
            // Show loading spinner
            document.getElementById('submit-vote').innerHTML = '<div class="spinner" style="width: 20px; height: 20px; margin: 0;"></div>';
            document.getElementById('submit-vote').disabled = true;
            
            // Cast vote on blockchain
            vote(appState.selectedElection.id, appState.selectedCandidate)
                .then(() => {
                    showNotification('success', 'Vote cast successfully');
                    
                    // Show results
                    document.getElementById('voting-action').style.display = 'none';
                    document.getElementById('voting-results').style.display = 'block';
                    
                    // Load results
                    loadElectionResults(appState.selectedElection.id);
                })
                .catch(error => {
                    console.error('Failed to cast vote:', error);
                    showNotification('error', 'Failed to cast vote: ' + error.message);
                })
                .finally(() => {
                    // Restore button
                    document.getElementById('submit-vote').innerHTML = 'Submit Vote';
                    document.getElementById('submit-vote').disabled = false;
                });
        }
    );
}

function loadElectionResults(electionId) {
    // Clear existing results
    const container = document.getElementById('results-chart');
    container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading results...</p></div>';
    
    // Fetch results from blockchain
    getElectionResults(electionId)
        .then(results => {
            // Get candidates to display names
            return getCandidates(electionId)
                .then(candidates => {
                    return { results, candidates };
                });
        })
        .then(data => {
            container.innerHTML = '<canvas id="results-canvas"></canvas>';
            
            // Create chart labels and data
            const labels = data.candidates.map(c => c.name);
            const votes = data.results;
            
            // Create chart
            const ctx = document.getElementById('results-canvas').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Votes',
                        data: votes,
                        backgroundColor: [
                            'rgba(157, 118, 234, 0.7)',
                            'rgba(119, 67, 219, 0.7)',
                            'rgba(108, 74, 182, 0.7)',
                            'rgba(87, 54, 153, 0.7)',
                            'rgba(66, 39, 90, 0.7)'
                        ],
                        borderColor: [
                            'rgba(157, 118, 234, 1)',
                            'rgba(119, 67, 219, 1)',
                            'rgba(108, 74, 182, 1)',
                            'rgba(87, 54, 153, 1)',
                            'rgba(66, 39, 90, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.raw} votes`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error('Failed to load election results:', error);
            container.innerHTML = '<p class="empty-state">Failed to load results. Please try again later.</p>';
            showNotification('error', 'Failed to load election results');
        });
}

function createElection() {
    // Get form values
    const name = document.getElementById('election-name').value;
    const description = document.getElementById('election-description').value;
    const endDate = new Date(document.getElementById('end-date').value).getTime() / 1000; // Convert to Unix timestamp
    
    // Get candidates
    const candidateInputs = document.querySelectorAll('.candidate-input');
    const candidates = Array.from(candidateInputs).map(input => {
        return {
            name: input.querySelector('.candidate-name').value,
            description: input.querySelector('.candidate-info').value || ''
        };
    });
    
    // Get voter restrictions
    const restrictionType = document.getElementById('voter-restrictions').value;
    let whitelist = [];
    
    if (restrictionType === 'whitelist') {
        const whitelistText = document.getElementById('whitelist-addresses').value;
        whitelist = whitelistText.split('\n')
            .map(address => address.trim())
            .filter(address => address.length > 0);
    }
    
    // Validate input
    if (!name || !description || !endDate || candidates.length < 2 || candidates.some(c => !c.name)) {
        showNotification('error', 'Please fill in all required fields and add at least two candidates');
        return;
    }
    
    // Show loading modal
    showLoadingModal('Creating Election', 'Please wait while your election is being created...');
    
    // Create election on blockchain
    deployElection(name, description, endDate, candidates, whitelist)
        .then(() => {
            // Clear form
            document.getElementById('create-election-form').reset();
            
            // Close modal
            closeModal();
            
            // Show success notification
            showNotification('success', 'Election created successfully');
            
            // Navigate to voting section
            navigateTo('voting');
        })
        .catch(error => {
            console.error('Failed to create election:', error);
            
            // Close loading modal
            closeModal();
            
            // Show error notification
            showNotification('error', 'Failed to create election: ' + error.message);
        });
}

function addCandidateInput() {
    const candidatesList = document.getElementById('candidates-list');
    
    const candidateInput = document.createElement('div');
    candidateInput.className = 'candidate-input';
    
    candidateInput.innerHTML = `
        <input type="text" class="candidate-name" placeholder="Candidate Name" required>
        <input type="text" class="candidate-info" placeholder="Brief description">
        <button type="button" class="remove-candidate"><i class="fas fa-times"></i></button>
    `;
    
    // Add event listener for remove button
    candidateInput.querySelector('.remove-candidate').addEventListener('click', () => {
        // Only remove if there are more than 2 candidates
        if (document.querySelectorAll('.candidate-input').length > 2) {
            candidatesList.removeChild(candidateInput);
        } else {
            showNotification('error', 'At least two candidates are required');
        }
    });
    
    candidatesList.appendChild(candidateInput);
}

// User Profile Functions
function loadUserProfile() {
    if (!appState.wallet.connected) {
        navigateTo('home');
        return;
    }
    
    // Update wallet address display
    document.getElementById('wallet-address').textContent = formatAddress(appState.wallet.address);
    
    // Load user's elections
    loadUserElections();
    
    // Load voting history
    loadVotingHistory();
    
    // Get user stats
    getUserStats()
        .then(stats => {
            document.getElementById('elections-created').textContent = stats.created;
            document.getElementById('elections-voted').textContent = stats.participated;
        })
        .catch(error => {
            console.error('Failed to load user stats:', error);
            document.getElementById('elections-created').textContent = '0';
            document.getElementById('elections-voted').textContent = '0';
        });
}

function loadUserElections() {
    const container = document.getElementById('user-elections');
    container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading your elections...</p></div>';
    
    // Fetch user's created elections
    getUserElections(appState.wallet.address)
        .then(elections => {
            if (elections.length === 0) {
                container.innerHTML = '<p class="empty-state">You haven\'t created any elections yet.</p>';
                return;
            }
            
            container.innerHTML = '';
            
            // Create election list
            const electionList = document.createElement('ul');
            electionList.className = 'user-election-list';
            
            elections.forEach(election => {
                const item = document.createElement('li');
                item.className = 'user-election-item';
                
                // Format end date
                const endDate = new Date(election.endTime * 1000);
                const isActive = Date.now() < endDate.getTime();
                
                item.innerHTML = `
                    <h4>${election.name}</h4>
                    <div class="election-meta">
                        <div class="election-status">
                            <div class="status-indicator ${isActive ? 'active' : 'ended'}"></div>
                            <span>${isActive ? 'Active' : 'Ended'}</span>
                        </div>
                        <button class="btn secondary-btn view-election">View</button>
                    </div>
                `;
                
                // Add click event to view election
                item.querySelector('.view-election').addEventListener('click', () => {
                    navigateTo('voting');
                    setTimeout(() => {
                        viewElectionDetails(election);
                    }, 300);
                });
                
                electionList.appendChild(item);
            });
            
            container.appendChild(electionList);
        })
        .catch(error => {
            console.error('Failed to load user elections:', error);
            container.innerHTML = '<p class="empty-state">Failed to load your elections. Please try again later.</p>';
        });
}

function loadVotingHistory() {
    const container = document.getElementById('voting-history');
    container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading your voting history...</p></div>';
    
    // Fetch user's voting history
    getVotingHistory(appState.wallet.address)
        .then(history => {
            if (history.length === 0) {
                container.innerHTML = '<p class="empty-state">Your voting history will appear here.</p>';
                return;
            }
            
            container.innerHTML = '';
            
            // Create history list
            const historyList = document.createElement('ul');
            historyList.className = 'voting-history-list';
            
            history.forEach(vote => {
                const item = document.createElement('li');
                item.className = 'voting-history-item';
                
                // Format vote date
                const voteDate = new Date(vote.timestamp * 1000);
                const formattedDate = voteDate.toLocaleDateString() + ' ' + voteDate.toLocaleTimeString();
                
                item.innerHTML = `
                    <h4>${vote.electionName}</h4>
                    <p>Voted for: ${vote.candidateName}</p>
                    <p class="vote-date">${formattedDate}</p>
                    <button class="btn secondary-btn view-election">View Election</button>
                `;
                
                // Add click event to view election
                item.querySelector('.view-election').addEventListener('click', () => {
                    navigateTo('voting');
                    setTimeout(() => {
                        viewElectionDetails(vote.election);
                    }, 300);
                });
                
                historyList.appendChild(item);
            });
            
            container.appendChild(historyList);
        })
        .catch(error => {
            console.error('Failed to load voting history:', error);
            container.innerHTML = '<p class="empty-state">Failed to load your voting history. Please try again later.</p>';
        });
}

// Notification Functions
function showNotification(type, message) {
    const notification = document.getElementById('notification');
    const icon = notification.querySelector('.notification-icon');
    const messageElement = notification.querySelector('.notification-message');
    
    // Set icon and color based on type
    if (type === 'success') {
        icon.className = 'notification-icon fas fa-check-circle';
        icon.style.color = '#4caf50';
    } else if (type === 'error') {
        icon.className = 'notification-icon fas fa-exclamation-circle';
        icon.style.color = '#f44336';
    } else if (type === 'info') {
        icon.className = 'notification-icon fas fa-info-circle';
        icon.style.color = '#2196f3';
    }
    
    // Set message
    messageElement.textContent = message;
    
    // Show notification
    notification.classList.add('show');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Modal Functions
function showConfirmationModal(title, message, confirmCallback) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalFooter = document.getElementById('modal-footer');
    
    // Set title and message
    modalTitle.textContent = title;
    modalBody.innerHTML = `<p>${message}</p>`;
    
    // Set buttons
    modalFooter.innerHTML = `
        <button id="modal-cancel" class="btn secondary-btn">Cancel</button>
        <button id="modal-confirm" class="btn primary-btn">Confirm</button>
    `;
    
    // Add event listeners
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-confirm').addEventListener('click', () => {
        closeModal();
        confirmCallback();
    });
    
    // Show modal
    modal.classList.add('show');
}

function showLoadingModal(title, message) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalFooter = document.getElementById('modal-footer');
    
    // Set title and message
    modalTitle.textContent = title;
    modalBody.innerHTML = `
        <div class="loading-spinner" style="padding: 30px 0;">
            <div class="spinner"></div>
            <p>${message}</p>
        </div>
    `;
    
    // Clear footer
    modalFooter.innerHTML = '';
    
    // Show modal
    modal.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('show');
}

// Utility Functions
function getTimeRemaining(endTime) {
    const total = endTime - Date.now();
    
    if (total <= 0) {
        return 'Ended';
    }
    
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
    } else {
        return `${seconds} second${seconds > 1 ? 's' : ''} remaining`;
    }
}

function initParticles() {
    const particles = document.querySelectorAll('.particle');
    
    particles.forEach((particle, index) => {
        // Randomize starting positions
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        // Randomize animation parameters
        const animationDuration = 30 + Math.random() * 30; // 30-60s
        const animationDelay = Math.random() * 10; // 0-10s
        
        particle.style.animation = `float ${animationDuration}s ${animationDelay}s infinite linear`;
        particle.style.opacity = 0.3 + Math.random() * 0.5; // 0.3-0.8
        particle.style.transform = `scale(${0.5 + Math.random()})`;
    });
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        appState,
        initApp,
        navigateTo,
        showSection,
        updateNavButtons,
        toggleTheme,
        updateThemeToggleIcon,
        connectWallet,
        updateWalletUI,
        disconnectWallet,
        formatAddress,
        loadElections,
        createElectionCard,
        viewElectionDetails,
        loadCandidates,
        createCandidateCard,
        selectCandidate,
        castVote,
        loadElectionResults,
        createElection,
        addCandidateInput,
        loadUserProfile,
        loadUserElections,
        loadVotingHistory,
        showNotification,
        showConfirmationModal,
        showLoadingModal,
        closeModal,
        getTimeRemaining,
        initParticles
    };
}