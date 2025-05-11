// ===== BLOCKCHAIN VOTING SYSTEM - APP.JS =====
// Core application logic for the blockchain voting system

// Web3 and Contract Configuration
class BlockchainVoting {
    constructor() {
        this.web3 = null;
        this.contract = null;
        this.account = null;
        this.isConnected = false;
        this.isAdmin = false;
        this.isRegistered = false;
        this.hasVoted = false;
        this.candidates = [];
        this.electionActive = false;
        this.totalVotes = 0;
        this.electionResults = [];
    }

    // Initialize the application
    async init() {
        console.log("Initializing BlockchainVoting application");
        try {
            await this.initWeb3();
            if (this.web3) {
                await this.initContract();
                await this.fetchElectionStatus();
                await this.fetchCandidates();
                await this.checkUserStatus();
                
                // Initialize UI updates
                EventBus.emit('blockchain:initialized', {
                    isConnected: this.isConnected,
                    account: this.account,
                    isAdmin: this.isAdmin,
                    isRegistered: this.isRegistered,
                    hasVoted: this.hasVoted,
                    electionActive: this.electionActive
                });
            }
        } catch (error) {
            console.error("Initialization error:", error);
            EventBus.emit('notification:show', {
                type: 'error',
                title: 'Initialization Error',
                message: 'Failed to initialize blockchain connection. Please refresh and try again.'
            });
        }
    }

    // Initialize Web3
    async initWeb3() {
        try {
            // Modern dapp browsers
            if (window.ethereum) {
                this.web3 = new Web3(window.ethereum);
                
                // Handle chain changes
                window.ethereum.on('chainChanged', () => {
                    window.location.reload();
                });
                
                // Handle account changes
                window.ethereum.on('accountsChanged', (accounts) => {
                    if (accounts.length === 0) {
                        this.isConnected = false;
                        this.account = null;
                        EventBus.emit('wallet:disconnected');
                    } else {
                        this.checkUserStatus();
                    }
                });
                
                console.log("Web3 provider initialized with ethereum");
            } 
            // Legacy dapp browsers
            else if (window.web3) {
                this.web3 = new Web3(window.web3.currentProvider);
                console.log("Web3 provider initialized with legacy provider");
            } 
            // Fallback - local blockchain
            else {
                // For demo purposes, we'll use a mock implementation
                this.initMockBlockchain();
                console.log("Using mock blockchain implementation");
            }
        } catch (error) {
            console.error("Web3 initialization error:", error);
            this.initMockBlockchain();
        }
    }

    // Initialize mock blockchain for demo purposes
    initMockBlockchain() {
        this.isMockBlockchain = true;
        this.mockCandidates = [
            { id: 1, name: "Alex Johnson", party: "Progressive Party", votes: 120, image: "/api/placeholder/400/320" },
            { id: 2, name: "Sofia Martinez", party: "Innovation Alliance", votes: 85, image: "/api/placeholder/400/320" },
            { id: 3, name: "James Wilson", party: "Future Coalition", votes: 67, image: "/api/placeholder/400/320" },
            { id: 4, name: "Priya Sharma", party: "Reform Movement", votes: 42, image: "/api/placeholder/400/320" }
        ];
        this.mockRegisteredVoters = [
            "0x8F23c57305EFd657663E7371a73F9b2bEc0C5268",
            "0x4B0e6c74dE4F0025beA1fB485e4A8251871D9c00"
        ];
        this.mockElectionActive = true;
    }

    // Initialize smart contract
    async initContract() {
        if (this.isMockBlockchain) return;
        
        try {
            // This would be replaced with actual ABI and contract address
            const contractABI = []; // Contract ABI would go here
            const contractAddress = "0x0000000000000000000000000000000000000000"; // Contract address would go here
            
            this.contract = new this.web3.eth.Contract(contractABI, contractAddress);
            console.log("Contract initialized");
        } catch (error) {
            console.error("Contract initialization error:", error);
            EventBus.emit('notification:show', {
                type: 'error',
                title: 'Contract Error',
                message: 'Failed to initialize smart contract.'
            });
        }
    }

    // Connect wallet
    async connectWallet() {
        try {
            if (this.isMockBlockchain) {
                this.account = "0x8F23c57305EFd657663E7371a73F9b2bEc0C5268";
                this.isConnected = true;
                this.isAdmin = true;
                this.isRegistered = true;
                this.hasVoted = false;
                
                EventBus.emit('wallet:connected', {
                    account: this.account,
                    isAdmin: this.isAdmin,
                    isRegistered: this.isRegistered,
                    hasVoted: this.hasVoted
                });
                
                EventBus.emit('notification:show', {
                    type: 'success',
                    title: 'Wallet Connected',
                    message: 'You have successfully connected your wallet.'
                });
                
                return;
            }
            
            if (!window.ethereum) {
                EventBus.emit('notification:show', {
                    type: 'error',
                    title: 'Connection Failed',
                    message: 'No Ethereum wallet detected. Please install MetaMask.'
                });
                return;
            }
            
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length > 0) {
                this.account = accounts[0];
                this.isConnected = true;
                await this.checkUserStatus();
                
                EventBus.emit('wallet:connected', {
                    account: this.account,
                    isAdmin: this.isAdmin,
                    isRegistered: this.isRegistered,
                    hasVoted: this.hasVoted
                });
                
                EventBus.emit('notification:show', {
                    type: 'success',
                    title: 'Wallet Connected',
                    message: 'You have successfully connected your wallet.'
                });
            }
        } catch (error) {
            console.error("Wallet connection error:", error);
            EventBus.emit('notification:show', {
                type: 'error',
                title: 'Connection Failed',
                message: error.message || 'Failed to connect wallet.'
            });
        }
    }

    // Disconnect wallet (for UI purposes)
    disconnectWallet() {
        this.account = null;
        this.isConnected = false;
        this.isAdmin = false;
        this.isRegistered = false;
        this.hasVoted = false;
        
        EventBus.emit('wallet:disconnected');
        
        EventBus.emit('notification:show', {
            type: 'info',
            title: 'Wallet Disconnected',
            message: 'Your wallet has been disconnected.'
        });
    }

    // Check user status (admin, registered, voted)
    async checkUserStatus() {
        if (!this.isConnected) return;
        
        if (this.isMockBlockchain) {
            this.isAdmin = this.account === "0x8F23c57305EFd657663E7371a73F9b2bEc0C5268";
            this.isRegistered = this.mockRegisteredVoters.includes(this.account);
            this.hasVoted = false;
            return;
        }
        
        try {
            // These would be actual contract calls
            this.isAdmin = await this.contract.methods.isAdmin(this.account).call();
            this.isRegistered = await this.contract.methods.isRegistered(this.account).call();
            this.hasVoted = await this.contract.methods.hasVoted(this.account).call();
        } catch (error) {
            console.error("Error checking user status:", error);
        }
    }

    // Fetch candidates
    async fetchCandidates() {
        try {
            if (this.isMockBlockchain) {
                this.candidates = this.mockCandidates;
                EventBus.emit('candidates:loaded', this.candidates);
                return;
            }
            
            const candidateCount = await this.contract.methods.getCandidateCount().call();
            const candidates = [];
            
            for (let i = 0; i < candidateCount; i++) {
                const candidate = await this.contract.methods.getCandidate(i).call();
                candidates.push({
                    id: candidate.id,
                    name: candidate.name,
                    party: candidate.party,
                    votes: parseInt(candidate.votes),
                    image: candidate.image || "/api/placeholder/400/320"
                });
            }
            
            this.candidates = candidates;
            EventBus.emit('candidates:loaded', this.candidates);
        } catch (error) {
            console.error("Error fetching candidates:", error);
            EventBus.emit('notification:show', {
                type: 'error',
                title: 'Data Error',
                message: 'Failed to load candidate data.'
            });
        }
    }

    // Fetch election status
    async fetchElectionStatus() {
        try {
            if (this.isMockBlockchain) {
                this.electionActive = this.mockElectionActive;
                EventBus.emit('election:status', { active: this.electionActive });
                return;
            }
            
            this.electionActive = await this.contract.methods.electionActive().call();
            EventBus.emit('election:status', { active: this.electionActive });
        } catch (error) {
            console.error("Error fetching election status:", error);
        }
    }

    // Register voter (admin function)
    async registerVoter(address) {
        try {
            if (this.isMockBlockchain) {
                if (!this.mockRegisteredVoters.includes(address)) {
                    this.mockRegisteredVoters.push(address);
                    
                    EventBus.emit('voter:registered', { address });
                    EventBus.emit('notification:show', {
                        type: 'success',
                        title: 'Voter Registered',
                        message: `Address ${address} successfully registered.`
                    });
                } else {
                    EventBus.emit('notification:show', {
                        type: 'warning',
                        title: 'Registration Failed',
                        message: 'This address is already registered.'
                    });
                }
                return;
            }
            
            if (!this.isAdmin) {
                EventBus.emit('notification:show', {
                    type: 'error',
                    title: 'Permission Denied',
                    message: 'Only admin can register voters.'
                });
                return;
            }
            
            await this.contract.methods.registerVoter(address).send({ from: this.account });
            EventBus.emit('voter:registered', { address });
            
            EventBus.emit('notification:show', {
                type: 'success',
                title: 'Voter Registered',
                message: `Address ${address} successfully registered.`
            });
        } catch (error) {
            console.error("Error registering voter:", error);
            EventBus.emit('notification:show', {
                type: 'error',
                title: 'Registration Failed',
                message: error.message || 'Failed to register voter.'
            });
        }
    }

    // Add candidate (admin function)
    async addCandidate(name, party, image = "/api/placeholder/400/320") {
        try {
            if (this.isMockBlockchain) {
                const newId = this.mockCandidates.length + 1;
                const newCandidate = {
                    id: newId,
                    name: name,
                    party: party,
                    votes: 0,
                    image: image
                };
                
                this.mockCandidates.push(newCandidate);
                this.candidates = this.mockCandidates;
                
                EventBus.emit('candidate:added', newCandidate);
                EventBus.emit('candidates:loaded', this.candidates);
                
                EventBus.emit('notification:show', {
                    type: 'success',
                    title: 'Candidate Added',
                    message: `${name} has been added as a candidate.`
                });
                
                return;
            }
            
            if (!this.isAdmin) {
                EventBus.emit('notification:show', {
                    type: 'error',
                    title: 'Permission Denied',
                    message: 'Only admin can add candidates.'
                });
                return;
            }
            
            await this.contract.methods.addCandidate(name, party, image).send({ from: this.account });
            await this.fetchCandidates();
            
            EventBus.emit('notification:show', {
                type: 'success',
                title: 'Candidate Added',
                message: `${name} has been added as a candidate.`
            });
        } catch (error) {
            console.error("Error adding candidate:", error);
            EventBus.emit('notification:show', {
                type: 'error',
                title: 'Action Failed',
                message: error.message || 'Failed to add candidate.'
            });
        }
    }

    // Start election (admin function)
    async startElection() {
        try {
            if (this.isMockBlockchain) {
                this.mockElectionActive = true;
                this.electionActive = true;
                
                EventBus.emit('election:status', { active: true });
                EventBus.emit('notification:show', {
                    type: 'success',
                    title: 'Election Started',
                    message: 'The election has been started successfully.'
                });
                
                return;
            }
            
            if (!this.isAdmin) {
                EventBus.emit('notification:show', {
                    type: 'error',
                    title: 'Permission Denied',
                    message: 'Only admin can start the election.'
                });
                return;
            }
            
            await this.contract.methods.startElection().send({ from: this.account });
            this.electionActive = true;
            
            EventBus.emit('election:status', { active: true });
            EventBus.emit('notification:show', {
                type: 'success',
                title: 'Election Started',
                message: 'The election has been started successfully.'
            });
        } catch (error) {
            console.error("Error starting election:", error);
            EventBus.emit('notification:show', {
                type: 'error',
                title: 'Action Failed',
                message: error.message || 'Failed to start election.'
            });
        }
    }

    // End election (admin function)
    async endElection() {
        try {
            if (this.isMockBlockchain) {
                this.mockElectionActive = false;
                this.electionActive = false;
                
                await this.fetchResults();
                
                EventBus.emit('election:status', { active: false });
                EventBus.emit('notification:show', {
                    type: 'success',
                    title: 'Election Ended',
                    message: 'The election has been ended successfully.'
                });
                
                return;
            }
            
            if (!this.isAdmin) {
                EventBus.emit('notification:show', {
                    type: 'error',
                    title: 'Permission Denied',
                    message: 'Only admin can end the election.'
                });
                return;
            }
            
            await this.contract.methods.endElection().send({ from: this.account });
            this.electionActive = false;
            
            await this.fetchResults();
            
            EventBus.emit('election:status', { active: false });
            EventBus.emit('notification:show', {
                type: 'success',
                title: 'Election Ended',
                message: 'The election has been ended successfully.'
            });
        } catch (error) {
            console.error("Error ending election:", error);
            EventBus.emit('notification:show', {
                type: 'error',
                title: 'Action Failed',
                message: error.message || 'Failed to end election.'
            });
        }
    }

    // Vote for a candidate
    async vote(candidateId) {
        try {
            if (!this.isConnected) {
                EventBus.emit('notification:show', {
                    type: 'warning',
                    title: 'Wallet Required',
                    message: 'Please connect your wallet first.'
                });
                return;
            }
            
            if (!this.isRegistered) {
                EventBus.emit('notification:show', {
                    type: 'warning',
                    title: 'Not Registered',
                    message: 'You are not registered to vote.'
                });
                return;
            }
            
            if (this.hasVoted) {
                EventBus.emit('notification:show', {
                    type: 'warning',
                    title: 'Already Voted',
                    message: 'You have already cast your vote.'
                });
                return;
            }
            
            if (!this.electionActive) {
                EventBus.emit('notification:show', {
                    type: 'warning',
                    title: 'Election Inactive',
                    message: 'The election is not currently active.'
                });
                return;
            }
            
            if (this.isMockBlockchain) {
                const candidateIndex = this.mockCandidates.findIndex(c => c.id === candidateId);
                if (candidateIndex >= 0) {
                    this.mockCandidates[candidateIndex].votes++;
                    this.hasVoted = true;
                    
                    await this.fetchCandidates();
                    
                    EventBus.emit('vote:cast', { candidateId });
                    EventBus.emit('notification:show', {
                        type: 'success',
                        title: 'Vote Cast',
                        message: 'Your vote has been recorded successfully.'
                    });
                }
                return;
            }
            
            await this.contract.methods.vote(candidateId).send({ from: this.account });
            this.hasVoted = true;
            
            await this.fetchCandidates();
            
            EventBus.emit('vote:cast', { candidateId });
            EventBus.emit('notification:show', {
                type: 'success',
                title: 'Vote Cast',
                message: 'Your vote has been recorded successfully.'
            });
        } catch (error) {
            console.error("Error voting:", error);
            EventBus.emit('notification:show', {
                type: 'error',
                title: 'Voting Failed',
                message: error.message || 'Failed to cast your vote.'
            });
        }
    }

    // Fetch election results
    async fetchResults() {
        try {
            if (this.isMockBlockchain) {
                this.totalVotes = this.mockCandidates.reduce((sum, candidate) => sum + candidate.votes, 0);
                
                const results = [...this.mockCandidates]
                    .sort((a, b) => b.votes - a.votes)
                    .map(candidate => ({
                        ...candidate,
                        percentage: this.totalVotes > 0 
                            ? ((candidate.votes / this.totalVotes) * 100).toFixed(1) 
                            : '0.0'
                    }));
                
                this.electionResults = results;
                
                EventBus.emit('results:loaded', {
                    totalVotes: this.totalVotes,
                    results: this.electionResults
                });
                
                return;
            }
            
            await this.fetchCandidates();
            
            this.totalVotes = await this.contract.methods.getTotalVotes().call();
            
            const results = this.candidates
                .map(candidate => ({
                    ...candidate,
                    percentage: this.totalVotes > 0 
                        ? ((candidate.votes / this.totalVotes) * 100).toFixed(1) 
                        : '0.0'
                }))
                .sort((a, b) => b.votes - a.votes);
            
            this.electionResults = results;
            
            EventBus.emit('results:loaded', {
                totalVotes: this.totalVotes,
                results: this.electionResults
            });
        } catch (error) {
            console.error("Error fetching results:", error);
            EventBus.emit('notification:show', {
                type: 'error',
                title: 'Data Error',
                message: 'Failed to load election results.'
            });
        }
    }
}

// Event Bus for application-wide communication
class EventBusClass {
    constructor() {
        this.events = {};
    }
    
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }
    
    off(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
        }
    }
    
    emit(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => callback(data));
        }
    }
}

// Export singletons
const EventBus = new EventBusClass();
const VotingApp = new BlockchainVoting();

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    VotingApp.init();
});