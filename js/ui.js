// ===== BLOCKCHAIN VOTING SYSTEM UI SCRIPT =====
document.addEventListener('DOMContentLoaded', () => {
    // ===== GLOBAL VARIABLES =====
    let isWalletConnected = false;
    let currentAccount = null;
    let isElectionActive = true;
    let hasVoted = false;
    let isAdmin = false;
    let candidates = [];
    let totalVotes = 0;
    
    // Elements
    const navbar = document.querySelector('.navbar');
    const burgerMenu = document.querySelector('.burger-menu');
    const navLinks = document.querySelector('.nav-links');
    const statusIndicator = document.querySelector('.status-indicator');
    const walletAddressDisplay = document.querySelector('.wallet-address');
    const sections = document.querySelectorAll('.section');
    const navButtons = document.querySelectorAll('.nav-links a');
    const connectWalletBtn = document.querySelector('#connect-wallet-btn');
    const voterStatus = document.querySelector('.voter-status');
    
    // ===== INITIALIZATION =====
    initUI();
    
    function initUI() {
        // Initialize animations
        initBackgroundElements();
        initGlitchEffects();
        
        // Navigation and UI events
        setupNavigation();
        setupScrollEvents();
        
        // Blockchain events
        setupWalletEvents();
        setupBlockchainVisuals();
        
        // Load data
        loadMockCandidates();
        updateUI();
        
        // Show home section by default
        showSection('home');
    }
    
    // ===== ANIMATIONS & EFFECTS =====
    function initBackgroundElements() {
        const bgElements = document.querySelector('.bg-elements');
        if(!bgElements) return;
        
        // Create animated background cubes
        for(let i = 0; i < 5; i++) {
            const cube = document.createElement('div');
            cube.className = 'cube';
            bgElements.appendChild(cube);
        }
        
        // Add chain animation for blockchain visual
        const chain = document.querySelector('.chain');
        if(chain) {
            // Create blockchain blocks animation
            for(let i = 0; i < 20; i++) {
                const block = document.createElement('div');
                block.className = 'block';
                chain.appendChild(block);
            }
            
            // Clone for infinite animation
            const chainClone = chain.cloneNode(true);
            chainClone.style.left = '100%';
            document.querySelector('.blockchain-visual').appendChild(chainClone);
        }
    }
    
    function initGlitchEffects() {
        // Apply glitch effect to title
        const titleElements = document.querySelectorAll('.glitch');
        titleElements.forEach(el => {
            const text = el.textContent;
            el.setAttribute('data-text', text);
        });
        
        // Apply secondary glitch effect to subtitles
        const glitchTextElements = document.querySelectorAll('.glitch-text');
        glitchTextElements.forEach(el => {
            const text = el.textContent;
            el.setAttribute('data-text', text);
        });
    }
    
    function setupScrollEvents() {
        window.addEventListener('scroll', () => {
            // Add class to navbar when scrolling
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            // Add parallax effect to background elements
            const offset = window.scrollY;
            const bgCubes = document.querySelectorAll('.cube');
            
            bgCubes.forEach((cube, index) => {
                const speed = 0.1 + (index * 0.02);
                cube.style.transform = `translateY(${offset * speed}px) rotate(${offset * 0.02}deg)`;
            });
        });
    }
    
    // ===== NAVIGATION =====
    function setupNavigation() {
        // Mobile menu toggle
        burgerMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            // Animate burger menu
            const bars = burgerMenu.querySelectorAll('.bar');
            bars[0].style.transform = bars[0].style.transform === 'rotate(45deg) translate(5px, 5px)' ? '' : 'rotate(45deg) translate(5px, 5px)';
            bars[1].style.opacity = bars[1].style.opacity === '0' ? '1' : '0';
            bars[2].style.transform = bars[2].style.transform === 'rotate(-45deg) translate(5px, -5px)' ? '' : 'rotate(-45deg) translate(5px, -5px)';
        });
        
        // Navigation links
        navButtons.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Close mobile menu if open
                navLinks.classList.remove('active');
                
                // Get target section from href
                const targetId = link.getAttribute('href').substring(1);
                showSection(targetId);
                
                // Check if section requires wallet connection
                checkSectionAccess(targetId);
                
                // Update active state
                navButtons.forEach(btn => btn.classList.remove('active'));
                link.classList.add('active');
            });
        });
        
        // Default first link as active
        if(navButtons.length > 0) {
            navButtons[0].classList.add('active');
        }
    }
    
    function showSection(sectionId) {
        // Hide all sections
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if(targetSection) {
            targetSection.classList.add('active');
            
            // Special case for results section - initialize charts
            if(sectionId === 'results') {
                initResultsCharts();
            }
        }
    }
    
    function checkSectionAccess(sectionId) {
        // Check if wallet connection is required for this section
        const restrictedSections = ['candidates', 'results', 'admin'];
        
        if(restrictedSections.includes(sectionId) && !isWalletConnected) {
            // Show wallet connect modal
            showModal('connect-wallet-modal', 'Please connect your wallet to access this section');
            
            // If they cancel, redirect to home
            setTimeout(() => {
                if(!isWalletConnected) {
                    showSection('home');
                    navButtons.forEach(btn => btn.classList.remove('active'));
                    navButtons[0].classList.add('active');
                }
            }, 100);
        }
        
        // Only allow admin to access admin section
        if(sectionId === 'admin' && !isAdmin) {
            showToast('error', 'Access Denied', 'Admin access required');
            showSection('home');
        }
    }
    
    // ===== BLOCKCHAIN FUNCTIONALITY =====
    function setupWalletEvents() {
        // Connect wallet button
        connectWalletBtn.addEventListener('click', connectWallet);
    }
    
    function connectWallet() {
        // Simulating blockchain wallet connection with delay
        showToast('info', 'Connecting...', 'Please approve connection in your wallet');
        
        setTimeout(() => {
            // Simulate successful connection
            isWalletConnected = true;
            currentAccount = '0x' + Math.random().toString(16).slice(2, 12) + '...';
            
            // Update UI
            statusIndicator.classList.add('connected');
            walletAddressDisplay.textContent = currentAccount;
            connectWalletBtn.textContent = 'Wallet Connected';
            connectWalletBtn.classList.add('btn-connect');
            connectWalletBtn.classList.remove('btn-primary');
            
            // Randomly assign admin role (20% chance)
            isAdmin = Math.random() < 0.2;
            
            // Check if user has already voted (50% chance)
            hasVoted = Math.random() < 0.5;
            
            // Update UI based on voting status
            updateVoterStatus();
            
            // Show success message
            showToast('success', 'Connected!', 'Wallet connected successfully');
            
            // Enable admin section if admin
            if(isAdmin) {
                document.querySelector('.admin-section').style.display = 'block';
                showToast('info', 'Admin Access', 'You have admin privileges');
            }
            
            // Close modal if open
            closeModal();
        }, 1500);
    }
    
    function updateVoterStatus() {
        if(!voterStatus) return;
        
        if(!isWalletConnected) {
            voterStatus.innerHTML = 'Please connect your wallet to participate in the election.';
        } else if(hasVoted) {
            voterStatus.innerHTML = '<strong>Thank you for voting!</strong> Your vote has been recorded on the blockchain.';
            
            // Disable all vote buttons
            const voteButtons = document.querySelectorAll('.candidate-vote-btn');
            voteButtons.forEach(btn => {
                btn.disabled = true;
                btn.textContent = 'Vote Recorded';
            });
        } else if(!isElectionActive) {
            voterStatus.innerHTML = '<strong>Election has ended.</strong> Results are available in the Results section.';
            
            // Disable all vote buttons
            const voteButtons = document.querySelectorAll('.candidate-vote-btn');
            voteButtons.forEach(btn => {
                btn.disabled = true;
                btn.textContent = 'Election Ended';
            });
        } else {
            voterStatus.innerHTML = 'You are eligible to vote. Select a candidate to cast your vote.';
        }
    }
    
    function setupBlockchainVisuals() {
        // Setup blockchain visualization animations
        
        // Simulate new blocks being added every few seconds
        setInterval(() => {
            const blocks = document.querySelectorAll('.block');
            if(blocks.length === 0) return;
            
            // Randomly highlight a block as if a new transaction is being added
            const randomIndex = Math.floor(Math.random() * blocks.length);
            const block = blocks[randomIndex];
            
            // Add highlight animation
            block.style.borderColor = 'rgba(108, 114, 203, 0.8)';
            block.style.boxShadow = '0 0 15px rgba(108, 114, 203, 0.5)';
            
            // Reset after animation
            setTimeout(() => {
                block.style.borderColor = 'rgba(108, 114, 203, 0.2)';
                block.style.boxShadow = '0 8px 32px rgba(10, 6, 23, 0.1)';
            }, 2000);
        }, 3000);
    }
    
    // ===== CANDIDATES AND VOTING =====
    function loadMockCandidates() {
        // Mock candidate data
        candidates = [
            {
                id: 1,
                name: 'Alexander Nakamoto',
                party: 'Blockchain Party',
                image: 'https://placehold.co/400x400?text=Alex+N.',
                votes: Math.floor(Math.random() * 1000) + 500
            },
            {
                id: 2,
                name: 'Sarah Buterin',
                party: 'Crypto Alliance',
                image: 'https://placehold.co/400x400?text=Sarah+B.',
                votes: Math.floor(Math.random() * 1000) + 500
            },
            {
                id: 3,
                name: 'Michael Hoskinson',
                party: 'Digital Future',
                image: 'https://placehold.co/400x400?text=Michael+H.',
                votes: Math.floor(Math.random() * 1000) + 500
            },
            {
                id: 4,
                name: 'Emily Larimer',
                party: 'Consensus Coalition',
                image: 'https://placehold.co/400x400?text=Emily+L.',
                votes: Math.floor(Math.random() * 1000) + 500
            }
        ];
        
        // Calculate total votes
        totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
        
        // Populate candidates grid
        renderCandidates();
        
        // Populate results section
        renderResults();
    }
    
    function renderCandidates() {
        const candidatesGrid = document.querySelector('.candidates-grid');
        if(!candidatesGrid) return;
        
        candidatesGrid.innerHTML = '';
        
        // Show loading state first
        const loadingEl = document.createElement('div');
        loadingEl.className = 'loading-container';
        loadingEl.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading candidates from blockchain...</p>
        `;
        candidatesGrid.appendChild(loadingEl);
        
        // Simulate loading delay
        setTimeout(() => {
            candidatesGrid.innerHTML = '';
            
            // Add candidate cards
            candidates.forEach(candidate => {
                const candidateCard = document.createElement('div');
                candidateCard.className = 'candidate-card';
                candidateCard.innerHTML = `
                    <div class="candidate-image">
                        <img src="${candidate.image}" alt="${candidate.name}">
                    </div>
                    <div class="candidate-details">
                        <h3 class="candidate-name">${candidate.name}</h3>
                        <p class="candidate-party">${candidate.party}</p>
                        <button class="btn btn-primary candidate-vote-btn" data-id="${candidate.id}">
                            Vote for ${candidate.name.split(' ')[0]}
                        </button>
                    </div>
                `;
                candidatesGrid.appendChild(candidateCard);
                
                // Add voting functionality to button
                const voteBtn = candidateCard.querySelector('.candidate-vote-btn');
                voteBtn.addEventListener('click', () => voteForCandidate(candidate.id));
                
                // Disable button if already voted or election ended
                if(hasVoted) {
                    voteBtn.disabled = true;
                    voteBtn.textContent = 'Vote Recorded';
                } else if(!isElectionActive) {
                    voteBtn.disabled = true;
                    voteBtn.textContent = 'Election Ended';
                }
            });
        }, 1500);
    }
    
    function voteForCandidate(candidateId) {
        if(!isWalletConnected) {
            showToast('error', 'Wallet Required', 'Please connect your wallet to vote');
            return;
        }
        
        if(hasVoted) {
            showToast('warning', 'Already Voted', 'You have already cast your vote');
            return;
        }
        
        if(!isElectionActive) {
            showToast('warning', 'Election Ended', 'This election has ended');
            return;
        }
        
        // Show confirmation modal
        const candidate = candidates.find(c => c.id === candidateId);
        showConfirmationModal(
            'Confirm Vote',
            `You are about to vote for <strong>${candidate.name}</strong> of the <strong>${candidate.party}</strong>.<br><br>This action cannot be undone. Do you wish to proceed?`,
            () => processVote(candidateId)
        );
    }
    
    function processVote(candidateId) {
        // Show loading state
        showToast('info', 'Processing Vote', 'Your vote is being recorded on the blockchain...');
        
        // Simulate blockchain transaction delay
        setTimeout(() => {
            // Update candidate votes
            const candidateIndex = candidates.findIndex(c => c.id === candidateId);
            if(candidateIndex !== -1) {
                candidates[candidateIndex].votes += 1;
                totalVotes += 1;
            }
            
            // Update voter status
            hasVoted = true;
            updateVoterStatus();
            
            // Update results section
            renderResults();
            
            // Show success message with transaction animation
            showToast('success', 'Vote Recorded!', 'Your vote has been successfully recorded on the blockchain');
            
            // Add blockchain pulse animation
            pulseBlockchainAnimation();
        }, 3000);
    }
    
    function pulseBlockchainAnimation() {
        // Get random block from chain visualization
        const blocks = document.querySelectorAll('.block');
        if(blocks.length === 0) return;
        
        // Create new block effect
        const newBlock = document.createElement('div');
        newBlock.className = 'block';
        newBlock.style.position = 'fixed';
        newBlock.style.top = '50%';
        newBlock.style.left = '50%';
        newBlock.style.transform = 'translate(-50%, -50%)';
        newBlock.style.width = '200px';
        newBlock.style.height = '200px';
        newBlock.style.backgroundColor = 'rgba(108, 114, 203, 0.2)';
        newBlock.style.borderColor = 'rgba(108, 114, 203, 0.8)';
        newBlock.style.boxShadow = '0 0 30px rgba(108, 114, 203, 0.8)';
        newBlock.style.zIndex = '1000';
        document.body.appendChild(newBlock);
        
        // Add text inside
        const blockContent = document.createElement('div');
        blockContent.style.position = 'absolute';
        blockContent.style.top = '50%';
        blockContent.style.left = '50%';
        blockContent.style.transform = 'translate(-50%, -50%)';
        blockContent.style.textAlign = 'center';
        blockContent.innerHTML = `
            <div style="font-family: var(--font-heading); font-size: 1rem; margin-bottom: 0.5rem;">VOTE TRANSACTION</div>
            <div style="font-family: monospace; font-size: 0.8rem; color: var(--primary-color);">
                0x${Math.random().toString(16).slice(2, 10)}...
            </div>
        `;
        newBlock.appendChild(blockContent);
        
        // Animate block
        setTimeout(() => {
            newBlock.style.transition = 'all 1s cubic-bezier(0.19, 1, 0.22, 1)';
            newBlock.style.opacity = '0';
            newBlock.style.transform = 'translate(-50%, -50%) scale(0.5)';
        }, 1500);
        
        // Remove block after animation
        setTimeout(() => {
            document.body.removeChild(newBlock);
        }, 2500);
    }
    
    // ===== RESULTS VISUALIZATION =====
    function renderResults() {
        // Update total vote counter
        const voteCounter = document.querySelector('.vote-counter span:first-child');
        if(voteCounter) {
            // Animate counter
            animateCounter(voteCounter, totalVotes);
        }
        
        // Sort candidates by votes (highest first)
        const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);
        
        // Update results list
        const resultsList = document.querySelector('.results-list');
        if(resultsList) {
            resultsList.innerHTML = '';
            
            sortedCandidates.forEach((candidate, index) => {
                const percentage = (candidate.votes / totalVotes * 100).toFixed(1);
                
                const resultCard = document.createElement('div');
                resultCard.className = 'result-card';
                resultCard.innerHTML = `
                    <div class="result-position">${index + 1}</div>
                    <div class="result-info">
                        <h4 class="result-name">${candidate.name}</h4>
                        <p class="result-party">${candidate.party}</p>
                        <div class="result-votes">
                            <div class="vote-bar">
                                <div class="vote-fill" style="width: ${percentage}%"></div>
                            </div>
                            <span class="vote-percentage">${percentage}%</span>
                        </div>
                    </div>
                `;
                resultsList.appendChild(resultCard);
            });
        }
        
        // Update winners section
        const winnersDisplay = document.querySelector('.winners-display');
        if(winnersDisplay) {
            winnersDisplay.innerHTML = '';
            
            // Get winner (highest votes)
            const winner = sortedCandidates[0];
            
            const winnerCard = document.createElement('div');
            winnerCard.className = 'winner-card';
            winnerCard.innerHTML = `
                <div class="winner-badge">WINNER</div>
                <div class="winner-image">
                    <img src="${winner.image}" alt="${winner.name}">
                </div>
                <h3 class="winner-name">${winner.name}</h3>
                <p class="winner-party">${winner.party}</p>
                <p class="winner-votes">
                    <span>${winner.votes}</span> votes
                </p>
            `;
            winnersDisplay.appendChild(winnerCard);
        }
    }
    
    function initResultsCharts() {
        // This function would typically use a charting library like Chart.js
        // Here we're just simulating with CSS for simplicity
        const chartContainer = document.querySelector('.results-chart-container');
        if(!chartContainer) return;
        
        // Create a simple CSS-based bar chart
        chartContainer.innerHTML = '';
        
        const chart = document.createElement('div');
        chart.style.display = 'flex';
        chart.style.alignItems = 'flex-end';
        chart.style.justifyContent = 'space-around';
        chart.style.height = '100%';
        chart.style.padding = '1rem';
        chartContainer.appendChild(chart);
        
        // Sort candidates by votes
        const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);
        
        // Get max votes for scaling
        const maxVotes = Math.max(...sortedCandidates.map(c => c.votes));
        
        // Add bars for each candidate
        sortedCandidates.forEach(candidate => {
            const barHeight = (candidate.votes / maxVotes * 100).toFixed(1);
            
            const barContainer = document.createElement('div');
            barContainer.style.display = 'flex';
            barContainer.style.flexDirection = 'column';
            barContainer.style.alignItems = 'center';
            barContainer.style.width = `${100 / candidates.length - 5}%`;
            
            const bar = document.createElement('div');
            bar.style.width = '100%';
            bar.style.height = '0';
            bar.style.background = 'linear-gradient(180deg, var(--primary-color), var(--secondary-color))';
            bar.style.borderRadius = '5px 5px 0 0';
            bar.style.position = 'relative';
            bar.style.transition = 'height 1.5s cubic-bezier(0.19, 1, 0.22, 1)';
            
            const label = document.createElement('div');
            label.style.marginTop = '0.5rem';
            label.style.fontSize = '0.8rem';
            label.style.fontWeight = '500';
            label.style.textAlign = 'center';
            label.innerHTML = `${candidate.name.split(' ')[0]}<br>${candidate.votes} votes`;
            
            barContainer.appendChild(bar);
            barContainer.appendChild(label);
            chart.appendChild(barContainer);
            
            // Animate bar height after small delay
            setTimeout(() => {
                bar.style.height = `${barHeight}%`;
                
                // Add vote count on top of bar
                const voteCount = document.createElement('div');
                voteCount.style.position = 'absolute';
                voteCount.style.top = '-25px';
                voteCount.style.left = '0';
                voteCount.style.width = '100%';
                voteCount.style.textAlign = 'center';
                voteCount.style.fontSize = '0.8rem';
                voteCount.style.fontWeight = '700';
                voteCount.textContent = `${barHeight}%`;
                bar.appendChild(voteCount);
            }, 100);
        });
    }
    
    function animateCounter(element, targetValue) {
        // Animate number counting up
        const duration = 1500;
        const startValue = parseInt(element.textContent) || 0;
        const increment = Math.ceil((targetValue - startValue) / (duration / 16));
        let currentValue = startValue;
        
        const updateCounter = () => {
            currentValue += increment;
            if(currentValue >= targetValue) {
                element.textContent = targetValue.toLocaleString();
                return;
            }
            
            element.textContent = currentValue.toLocaleString();
            requestAnimationFrame(updateCounter);
        };
        
        updateCounter();
    }
    
    // ===== ADMIN FUNCTIONALITY =====
    document.addEventListener('click', (e) => {
        // Add candidate form submission
        if(e.target.matches('#add-candidate-btn')) {
            e.preventDefault();
            const nameInput = document.querySelector('#candidate-name');
            const partyInput = document.querySelector('#candidate-party');
            
            if(nameInput.value && partyInput.value) {
                // Add new candidate to list
                const newId = candidates.length + 1;
                candidates.push({
                    id: newId,
                    name: nameInput.value,
                    party: partyInput.value,
                    image: `https://placehold.co/400x400?text=${nameInput.value.split(' ')[0]}`,
                    votes: 0
                });
                
                // Clear form
                nameInput.value = '';
                partyInput.value = '';
                
                // Update UI
                renderCandidates();
                
                // Show success message
                showToast('success', 'Candidate Added', 'New candidate has been added successfully');
            } else {
                showToast('error', 'Validation Error', 'Please fill in all fields');
            }
        }
        
        // Election control buttons
        if(e.target.matches('#start-election-btn')) {
            isElectionActive = true;
            showToast('success', 'Election Started', 'The election is now active');
            updateVoterStatus();
            updateElectionStatus();
        }
        
        if(e.target.matches('#end-election-btn')) {
            isElectionActive = false;
            showToast('warning', 'Election Ended', 'The election has been ended');
            updateVoterStatus();
            updateElectionStatus();
        }
        
        // Reset voting (for demo purposes)
        if(e.target.matches('#reset-votes-btn')) {
            // Reset all votes
            candidates.forEach(c => c.votes = 0);
            totalVotes = 0;
            hasVoted = false;
            
            // Update UI
            updateVoterStatus();
            renderCandidates();
            renderResults();
            
            showToast('info', 'Votes Reset', 'All votes have been reset for demonstration purposes');
        }
    });
    
    function updateElectionStatus() {
        // Update election status indicator
        const statusValue = document.querySelector('.status-value');
        if(statusValue) {
            statusValue.textContent = isElectionActive ? 'Active' : 'Closed';
            statusValue.classList.toggle('active', isElectionActive);
        }
    }
    
    // ===== UI UTILITIES =====
    function showModal(modalId, message = null) {
        const modal = document.getElementById(modalId);
        if(!modal) return;
        
        // Set custom message if provided
        if(message && modal.querySelector('.modal-body')) {
            modal.querySelector('.modal-body').innerHTML = message;
        }
        
        // Show modal
        modal.style.display = 'block';
        
        // Add close events
        const closeButtons = modal.querySelectorAll('.close-modal, .cancel-btn');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', closeModal);
        });
    }
    
    function showConfirmationModal(title, message, confirmCallback) {
        // Create modal if it doesn't exist
        let confirmModal = document.getElementById('confirm-modal');
        
        if(!confirmModal) {
            confirmModal = document.createElement('div');
            confirmModal.id = 'confirm-modal';
            confirmModal.className = 'modal';
            confirmModal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <div class="modal-header">
                        <h3></h3>
                    </div>
                    <div class="modal-body"></div>
                    <div class="modal-footer">
                        <button class="btn btn-connect cancel-btn">Cancel</button>
                        <button class="btn btn-primary confirm-btn">Confirm</button>
                    </div>
                </div>
            `;
            document.body.appendChild(confirmModal);
        }
        
        // Set content
        confirmModal.querySelector('.modal-header h3').textContent = title;
        confirmModal.querySelector('.modal-body').innerHTML = message;
        
        // Show modal
        confirmModal.style.display = 'block';
        
        // Add event listeners
        confirmModal.querySelector('.close-modal').addEventListener('click', closeModal);
        confirmModal.querySelector('.cancel-btn').addEventListener('click', closeModal);
        
        // Remove any existing confirm listeners and add new one
        const confirmBtn = confirmModal.querySelector('.confirm-btn');
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        newConfirmBtn.addEventListener('click', () => {
            closeModal();
            if(typeof confirmCallback === 'function') {
                confirmCallback();
            }
        });
    }
    
    function closeModal() {
        // Close all modals
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if(e.target.classList.contains('modal')) {
            closeModal();
        }
    });
    
    function showToast(type, title, message) {
        // Create toast container if not exists
        let toastContainer = document.querySelector('.toast-container');
        if(!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Set icon based on type
        let icon = '';
        switch(type) {
            case 'success':
                icon = '✓';
                break;
            case 'error':