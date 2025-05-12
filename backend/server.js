const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/decentralvote', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const VoteLog = require('./models/VoteLog');

app.post('/api/log-vote', async (req, res) => {
    try {
        const log = new VoteLog(req.body);
        await log.save();
        res.status(201).send('Vote logged');
    } catch (err) {
        res.status(500).send('Error saving vote');
    }
});

app.get('/api/vote-logs', async (req, res) => {
    const logs = await VoteLog.find();
    res.json(logs);
});

app.listen(5000, () => console.log('Server running on port 5000'));
