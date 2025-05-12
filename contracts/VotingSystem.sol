function closeElection(uint256 electionId) public {
    require(msg.sender == elections[electionId].creator, \"Only creator can close election\");
    require(block.timestamp < elections[electionId].endTime, \"Election already ended\");
    elections[electionId].endTime = block.timestamp;
}
