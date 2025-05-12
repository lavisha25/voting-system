const mongoose = require('mongoose');

const voteLogSchema = new mongoose.Schema({
    wallet: { type: String, required: true },
    electionId: { type: Number, required: true },
    candidateId: { type: Number, required: true },
    txHash: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VoteLog', voteLogSchema);
