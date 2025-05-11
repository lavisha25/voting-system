// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title VotingSystem
 * @dev A secure blockchain-based voting system
 */
contract VotingSystem {
    // Structure for Candidate details
    struct Candidate {
        uint256 id;
        string name;
        string party;
        string imageHash; // IPFS hash for candidate image
        uint256 voteCount;
    }

    // Structure for Voter details
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedCandidateId;
    }

    address public admin;
    string public electionName;
    string public electionDescription;
    uint256 public startTime;
    uint256 public endTime;
    bool public electionActive;

    // Mapping addresses to voter details
    mapping(address => Voter) public voters;
    
    // Array to store all candidates
    Candidate[] public candidates;
    
    // Total number of votes cast
    uint256 public totalVotes;

    // Events
    event VoterRegistered(address indexed voterAddress);
    event CandidateAdded(uint256 indexed candidateId, string name);
    event VoteCast(address indexed voter, uint256 indexed candidateId);
    event ElectionStarted(uint256 startTime, uint256 endTime);
    event ElectionEnded(uint256 endTime, uint256 totalVotes);

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier electionIsActive() {
        require(electionActive, "Election is not active");
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Election is not in progress");
        _;
    }

    modifier electionHasEnded() {
        require(!electionActive || block.timestamp > endTime, "Election has not ended yet");
        _;
    }

    // Constructor
    constructor(string memory _electionName, string memory _electionDescription) {
        admin = msg.sender;
        electionName = _electionName;
        electionDescription = _electionDescription;
        electionActive = false;
        totalVotes = 0;
    }

    /**
     * @dev Add a new candidate to the election
     * @param _name Candidate name
     * @param _party Candidate party
     * @param _imageHash IPFS hash for candidate image
     */
    function addCandidate(string memory _name, string memory _party, string memory _imageHash) public onlyAdmin {
        require(!electionActive, "Cannot add candidates once election has started");
        
        uint256 candidateId = candidates.length;
        candidates.push(Candidate({
            id: candidateId,
            name: _name,
            party: _party,
            imageHash: _imageHash,
            voteCount: 0
        }));
        
        emit CandidateAdded(candidateId, _name);
    }

    /**
     * @dev Register a voter for the election
     * @param _voter Address of the voter to register
     */
    function registerVoter(address _voter) public onlyAdmin {
        require(!voters[_voter].isRegistered, "Voter is already registered");
        
        voters[_voter].isRegistered = true;
        voters[_voter].hasVoted = false;
        
        emit VoterRegistered(_voter);
    }

    /**
     * @dev Start the election
     * @param _durationInMinutes Duration of the election in minutes
     */
    function startElection(uint256 _durationInMinutes) public onlyAdmin {
        require(!electionActive, "Election is already active");
        require(candidates.length > 1, "At least two candidates required to start election");
        
        startTime = block.timestamp;
        endTime = startTime + (_durationInMinutes * 1 minutes);
        electionActive = true;
        
        emit ElectionStarted(startTime, endTime);
    }

    /**
     * @dev Cast a vote for a candidate
     * @param _candidateId ID of the candidate to vote for
     */
    function castVote(uint256 _candidateId) public electionIsActive {
        require(voters[msg.sender].isRegistered, "Voter is not registered");
        require(!voters[msg.sender].hasVoted, "Voter has already voted");
        require(_candidateId < candidates.length, "Invalid candidate ID");
        
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedCandidateId = _candidateId;
        
        candidates[_candidateId].voteCount++;
        totalVotes++;
        
        emit VoteCast(msg.sender, _candidateId);
    }

    /**
     * @dev End the election manually before the scheduled end time
     */
    function endElection() public onlyAdmin {
        require(electionActive, "Election is not active");
        
        electionActive = false;
        endTime = block.timestamp;
        
        emit ElectionEnded(endTime, totalVotes);
    }

    /**
     * @dev Get all candidates and their details
     * @return Array of candidates
     */
    function getCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }

    /**
     * @dev Get the winner(s) of the election
     * @return winnerIds Array of winner IDs
     * @return maxVotes Maximum votes received
     */
    function getWinners() public view electionHasEnded returns (uint256[] memory winnerIds, uint256 maxVotes) {
        uint256 candidateCount = candidates.length;
        require(candidateCount > 0, "No candidates in the election");
        
        // Find the maximum votes
        maxVotes = 0;
        for (uint256 i = 0; i < candidateCount; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
            }
        }
        
        // Count how many candidates have maximum votes (to handle ties)
        uint256 winnerCount = 0;
        for (uint256 i = 0; i < candidateCount; i++) {
            if (candidates[i].voteCount == maxVotes) {
                winnerCount++;
            }
        }
        
        // Create array of winner IDs
        winnerIds = new uint256[](winnerCount);
        uint256 winnerIndex = 0;
        for (uint256 i = 0; i < candidateCount; i++) {
            if (candidates[i].voteCount == maxVotes) {
                winnerIds[winnerIndex] = candidates[i].id;
                winnerIndex++;
            }
        }
        
        return (winnerIds, maxVotes);
    }
    
    /**
     * @dev Get election details
     * @return name Election name
     * @return description Election description
     * @return active Election status
     * @return start Start time
     * @return end End time
     * @return votes Total votes cast
     */
    function getElectionDetails() public view returns (
        string memory name,
        string memory description,
        bool active,
        uint256 start,
        uint256 end,
        uint256 votes
    ) {
        return (
            electionName,
            electionDescription,
            electionActive,
            startTime,
            endTime,
            totalVotes
        );
    }
    
    /**
     * @dev Check if a voter is registered and has voted
     * @param _voter Address of the voter
     * @return isRegistered Whether voter is registered
     * @return hasVoted Whether voter has voted
     * @return candidateId ID of the candidate voter voted for
     */
    function getVoterStatus(address _voter) public view returns (
        bool isRegistered,
        bool hasVoted,
        uint256 candidateId
    ) {
        return (
            voters[_voter].isRegistered,
            voters[_voter].hasVoted,
            voters[_voter].votedCandidateId
        );
    }
}