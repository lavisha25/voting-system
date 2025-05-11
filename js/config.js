// BlockVote Configuration
const CONFIG = {
    // Smart Contract Details
    CONTRACT_ADDRESS: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', // Replace with your actual contract address
    
    // Networks
    NETWORKS: {
        ETHEREUM_MAINNET: {
            chainId: '0x1',
            chainName: 'Ethereum Mainnet',
            rpcUrls: ['https://mainnet.infura.io/v3/your-infura-key'],
            nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18
            }
        },
        POLYGON_MAINNET: {
            chainId: '0x89',
            chainName: 'Polygon Mainnet',
            rpcUrls: ['https://polygon-rpc.com'],
            nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18
            }
        },
        GOERLI_TESTNET: {
            chainId: '0x5',
            chainName: 'Goerli Test Network',
            rpcUrls: ['https://goerli.infura.io/v3/your-infura-key'],
            nativeCurrency: {
                name: 'Goerli ETH',
                symbol: 'ETH',
                decimals: 18
            }
        },
        SEPOLIA_TESTNET: {
            chainId: '0xaa36a7',
            chainName: 'Sepolia Test Network',
            rpcUrls: ['https://sepolia.infura.io/v3/your-infura-key'],
            nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'ETH',
                decimals: 18
            }
        },
        LOCAL: {
            chainId: '0x539',
            chainName: 'Localhost 8545',
            rpcUrls: ['http://localhost:8545'],
            nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
            }
        }
    },
    
    // App Settings
    APP: {
        DEFAULT_NETWORK: 'GOERLI_TESTNET', // Set your default network here
        GAS_LIMIT: 3000000,
        GAS_PRICE: '50000000000', // 50 gwei
        IPFS_GATEWAY: 'https://ipfs.io/ipfs/',
        REFRESH_INTERVAL: 15000, // 15 seconds
        ADMIN_ADDRESS: '0xYourAdminAddress', // Replace with your admin address
    },
    
    // UI Settings
    UI: {
        TOAST_DURATION: 5000, // 5 seconds
        ANIMATION_DURATION: 300, // 0.3 seconds
    },
    
    // Contract ABI (Application Binary Interface)
    CONTRACT_ABI: [
        // Basic ERC functions (These are placeholders - replace with your actual contract ABI)
        {
            "inputs": [],
            "name": "name",
            "outputs": [{"internalType": "string", "name": "", "type": "string"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "voter", "type": "address"}],
            "name": "registerVoter",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "string", "name": "name", "type": "string"}, {"internalType": "string", "name": "party", "type": "string"}, {"internalType": "string", "name": "imageHash", "type": "string"}],
            "name": "addCandidate",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "string", "name": "name", "type": "string"}, {"internalType": "string", "name": "description", "type": "string"}, {"internalType": "uint256", "name": "durationInMinutes", "type": "uint256"}],
            "name": "startElection",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "endElection",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "uint256", "name": "candidateId", "type": "uint256"}],
            "name": "vote",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getElectionDetails",
            "outputs": [
                {"internalType": "string", "name": "name", "type": "string"},
                {"internalType": "string", "name": "description", "type": "string"},
                {"internalType": "uint256", "name": "startTime", "type": "uint256"},
                {"internalType": "uint256", "name": "endTime", "type": "uint256"},
                {"internalType": "bool", "name": "isActive", "type": "bool"},
                {"internalType": "bool", "name": "isEnded", "type": "bool"},
                {"internalType": "uint256", "name": "totalVotes", "type": "uint256"}
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getCandidatesCount",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "uint256", "name": "candidateId", "type": "uint256"}],
            "name": "getCandidate",
            "outputs": [
                {"internalType": "uint256", "name": "id", "type": "uint256"},
                {"internalType": "string", "name": "name", "type": "string"},
                {"internalType": "string", "name": "party", "type": "string"},
                {"internalType": "string", "name": "imageHash", "type": "string"},
                {"internalType": "uint256", "name": "voteCount", "type": "uint256"}
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "voter", "type": "address"}],
            "name": "isRegisteredVoter",
            "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "voter", "type": "address"}],
            "name": "hasVoted",
            "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getWinner",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getRegisteredVotersCount",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        }
    ]
};