import express from 'express';
import cors from 'cors';
import { readDataFile, writeDataFile } from './utils/storage.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getBlockchain } from './utils/initBlockchain.js';

import authRoutes from './routes/auth.js';
import electionsRoutes from './routes/elections.js';
import votesRoutes from './routes/votes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/elections', electionsRoutes);
app.use('/api/votes', votesRoutes);

// Blockchain audit endpoint (public - for transparency)
app.get('/api/blockchain', async (req, res) => {
  try {
    const blockchain = await getBlockchain();
    const chain = blockchain.getChain();
    const sanitized = chain.map(block => ({
      index: block.index,
      timestamp: block.timestamp,
      previousHash: block.previousHash,
      hash: block.hash,
      nonce: block.nonce,
      transactionCount: (block.transactions || []).length
      // Vote details anonymized - only voterHash stored, never plain voterId
    }));
    res.json({
      chain: sanitized,
      isValid: blockchain.isChainValid()
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blockchain' });
  }
});

// Seed default admin (demo only)
async function seedAdmin() {
  const data = await readDataFile('users.json') || { users: [] };
  const hasAdmin = data.users?.some(u => u.role === 'admin');
  if (!hasAdmin) {
    const admin = {
      id: uuidv4(),
      email: 'admin@ballotbox.local',
      password: await bcrypt.hash('admin123', 10),
      name: 'Admin',
      role: 'admin',
      secretToken: uuidv4(),
      createdAt: Date.now()
    };
    data.users = data.users || [];
    data.users.push(admin);
    await writeDataFile('users.json', data);
    console.log('📋 Default admin created: admin@ballotbox.local / admin123');
  }
}

app.listen(PORT, async () => {
  await getBlockchain(); // Initialize blockchain
  await seedAdmin();
  console.log(`\n🗳️  Ballot Box Blockchain server running on http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api\n`);
});
