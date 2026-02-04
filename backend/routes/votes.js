import express from 'express';
import { readDataFile } from '../utils/storage.js';
import { authenticateToken } from '../middleware/auth.js';
import { getBlockchain } from '../utils/initBlockchain.js';
import { Blockchain } from '../blockchain/Blockchain.js';

const router = express.Router();

// Cast vote
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;
    if (!electionId || !candidateId) {
      return res.status(400).json({ error: 'electionId and candidateId required' });
    }

    const data = await readDataFile('elections.json') || { elections: [] };
    const election = data.elections?.find(e => e.id === electionId);
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    const now = Date.now();
    if (now < election.startTime) {
      return res.status(400).json({ error: 'Election has not started yet' });
    }
    if (now > election.endTime) {
      return res.status(400).json({ error: 'Election has ended' });
    }

    const candidate = election.candidates?.find(c => c.id === candidateId);
    if (!candidate) {
      return res.status(400).json({ error: 'Invalid candidate' });
    }

    const users = await readDataFile('users.json') || { users: [] };
    const user = users.users?.find(u => u.id === req.user.userId);
    if (!user || !user.secretToken) {
      return res.status(400).json({ error: 'User not found or missing vote token' });
    }

    const voterHash = Blockchain.generateVoterHash(user.id, user.secretToken);

    const blockchain = await getBlockchain();
    await blockchain.addVote({
      voterHash,
      candidateId,
      electionId
    });

    res.status(201).json({
      success: true,
      message: 'Vote recorded on blockchain',
      blockIndex: blockchain.chain.length - 1
    });
  } catch (err) {
    if (err.message?.includes('already voted')) {
      return res.status(400).json({ error: 'You have already voted in this election' });
    }
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to cast vote' });
  }
});

// Verify my vote (without revealing candidate choice)
router.get('/verify/:electionId', authenticateToken, async (req, res) => {
  try {
    const { electionId } = req.params;
    const users = await readDataFile('users.json') || { users: [] };
    const user = users.users?.find(u => u.id === req.user.userId);
    if (!user || !user.secretToken) {
      return res.status(400).json({ error: 'User not found' });
    }

    const voterHash = Blockchain.generateVoterHash(user.id, user.secretToken);
    const blockchain = await getBlockchain();
    const result = blockchain.verifyVote(voterHash, electionId);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Check if user has voted in election
router.get('/has-voted/:electionId', authenticateToken, async (req, res) => {
  try {
    const { electionId } = req.params;
    const users = await readDataFile('users.json') || { users: [] };
    const user = users.users?.find(u => u.id === req.user.userId);
    if (!user || !user.secretToken) {
      return res.json({ hasVoted: false });
    }

    const voterHash = Blockchain.generateVoterHash(user.id, user.secretToken);
    const blockchain = await getBlockchain();
    const result = blockchain.verifyVote(voterHash, electionId);

    res.json({ hasVoted: result.exists });
  } catch (err) {
    res.json({ hasVoted: false });
  }
});

export default router;
