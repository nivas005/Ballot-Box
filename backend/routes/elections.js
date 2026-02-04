import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readDataFile, writeDataFile } from '../utils/storage.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { getBlockchain } from '../utils/initBlockchain.js';

const router = express.Router();

// Create election (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, startTime, endTime, candidates } = req.body;
    if (!title || !candidates || !Array.isArray(candidates) || candidates.length < 2) {
      return res.status(400).json({ error: 'Title and at least 2 candidates required' });
    }

    const data = await readDataFile('elections.json') || { elections: [] };
    const elections = data.elections || [];

    const election = {
      id: uuidv4(),
      title,
      description: description || '',
      startTime: startTime ? new Date(startTime).getTime() : Date.now(),
      endTime: endTime ? new Date(endTime).getTime() : Date.now() + 7 * 24 * 60 * 60 * 1000,
      candidates: candidates.map((name, idx) => ({
        id: uuidv4(),
        name,
        order: idx
      })),
      createdBy: req.user.userId,
      createdAt: Date.now()
    };

    elections.push(election);
    await writeDataFile('elections.json', { elections });

    res.status(201).json(election);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create election' });
  }
});

// List all elections
router.get('/', async (req, res) => {
  try {
    const data = await readDataFile('elections.json') || { elections: [] };
    const elections = data.elections || [];
    const now = Date.now();

    const withStatus = elections.map(e => ({
      ...e,
      status: now < e.startTime ? 'upcoming' : now > e.endTime ? 'ended' : 'active'
    }));

    res.json(withStatus);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch elections' });
  }
});

// Get single election
router.get('/:id', async (req, res) => {
  try {
    const data = await readDataFile('elections.json') || { elections: [] };
    const election = data.elections?.find(e => e.id === req.params.id);
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    const now = Date.now();
    const status = now < election.startTime ? 'upcoming' : now > election.endTime ? 'ended' : 'active';

    const blockchain = await getBlockchain();
    const voteCounts = blockchain.getElectionVotes(election.id);

    res.json({
      ...election,
      status,
      voteCounts,
      totalVotes: Object.values(voteCounts).reduce((a, b) => a + b, 0)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch election' });
  }
});

// Update election (Admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, startTime, endTime } = req.body;
    const data = await readDataFile('elections.json') || { elections: [] };
    const idx = data.elections?.findIndex(e => e.id === req.params.id);
    if (idx === undefined || idx < 0) {
      return res.status(404).json({ error: 'Election not found' });
    }

    if (title) data.elections[idx].title = title;
    if (description !== undefined) data.elections[idx].description = description;
    if (startTime) data.elections[idx].startTime = new Date(startTime).getTime();
    if (endTime) data.elections[idx].endTime = new Date(endTime).getTime();

    await writeDataFile('elections.json', data);
    res.json(data.elections[idx]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update election' });
  }
});

// Add candidates (Admin) - only before election starts
router.post('/:id/candidates', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { candidates } = req.body;
    const data = await readDataFile('elections.json') || { elections: [] };
    const election = data.elections?.find(e => e.id === req.params.id);
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }
    if (Date.now() >= election.startTime) {
      return res.status(400).json({ error: 'Cannot add candidates after election has started' });
    }

    const newCandidates = (Array.isArray(candidates) ? candidates : [candidates]).map((name, idx) => ({
      id: uuidv4(),
      name,
      order: election.candidates.length + idx
    }));
    election.candidates.push(...newCandidates);
    await writeDataFile('elections.json', data);
    res.json(election);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add candidates' });
  }
});

// Get real-time results
router.get('/:id/results', async (req, res) => {
  try {
    const data = await readDataFile('elections.json') || { elections: [] };
    const election = data.elections?.find(e => e.id === req.params.id);
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    const now = Date.now();
    const status = now < election.startTime ? 'upcoming' : now > election.endTime ? 'ended' : 'active';

    const blockchain = await getBlockchain();
    const voteCounts = blockchain.getElectionVotes(election.id);

    const results = election.candidates.map(c => ({
      ...c,
      votes: voteCounts[c.id] || 0
    }));

    res.json({
      election: { id: election.id, title: election.title, status },
      results,
      totalVotes: Object.values(voteCounts).reduce((a, b) => a + b, 0)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

export default router;
