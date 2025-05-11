// Web3 Integration for BlockVote
class BlockVoteWeb3 {
    constructor() {
        this.web3 = null;
        this.contract = null;
        this.account = null;
        this.isAdmin = false;
        this.isConnected = false;
        this.chainId = null;
        this.events = {};
    }

    // Initialize Web3
    async init() {
        try {
            // Check if MetaMask is installed
            if (window.ethereum) {
                // Modern dapp browsers
                this.web3 = new Web3(window.ethereum);
                
                // Add event listeners for account and chain changes
                window.ethereum.on('accountsChanged', (accounts) => {
                    this.handleAccountsChanged(accounts);
                });
                
                window.ethereum.on('chainChanged', (chainId) => {
                    window.location.reload();
                });
                
                // Initialize contract
                this.contract = new this.web3.eth.Contract(
                    CONFIG.CONTRACT_ABI,
                    CONFIG.CONTRACT_ADDRESS
                );
                
                // Try to get accounts (if already authorized)
                const accounts = await this.web3.eth.getAccounts();
                if (accounts.length > 0) {
                    await this.handleAccountsChanged(accounts);
                }
                
                return true;
            } 
            // Legacy dapp browsers
            else if (window.web3) {
                this.web3 = new Web3(window.web3.currentProvider);
                return true;
            } 
            // No web3 injection
            else {
                console.log('Non-Ethereum browser detected. Consider installing MetaMask!');
                this.trigger('error', {
                    message: 'No Web3 provider detected. Please install MetaMask to use this application.'
                });
                return false;
            }
        } catch (error) {
            console.error('Error initializing Web3:', error);
            this.trigger('error', {
                message: 'Failed to initialize Web3: ' + error.message
            });
            return false;
        }
    }

    // Connect wallet
    async connectWallet() {
        try {
            if (!this.web3) {
                const initialized = await this.init();
                if (!initialized) return false;
            }
            
            // Request account access
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            await this.handleAccountsChanged(accounts);
            return true;
        } catch (error) {
            console.error('Error connecting wallet:', error);
            this.trigger('error', {
                message: 'Failed to connect wallet: ' + error.message
            });
            return false;
        }
    }

    // Handle account changes
    async handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            this.account = null;
            this.isConnected = false;
            this.isAdmin = false;
            this.trigger('disconnected');
        } else {
            // Set the current account
            this.account = accounts[0];
            this.isConnected = true;
            
            // Check if current account is admin
            this.isAdmin = this.account.toLowerCase() === CONFIG.APP.ADMIN_ADDRESS.toLowerCase();
            
            // Get current chain ID
            this.chainId = await window.ethereum.request({ method: 'eth_chainId' });
            
            this.trigger('connected', {
                account: this.account,
                isAdmin: this.isAdmin,
                chainId: this.chainId
            });
            
            // Load contract data
            this.loadContractData();
        }
    }

    // Switch network
    async switchNetwork(networkName) {
        try {
            const network = CONFIG.NETWORKS[networkName];
            if (!network) throw new Error('Network configuration not found');
            
            try {
                // Try to switch to the network
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: network.chainId }],
                });
                return true;
            } catch (switchError) {
                // This error code indicates that the chain has not been added to MetaMask
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [network],
                    });
                    return true;
                }
                throw switchError;
            }
        } catch (error) {
            console.error('Error switching network:', error);
            this.trigger('error', {
                message: 'Failed to switch network: ' + error.message
            });
            return false;
        }
    }

    // Load contract data
    async loadContractData() {
        try {
            // Check connection
            if (!this.isConnected || !this.contract) return;
            
            // Get election details
            const electionDetails = await this.contract.methods.getElectionDetails().call();
            
            // Get total registered voters
            const totalVoters = await this.contract.methods.getRegisteredVotersCount().call();
            
            // Get candidates count
            const candidatesCount = await this.contract.methods.getCandidatesCount().call();
            
            // Get all candidates
            const candidates = [];
            for (let i = 1; i <= candidatesCount; i++) {
                const candidate = await this.contract.methods.getCandidate(i).call();
                candidates.push({
                    id: candidate.id,
                    name: candidate.name,
                    party: candidate.party,
                    imageHash: candidate.imageHash,
                    voteCount: candidate.voteCount
                });
            }
            
            // Check if current user is registered
            const isRegistered = await this.contract.methods.isRegisteredVoter(this.account).call();
            
            // Check if current user has voted
            const hasVoted = await this.contract.methods.hasVoted(this.account).call();
            
            // Trigger data loaded event
            this.trigger('dataLoaded', {
                electionDetails,
                totalVoters,
                candidates,
                isRegistered,
                hasVoted
            });
            
            return {
                electionDetails,
                totalVoters,
                candidates,
                isRegistered,
                hasVoted
            };
        } catch (error) {
            console.error('Error loading contract data:', error);
            this.trigger('error', {
                message: 'Failed to load contract data: ' + error.message
            });
        }
    }

    // Register voter (admin only)
    async registerVoter(voterAddress) {
        try {
            if (!this.isConnected) throw new Error('Wallet not connected');
            if (!this.isAdmin) throw new Error('Only admin can register voters');
            
            const tx = await this.contract.methods.registerVoter(voterAddress).send({
                from: this.account,
                gas: CONFIG.APP.GAS_LIMIT,
                gasPrice: CONFIG.APP.GAS_PRICE
            });
            
            this.trigger('voterRegistered', {
                voter: voterAddress,
                transaction: tx
            });
            
            return tx;
        } catch (error) {
            console.error('Error registering voter:', error);
            this.trigger('error', {
                message: 'Failed to register voter: ' + error.message
            });
            throw error;
        }
    }

    // Register current user as voter
    async registerSelfAsVoter() {
        try {
            if (!this.isConnected) throw new Error('Wallet not connected');
            
            // Check if already registered
            const isRegistered = await this.contract.methods.isRegisteredVoter(this.account).call();
            if (isRegistered) throw new Error('You are already registered as a voter');
            
            const tx = await this.contract.methods.registerVoter(this.account).send({
                from: this.account,
                gas: CONFIG.APP.GAS_LIMIT,
                gasPrice: CONFIG.APP.GAS_PRICE
            });
            
            this.trigger('selfRegistered', {
                transaction: tx
            });
            
            return tx;
        } catch (error) {
            console.error('Error registering self as voter:', error);
            this.trigger('error', {
                message: 'Failed to register as voter: ' + error.message
            });
            throw error;
        }
    }

    // Add candidate (admin only)
    async addCandidate(name, party, imageHash) {
        try {
            if (!this.isConnected) throw new Error('Wallet not connected');
            if (!this.isAdmin) throw new Error('Only admin can add candidates');
            
            const tx = await this.contract.methods.addCandidate(name, party, imageHash).send({
                from: this.account,
                gas: CONFIG.APP.GAS_LIMIT,
                gasPrice: CONFIG.APP.GAS_PRICE
            });
            
            this.trigger('candidateAdded', {
                name,
                party,
                imageHash,
                transaction: tx
            });
            
            return tx;
        } catch (error) {
            console.error('Error adding candidate:', error);
            this.trigger('error', {
                message: 'Failed to add candidate: ' + error.message
            });
            throw error;
        }
    }

    // Start election (admin only)
    async startElection(name, description, durationInMinutes) {
        try {
            if (!this.isConnected) throw new Error('Wallet not connected');
            if (!this.isAdmin) throw new Error('Only admin can start an election');
            
            const tx = await this.contract.methods.startElection(name, description, durationInMinutes).send({
                from: this.account,
                gas: CONFIG.APP.GAS_LIMIT,
                gasPrice: CONFIG.APP.GAS_PRICE
            });
            
            this.trigger('electionStarted', {
                name,
                description,
                duration: durationInMinutes,
                transaction: tx
            });
            
            return tx;
        } catch (error) {
            console.error('Error starting election:', error);
            this.trigger('error', {
                message: 'Failed to start election: ' + error.message
            });
            throw error;
        }
    }
    
    // End election (admin only)
    async endElection() {
        try {
            if (!this.isConnected) throw new Error('Wallet not connected');
            if (!this.isAdmin) throw new Error('Only admin can end an election');
            
            const tx = await this.contract.methods.endElection().send({
                from: this.account,
                gas: CONFIG.APP.GAS_LIMIT,
                gasPrice: CONFIG.APP.GAS_PRICE
            });
            
            this.trigger('electionEnded', {
                transaction: tx
            });
            
            return tx;
        } catch (error) {
            console.error('Error ending election:', error);
            this.trigger('error', {
                message: 'Failed to end election: ' + error.message
            });
            throw error;
        }
    }
    
    // Cast vote
    async castVote(candidateId) {
        try {
            if (!this.isConnected) throw new Error('Wallet not connected');
            
            // Check if registered
            const isRegistered = await this.contract.methods.isRegisteredVoter(this.account).call();
            if (!isRegistered) throw new Error('You are not registered as a voter');
            
            // Check if already voted
            const hasVoted = await this.contract.methods.hasVoted(this.account).call();
            if (hasVoted) throw new Error('You have already voted in this election');
            
            const tx = await this.contract.methods.vote(candidateId).send({
                from: this.account,
                gas: CONFIG.APP.GAS_LIMIT,
                gasPrice: CONFIG.APP.GAS_PRICE
            });
            
            this.trigger('voteCast', {
                candidateId,
                transaction: tx
            });
            
            return tx;
        } catch (error) {
            console.error('Error casting vote:', error);
            this.trigger('error', {
                message: 'Failed to cast vote: ' + error.message
            });
            throw error;
        }
    }
    
    // Get winner
    async getWinner() {
        try {
            if (!this.isConnected || !this.contract) throw new Error('Not connected to blockchain');
            
            const winnerId = await this.contract.methods.getWinner().call();
            
            if (winnerId > 0) {
                const winner = await this.contract.methods.getCandidate(winnerId).call();
                
                this.trigger('winnerDetermined', {
                    winner: {
                        id: winner.id,
                        name: winner.name,
                        party: winner.party,
                        imageHash: winner.imageHash,
                        voteCount: winner.voteCount
                    }
                });
                
                return {
                    id: winner.id,
                    name: winner.name,
                    party: winner.party,
                    imageHash: winner.imageHash,
                    voteCount: winner.voteCount
                };
            }
            
            return null;
        } catch (error) {
            console.error('Error getting winner:', error);
            this.trigger('error', {
                message: 'Failed to get winner: ' + error.message
            });
            throw error;
        }
    }
    
    // Get election time remaining
    async getElectionTimeRemaining() {
        try {
            if (!this.isConnected || !this.contract) return 0;
            
            const electionDetails = await this.contract.methods.getElectionDetails().call();
            
            if (!electionDetails.isActive || electionDetails.isEnded) {
                return 0;
            }
            
            const endTime = parseInt(electionDetails.endTime) * 1000; // Convert to milliseconds
            const currentTime = Date.now();
            const timeRemaining = Math.max(0, endTime - currentTime);
            
            return timeRemaining;
        } catch (error) {
            console.error('Error getting time remaining:', error);
            return 0;
        }
    }
    
    // Format time remaining as HH:MM:SS
    formatTimeRemaining(milliseconds) {
        if (milliseconds <= 0) return "00:00:00";
        
        const seconds = Math.floor((milliseconds / 1000) % 60);
        const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        
        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');
    }
    
    // Check if user is registered
    async isUserRegistered() {
        try {
            if (!this.isConnected || !this.account) return false;
            
            return await this.contract.methods.isRegisteredVoter(this.account).call();
        } catch (error) {
            console.error('Error checking if user is registered:', error);
            return false;
        }
    }
    
    // Check if user has voted
    async hasUserVoted() {
        try {
            if (!this.isConnected || !this.account) return false;
            
            return await this.contract.methods.hasVoted(this.account).call();
        } catch (error) {
            console.error('Error checking if user has voted:', error);
            return false;
        }
    }
    
    // Event handling system
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
    
    trigger(event, data = {}) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => callback(data));
    }
    
    // Setup periodic data refreshing
    startDataRefresh() {
        this.stopDataRefresh(); // Clear any existing interval
        
        this.refreshInterval = setInterval(() => {
            if (this.isConnected) {
                this.loadContractData();
            }
        }, CONFIG.APP.REFRESH_INTERVAL);
    }
    
    stopDataRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
    
    // Cleanup
    cleanup() {
        this.stopDataRefresh();
        
        // Remove event listeners
        if (window.ethereum) {
            window.ethereum.removeAllListeners('accountsChanged');
            window.ethereum.removeAllListeners('chainChanged');
        }
        
        // Clear events
        this.events = {};
    }
}

// Export as global variable
window.blockVoteWeb3 = new BlockVoteWeb3();