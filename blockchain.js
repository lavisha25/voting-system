// blockchain.js - Blockchain interaction functionality for DecentralVote

// Smart Contract ABI - defines the interface to interact with our smart contract
const VotingSystemABI = [
    // Election factory methods
    {
        "inputs": [
            { "name": "name", "type": "string" },
            { "name": "description", "type": "string" },
            { "name": "endTime", "type": "uint256" },
            { "name": "candidates", "type": "tuple[]", "components": [
                { "name": "name", "type": "string" },
                { "name": "description", "type": "string" }
            ]},
            { "name": "whitelist", "type": "address[]" }
        ],
        "name": "createElection",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getActiveElections",
        "outputs": [{ "name": "", "type": "tuple[]", "components": [
            { "name": "id", "type": "uint256" },
            { "name": "name", "type": "string" },
            { "name": "description", "type": "string" },
            { "name": "creator", "type": "address" },
            { "name": "endTime", "type": "uint256" },
            { "name": "isWhitelistOnly", "type": "bool" }
        ]}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "electionId", "type": "uint256" }],
        "name": "getElection",
        "outputs": [{ "name": "", "type": "tuple", "components": [
            { "name": "id", "type": "uint256" },
            { "name": "name", "type": "string" },
            { "name": "description", "type": "string" },
            { "name": "creator", "type": "address" },
            { "name": "endTime", "type": "uint256" },
            { "name": "isWhitelistOnly", "type": "bool" }
        ]}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "electionId", "type": "uint256" }],
        "name": "getCandidates",
        "outputs": [{ "name": "", "type": "tuple[]", "components": [
            { "name": "name", "type": "string" },
            { "name": "description", "type": "string" }
        ]}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "electionId", "type": "uint256" }],
        "name": "getElectionResults",
        "outputs": [{ "name": "", "type": "uint256[]" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "electionId", "type": "uint256" },
            { "name": "candidateId", "type": "uint256" }
        ],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "electionId", "type": "uint256" },
            { "name": "voter", "type": "address" }
        ],
        "name": "hasVoted",
        "outputs": [{ "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "creator", "type": "address" }],
        "name": "getElectionsByCreator",
        "outputs": [{ "name": "", "type": "tuple[]", "components": [
            { "name": "id", "type": "uint256" },
            { "name": "name", "type": "string" },
            { "name": "description", "type": "string" },
            { "name": "creator", "type": "address" },
            { "name": "endTime", "type": "uint256" },
            { "name": "isWhitelistOnly", "type": "bool" }
        ]}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "voter", "type": "address" }],
        "name": "getVotingHistory",
        "outputs": [{ "name": "", "type": "tuple[]", "components": [
            { "name": "electionId", "type": "uint256" },
            { "name": "candidateId", "type": "uint256" },
            { "name": "timestamp", "type": "uint256" }
        ]}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "voter", "type": "address" }],
        "name": "getUserStats",
        "outputs": [
            { "name": "electionsCreated", "type": "uint256" },
            { "name": "electionsParticipated", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];






async function closeElection(electionId) {
    const accounts = await web3.eth.getAccounts();
    return votingSystemContract.methods.closeElection(electionId).send({ from: accounts[0] });
}









// Contract address on the blockchain network
const CONTRACT_ADDRESS = '0x123456789abcdef123456789abcdef123456789'; // Replace with actual contract address

// Global Web3 and Contract instances
let web3;
let votingSystemContract;

// Initialize Web3 and connect to blockchain
async function initWeb3() {
    // Check if MetaMask is installed
    if (window.ethereum) {
        try {
            // Modern dapp browsers
            web3 = new Web3(window.ethereum);
            console.log('Web3 initialized using window.ethereum');
            
            // Initialize contract
            votingSystemContract = new web3.eth.Contract(VotingSystemABI, CONTRACT_ADDRESS);
            
            return true;
        } catch (error) {
            console.error('Error initializing Web3:', error);
            throw new Error('Failed to initialize Web3: ' + error.message);
        }
    } 
    // Legacy dapp browsers
    else if (window.web3) {
        web3 = new Web3(window.web3.currentProvider);
        console.log('Web3 initialized using legacy web3.currentProvider');
        
        // Initialize contract
        votingSystemContract = new web3.eth.Contract(VotingSystemABI, CONTRACT_ADDRESS);
        
        return true;
    } 
    // Non-dapp browsers
    else {
        throw new Error('Non-Ethereum browser detected. Please install MetaMask or another wallet.');
    }
}

// Request wallet connection from user
async function requestWalletConnection() {
    if (!web3) {
        throw new Error('Web3 not initialized');
    }
    
    try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        
        console.log('Wallet connected:', account);
        return account;
    } catch (error) {
        console.error('Error connecting wallet:', error);
        throw new Error('User denied account access or another wallet error occurred');
    }
}

// Get active elections from the blockchain
async function getActiveElections() {
    if (!votingSystemContract) {
        throw new Error('Contract not initialized');
    }
    
    try {
        const elections = await votingSystemContract.methods.getActiveElections().call();
        console.log('Active elections:', elections);
        
        // Format the returned data for frontend use
        return elections.map(election => ({
            id: election.id,
            name: election.name,
            description: election.description,
            creator: election.creator,
            endTime: parseInt(election.endTime),
            isWhitelistOnly: election.isWhitelistOnly
        }));
    } catch (error) {
        console.error('Error fetching active elections:', error);
        throw new Error('Failed to fetch active elections');
    }
}

// Get candidates for a specific election
async function getCandidates(electionId) {
    if (!votingSystemContract) {
        throw new Error('Contract not initialized');
    }
    
    try {
        const candidates = await votingSystemContract.methods.getCandidates(electionId).call();
        console.log(`Candidates for election ${electionId}:`, candidates);
        
        return candidates;
    } catch (error) {
        console.error(`Error fetching candidates for election ${electionId}:`, error);
        throw new Error('Failed to fetch candidates');
    }
}

// Check if an address has voted in a specific election
async function hasVoted(electionId, address) {
    if (!votingSystemContract || !address) {
        throw new Error('Contract not initialized or address not provided');
    }
    
    try {
        const voted = await votingSystemContract.methods.hasVoted(electionId, address).call();
        console.log(`Has ${address} voted in election ${electionId}:`, voted);
        
        return voted;
    } catch (error) {
        console.error(`Error checking if ${address} voted in election ${electionId}:`, error);
        throw new Error('Failed to check voting status');
    }
}

// Get election results
async function getElectionResults(electionId) {
    if (!votingSystemContract) {
        throw new Error('Contract not initialized');
    }
    
    try {
        const results = await votingSystemContract.methods.getElectionResults(electionId).call();
        console.log(`Results for election ${electionId}:`, results);
        
        // Convert results from string to numbers
        return results.map(count => parseInt(count));
    } catch (error) {
        console.error(`Error fetching results for election ${electionId}:`, error);
        throw new Error('Failed to fetch election results');
    }
}

// Vote in an election
async function vote(electionId, candidateId) {
    if (!votingSystemContract) {
        throw new Error('Contract not initialized');
    }
    
    try {
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        
        console.log(`Voting in election ${electionId} for candidate ${candidateId} from account ${account}`);
        
        // Estimate gas to ensure the transaction will succeed
        const gasEstimate = await votingSystemContract.methods.vote(electionId, candidateId)
            .estimateGas({ from: account });
        
        // Send the transaction
        const receipt = await votingSystemContract.methods.vote(electionId, candidateId)
            .send({
                from: account,
                gas: Math.floor(gasEstimate * 1.2) // Add 20% buffer to gas estimate
            });
        
        console.log('Vote transaction receipt:', receipt);
        return receipt;
    } catch (error) {
        console.error('Error voting:', error);
        
        // Handle specific error cases
        if (error.message.includes('already voted')) {
            throw new Error('You have already voted in this election');
        } else if (error.message.includes('election ended')) {
            throw new Error('This election has already ended');
        } else if (error.message.includes('not whitelisted')) {
            throw new Error('You are not whitelisted for this election');
        } else {
            throw new Error('Failed to cast vote: ' + error.message);
        }
    }
}

// Deploy a new election
async function deployElection(name, description, endTime, candidates, whitelist) {
    if (!votingSystemContract) {
        throw new Error('Contract not initialized');
    }
    
    try {
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        
        console.log('Creating election:', {
            name,
            description,
            endTime,
            candidates,
            whitelist
        });
        
        // Format candidates for the contract
        const formattedCandidates = candidates.map(candidate => ({
            name: candidate.name,
            description: candidate.description || ''
        }));
        
        // Use empty array if no whitelist
        const formattedWhitelist = whitelist && whitelist.length > 0 ? whitelist : [];
        
        // Estimate gas to ensure the transaction will succeed
        const gasEstimate = await votingSystemContract.methods.createElection(
            name,
            description,
            endTime,
            formattedCandidates,
            formattedWhitelist
        ).estimateGas({ from: account });
        
        // Send the transaction
        const receipt = await votingSystemContract.methods.createElection(
            name,
            description,
            endTime,
            formattedCandidates,
            formattedWhitelist
        ).send({
            from: account,
            gas: Math.floor(gasEstimate * 1.2) // Add 20% buffer to gas estimate
        });
        
        console.log('Election creation receipt:', receipt);
        return receipt;
    } catch (error) {
        console.error('Error creating election:', error);
        throw new Error('Failed to create election: ' + error.message);
    }
}

// Get elections created by a specific address
async function getUserElections(address) {
    if (!votingSystemContract || !address) {
        throw new Error('Contract not initialized or address not provided');
    }
    
    try {
        const elections = await votingSystemContract.methods.getElectionsByCreator(address).call();
        console.log(`Elections created by ${address}:`, elections);
        
        // Format the returned data for frontend use
        return elections.map(election => ({
            id: election.id,
            name: election.name,
            description: election.description,
            creator: election.creator,
            endTime: parseInt(election.endTime),
            isWhitelistOnly: election.isWhitelistOnly
        }));
    } catch (error) {
        console.error(`Error fetching elections created by ${address}:`, error);
        throw new Error('Failed to fetch user elections');
    }
}

// Get voting history for a specific address
async function getVotingHistory(address) {
    if (!votingSystemContract || !address) {
        throw new Error('Contract not initialized or address not provided');
    }
    
    try {
        const history = await votingSystemContract.methods.getVotingHistory(address).call();
        console.log(`Voting history for ${address}:`, history);
        
        // This requires additional processing to get election and candidate names
        const enhancedHistory = await Promise.all(history.map(async vote => {
            // Get election details
            const election = await votingSystemContract.methods.getElection(vote.electionId).call();
            
            // Get candidate details
            const candidates = await votingSystemContract.methods.getCandidates(vote.electionId).call();
            const candidate = candidates[vote.candidateId];
            
            return {
                electionId: vote.electionId,
                candidateId: vote.candidateId,
                timestamp: parseInt(vote.timestamp),
                election: election,
                electionName: election.name,
                candidateName: candidate ? candidate.name : 'Unknown Candidate'
            };
        }));
        
        return enhancedHistory;
    } catch (error) {
        console.error(`Error fetching voting history for ${address}:`, error);
        throw new Error('Failed to fetch voting history');
    }
}

// Get user statistics
async function getUserStats(address) {
    if (!votingSystemContract || !address) {
        throw new Error('Contract not initialized or address not provided');
    }
    
    try {
        const stats = await votingSystemContract.methods.getUserStats(address).call();
        console.log(`Stats for ${address}:`, stats);
        
        return {
            created: parseInt(stats.electionsCreated),
            participated: parseInt(stats.electionsParticipated)
        };
    } catch (error) {
        console.error(`Error fetching stats for ${address}:`, error);
        throw new Error('Failed to fetch user stats');
    }
}

// Listen for MetaMask account changes
function setupAccountChangeListener() {
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            console.log('MetaMask account changed:', accounts[0]);
            
            // If no accounts, user disconnected their wallet
            if (accounts.length === 0) {
                // Handle disconnection in the UI
                if (typeof disconnectWallet === 'function') {
                    disconnectWallet();
                }
            } else {
                // Handle account change in the UI
                const newAccount = accounts[0];
                
                // Update state and UI with new account
                if (typeof appState !== 'undefined') {
                    appState.wallet.address = newAccount;
                    
                    // Update UI if updateWalletUI function exists
                    if (typeof updateWalletUI === 'function') {
                        updateWalletUI();
                    }
                    
                    // Reload user profile if on profile page
                    if (appState.currentSection === 'user-profile' && typeof loadUserProfile === 'function') {
                        loadUserProfile();
                    }
                    
                    // If on voting page, reload elections
                    if (appState.currentSection === 'voting' && typeof loadElections === 'function') {
                        loadElections();
                    }
                }
            }
        });
        
        // Listen for chain/network changes
        window.ethereum.on('chainChanged', (chainId) => {
            console.log('MetaMask network changed. Reloading page...');
            window.location.reload();
        });
    }
}

// Initialize blockchain connection when app starts
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Web3 and set up event listeners
    initWeb3()
        .then(() => {
            console.log('Blockchain connection initialized');
            setupAccountChangeListener();
        })
        .catch(error => {
            console.error('Failed to initialize blockchain connection:', error);
        });
});

// Mock implementations for development/testing without a real blockchain
// These functions will be replaced with real implementations in production
function createMockData() {
    // Mock elections
    const mockElections = [
        {
            id: 1,
            name: 'City Council Election',
            description: 'Vote for your preferred city council candidate for the 2025-2026 term.',
            creator: '0x1234567890123456789012345678901234567890',
            endTime: Math.floor(Date.now() / 1000) + 86400 * 3, // 3 days from now
            isWhitelistOnly: false
        },
        {
            id: 2,
            name: 'Community Fund Allocation',
            description: 'How should we allocate the community development fund for next quarter?',
            creator: '0x2345678901234567890123456789012345678901',
            endTime: Math.floor(Date.now() / 1000) + 86400 * 2, // 2 days from now
            isWhitelistOnly: true
        },
        {
            id: 3,
            name: 'Board Member Selection',
            description: 'Select new board members for the neighborhood association.',
            creator: '0x1234567890123456789012345678901234567890',
            endTime: Math.floor(Date.now() / 1000) - 86400, // 1 day ago (ended)
            isWhitelistOnly: false
        }
    ];
    
    // Mock candidates
    const mockCandidates = {
        1: [
            { name: 'Jane Smith', description: 'Focusing on infrastructure and public safety.' },
            { name: 'John Doe', description: 'Advocating for small businesses and economic growth.' },
            { name: 'Alice Johnson', description: 'Prioritizing education and community services.' }
        ],
        2: [
            { name: 'Parks and Recreation', description: 'Improve community parks and recreation facilities.' },
            { name: 'Road Infrastructure', description: 'Fix potholes and improve road conditions.' },
            { name: 'Community Center', description: 'Renovate the central community center.' },
            { name: 'Public Safety', description: 'Increase public safety measures and lighting.' }
        ],
        3: [
            { name: 'Robert Wilson', description: 'Experienced in community management.' },
            { name: 'Maria Garcia', description: 'Background in financial planning.' },
            { name: 'David Chen', description: 'Expertise in urban development.' }
        ]
    };
    
    // Mock results
    const mockResults = {
        1: [12, 8, 15],
        2: [25, 18, 30, 12],
        3: [45, 52, 38]
    };
    
    // Mock user elections
    const mockUserElections = {
        '0x1234567890123456789012345678901234567890': [mockElections[0], mockElections[2]],
        '0x2345678901234567890123456789012345678901': [mockElections[1]]
    };
    
    // Mock voting history
    const mockVotingHistory = {
        '0x1234567890123456789012345678901234567890': [
            {
                electionId: 2,
                candidateId: 0,
                timestamp: Math.floor(Date.now() / 1000) - 86400 * 2,
                election: mockElections[1],
                electionName: mockElections[1].name,
                candidateName: mockCandidates[2][0].name
            }
        ],
        '0x2345678901234567890123456789012345678901': [
            {
                electionId: 1,
                candidateId: 2,
                timestamp: Math.floor(Date.now() / 1000) - 86400 * 1,
                election: mockElections[0],
                electionName: mockElections[0].name,
                candidateName: mockCandidates[1][2].name
            },
            {
                electionId: 3,
                candidateId: 1,
                timestamp: Math.floor(Date.now() / 1000) - 86400 * 3,
                election: mockElections[2],
                electionName: mockElections[2].name,
                candidateName: mockCandidates[3][1].name
            }
        ]
    };
    
    // Mock votes (which addresses have voted in which elections)
    const mockVotes = {
        1: {
            '0x2345678901234567890123456789012345678901': true
        },
        2: {
            '0x1234567890123456789012345678901234567890': true
        },
        3: {
            '0x2345678901234567890123456789012345678901': true,
            '0x1234567890123456789012345678901234567890': true
        }
    };
    
    // Mock user stats
    const mockUserStats = {
        '0x1234567890123456789012345678901234567890': {
            created: 2,
            participated: 1
        },
        '0x2345678901234567890123456789012345678901': {
            created: 1,
            participated: 2
        }
    };
    
    return {
        elections: mockElections,
        candidates: mockCandidates,
        results: mockResults,
        userElections: mockUserElections,
        votingHistory: mockVotingHistory,
        votes: mockVotes,
        userStats: mockUserStats
    };
}

// If no web3 available, use mock data for development
const mockData = createMockData();

// Mock implementations of blockchain functions (used if real blockchain not available)
// These allow for testing UI without a real blockchain connection
async function mockGetActiveElections() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockData.elections.filter(e => Date.now() < e.endTime * 1000));
        }, 800); // Simulate network delay
    });
}

async function mockGetCandidates(electionId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const candidates = mockData.candidates[electionId];
            if (candidates) {
                resolve(candidates);
            } else {
                reject(new Error('Election not found'));
            }
        }, 600);
    });
}

async function mockHasVoted(electionId, address) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const electionVotes = mockData.votes[electionId] || {};
            resolve(!!electionVotes[address]);
        }, 500);
    });
}

async function mockGetElectionResults(electionId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const results = mockData.results[electionId];
            if (results) {
                resolve(results);
            } else {
                reject(new Error('Election results not found'));
            }
        }, 700);
    });
}

async function mockVote(electionId, candidateId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const currentAccount = appState.wallet.address;
            
            // Check if already voted
            if (mockData.votes[electionId] && mockData.votes[electionId][currentAccount]) {
                reject(new Error('You have already voted in this election'));
                return;
            }
            
            // Check if election ended
            const election = mockData.elections.find(e => e.id === parseInt(electionId));
            if (election && Date.now() > election.endTime * 1000) {
                reject(new Error('This election has already ended'));
                return;
            }
            
            // Record vote
            if (!mockData.votes[electionId]) {
                mockData.votes[electionId] = {};
            }
            mockData.votes[electionId][currentAccount] = true;
            
            // Update results
            if (!mockData.results[electionId]) {
                mockData.results[electionId] = Array(mockData.candidates[electionId].length).fill(0);
            }
            mockData.results[electionId][candidateId]++;
            
            // Update voting history
            if (!mockData.votingHistory[currentAccount]) {
                mockData.votingHistory[currentAccount] = [];
            }
            
            mockData.votingHistory[currentAccount].push({
                electionId: parseInt(electionId),
                candidateId: parseInt(candidateId),
                timestamp: Math.floor(Date.now() / 1000),
                election: election,
                electionName: election.name,
                candidateName: mockData.candidates[electionId][candidateId].name
            });
            
            // Update user stats
            if (!mockData.userStats[currentAccount]) {
                mockData.userStats[currentAccount] = { created: 0, participated: 0 };
            }
            mockData.userStats[currentAccount].participated++;
            
            resolve({ status: true, transactionHash: '0x' + Math.random().toString(16).substr(2, 64) });
        }, 1500);
    });
}

async function mockDeployElection(name, description, endTime, candidates, whitelist) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const currentAccount = appState.wallet.address;
            
            // Create new election ID
            const newId = Math.max(...Object.keys(mockData.candidates).map(id => parseInt(id))) + 1;
            
            // Add election
            const newElection = {
                id: newId,
                name,
                description,
                creator: currentAccount,
                endTime,
                isWhitelistOnly: whitelist && whitelist.length > 0
            };
            
            mockData.elections.push(newElection);
            
            // Add candidates
            mockData.candidates[newId] = candidates;
            
            // Initialize results
            mockData.results[newId] = Array(candidates.length).fill(0);
            
            // Add to user elections
            if (!mockData.userElections[currentAccount]) {
                mockData.userElections[currentAccount] = [];
            }
            mockData.userElections[currentAccount].push(newElection);
            
            // Update user stats
            if (!mockData.userStats[currentAccount]) {
                mockData.userStats[currentAccount] = { created: 0, participated: 0 };
            }
            mockData.userStats[currentAccount].created++;
            
            resolve({ status: true, transactionHash: '0x' + Math.random().toString(16).substr(2, 64) });
        }, 2000);
    });
}

async function mockGetUserElections(address) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockData.userElections[address] || []);
        }, 800);
    });
}

async function mockGetVotingHistory(address) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockData.votingHistory[address] || []);
        }, 700);
    });
}

async function mockGetUserStats(address) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockData.userStats[address] || { created: 0, participated: 0 });
        }, 500);
    });
}

// Determine which implementation to use based on availability of web3
function determineImplementation() {
    // If Web3 is unavailable, use mock implementations
    if (typeof web3 === 'undefined' || !web3 || !votingSystemContract) {
        console.warn('Using mock blockchain implementation for development');
        
        // Override functions with mock implementations
        window.getActiveElections = mockGetActiveElections;
        window.getCandidates = mockGetCandidates;
        window.hasVoted = mockHasVoted;
        window.getElectionResults = mockGetElectionResults;
        window.vote = mockVote;
        window.deployElection = mockDeployElection;
        window.getUserElections = mockGetUserElections;
        window.getVotingHistory = mockGetVotingHistory;
        window.getUserStats = mockGetUserStats;
        
        // Mock wallet connection for development
        window.requestWalletConnection = async function() {
            return '0x1234567890123456789012345678901234567890';
        };
    } else {
        // Use real blockchain implementations
        window.getActiveElections = getActiveElections;
        window.getCandidates = getCandidates;
        window.hasVoted = hasVoted;
        window.getElectionResults = getElectionResults;
        window.vote = vote;
        window.deployElection = deployElection;
        window.getUserElections = getUserElections;
        window.getVotingHistory = getVotingHistory;
        window.getUserStats = getUserStats;
        window.requestWalletConnection = requestWalletConnection;
    }
}

// Export functions for use in app.js
window.initWeb3 = initWeb3;
window.determineImplementation = determineImplementation;

// Automatically determine implementation after Web3
// Automatically determine implementation after Web3 initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Web3 and set up event listeners
    initWeb3()
        .then(() => {
            console.log('Blockchain connection initialized');
            setupAccountChangeListener();
            determineImplementation();
        })
        .catch(error => {
            console.error('Failed to initialize blockchain connection:', error);
            // Fall back to mock implementation if Web3 initialization fails
            determineImplementation();
        });
});

// Export additional utility functions for use in other files

// Format timestamp to readable date
function formatTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
}

// Check if an election has ended
function isElectionEnded(endTime) {
    return Date.now() > endTime * 1000;
}

// Format wallet address for display (truncate middle)
function formatAddress(address) {
    if (!address) return '';
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

// Calculate time remaining for an election
function getTimeRemaining(endTime) {
    const total = endTime * 1000 - Date.now();
    
    if (total <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
    }
    
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    
    return {
        total,
        days,
        hours,
        minutes,
        seconds,
        ended: false
    };
}

// Update countdown timer for active elections
function updateCountdowns() {
    const countdownElements = document.querySelectorAll('.election-countdown');
    
    countdownElements.forEach(element => {
        const endTime = parseInt(element.dataset.endTime);
        const time = getTimeRemaining(endTime);
        
        if (time.ended) {
            element.innerHTML = '<span class="ended-tag">Ended</span>';
            element.closest('.election-card')?.classList.add('election-ended');
        } else {
            element.innerHTML = `
                <span class="countdown-item">${time.days}d</span>
                <span class="countdown-item">${time.hours}h</span>
                <span class="countdown-item">${time.minutes}m</span>
                <span class="countdown-item">${time.seconds}s</span>
            `;
        }
    });
}

// Start countdown timers
function startCountdowns() {
    updateCountdowns();
    setInterval(updateCountdowns, 1000);
}

// Export utility functions
window.formatTimestamp = formatTimestamp;
window.isElectionEnded = isElectionEnded;
window.formatAddress = formatAddress;
window.getTimeRemaining = getTimeRemaining;
window.startCountdowns = startCountdowns;

// Error handling functions
function handleTransactionError(error) {
    console.error('Transaction error:', error);
    
    // Extract error message
    let errorMessage = 'Transaction failed';
    
    if (typeof error === 'string') {
        errorMessage = error;
    } else if (error.message) {
        errorMessage = error.message;
    }
    
    // Clean up common blockchain error messages
    if (errorMessage.includes('User denied transaction')) {
        errorMessage = 'Transaction was rejected in your wallet';
    } else if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds in your wallet for this transaction';
    } else if (errorMessage.includes('nonce too low')) {
        errorMessage = 'Transaction error: Please refresh the page and try again';
    }
    
    // Display error in UI
    if (typeof showNotification === 'function') {
        showNotification(errorMessage, 'error');
    } else {
        alert('Error: ' + errorMessage);
    }
}

window.handleTransactionError = handleTransactionError;

// Load election data with all details (candidates, results if ended)
async function loadElectionDetails(electionId) {
    try {
        // Get election basic info
        const election = await window.votingSystemContract.methods.getElection(electionId).call();
        
        // Get candidates
        const candidates = await window.getCandidates(electionId);
        
        // Check if user has voted
        const accounts = await web3.eth.getAccounts();
        const hasVoted = accounts.length > 0 
            ? await window.hasVoted(electionId, accounts[0]) 
            : false;
        
        // Get results if election has ended
        let results = null;
        if (Date.now() > election.endTime * 1000) {
            results = await window.getElectionResults(electionId);
        }
        
        return {
            election: {
                id: election.id,
                name: election.name,
                description: election.description,
                creator: election.creator,
                endTime: parseInt(election.endTime),
                isWhitelistOnly: election.isWhitelistOnly
            },
            candidates,
            hasVoted,
            results
        };
    } catch (error) {
        console.error(`Error loading election details for ${electionId}:`, error);
        throw new Error('Failed to load election details');
    }
}

window.loadElectionDetails = loadElectionDetails;

// Check if the current network is supported
async function checkNetwork() {
    if (!web3) return false;
    
    try {
        const networkId = await web3.eth.net.getId();
        const networkName = getNetworkName(networkId);
        
        console.log('Connected to network:', networkName, '(ID:', networkId, ')');
        
        // Check if this is a supported network
        // Add your supported network IDs here
        const supportedNetworks = [1, 3, 4, 5, 42, 56, 97, 137, 80001];
        
        return supportedNetworks.includes(networkId);
    } catch (error) {
        console.error('Error checking network:', error);
        return false;
    }
}

// Get network name from ID
function getNetworkName(networkId) {
    const networks = {
        1: 'Ethereum Mainnet',
        3: 'Ropsten Testnet',
        4: 'Rinkeby Testnet',
        5: 'Goerli Testnet',
        42: 'Kovan Testnet',
        56: 'BSC Mainnet',
        97: 'BSC Testnet',
        137: 'Polygon Mainnet',
        80001: 'Mumbai Testnet'
    };
    
    return networks[networkId] || 'Unknown Network';
}

window.checkNetwork = checkNetwork;
window.getNetworkName = getNetworkName;

// Check if MetaMask is locked
async function isWalletLocked() {
    if (!window.ethereum) return true;
    
    try {
        const accounts = await window.ethereum.request({
            method: 'eth_accounts'
        });
        
        return accounts.length === 0;
    } catch (error) {
        console.error('Error checking if wallet is locked:', error);
        return true;
    }
}

window.isWalletLocked = isWalletLocked;

// Add network change handler for improved UX
function addNetworkChangeHandler() {
    if (window.ethereum) {
        window.ethereum.on('chainChanged', (chainId) => {
            // Handle chain change
            const networkId = parseInt(chainId, 16);
            const networkName = getNetworkName(networkId);
            
            console.log('Network changed to:', networkName, '(ID:', networkId, ')');
            
            // Check if this is a supported network
            const supportedNetworks = [1, 3, 4, 5, 42, 56, 97, 137, 80001];
            
            if (!supportedNetworks.includes(networkId)) {
                if (typeof showNotification === 'function') {
                    showNotification('Warning: Connected to unsupported network. Some features may not work correctly.', 'warning');
                }
            }
            
            // Reload the page to ensure everything is in sync
            window.location.reload();
        });
    }
}

// Add this to initialization functions
window.addNetworkChangeHandler = addNetworkChangeHandler;

// Initialize everything related to blockchain
function initializeBlockchain() {
    initWeb3()
        .then(() => {
            console.log('Web3 initialized successfully');
            setupAccountChangeListener();
            addNetworkChangeHandler();
            determineImplementation();
            
            // Check if on a supported network
            checkNetwork().then(isSupported => {
                if (!isSupported) {
                    console.warn('Connected to unsupported network');
                    if (typeof showNotification === 'function') {
                        showNotification('Warning: Connected to unsupported network. Some features may not work correctly.', 'warning');
                    }
                }
            });
            
            // Notify the app that blockchain is ready
            if (typeof appState !== 'undefined') {
                appState.blockchain = {
                    initialized: true,
                    error: null
                };
                
                // If there's a callback for blockchain ready, call it
                if (typeof onBlockchainReady === 'function') {
                    onBlockchainReady();
                }
            }
        })
        .catch(error => {
            console.error('Failed to initialize blockchain:', error);
            
            // Set error state
            if (typeof appState !== 'undefined') {
                appState.blockchain = {
                    initialized: false,
                    error: error.message
                };
            }
            
            // Fall back to mock implementation
            determineImplementation();
            
            // Show error notification
            if (typeof showNotification === 'function') {
                showNotification('Blockchain connection failed: ' + error.message, 'error');
            }
        });
}

// Replace the existing initialization with this comprehensive one
window.initializeBlockchain = initializeBlockchain;

// Override DOMContentLoaded event listener to use the new init function
const existingDOMContentLoadedListener = document.addEventListener;
document.addEventListener = function(event, callback) {
    if (event === 'DOMContentLoaded' && callback.toString().includes('initWeb3')) {
        existingDOMContentLoadedListener.call(document, event, () => {
            // Use the new comprehensive initialization instead
            initializeBlockchain();
        });
    } else {
        existingDOMContentLoadedListener.apply(document, arguments);
    }
};