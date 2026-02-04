import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import { readDataFile, writeDataFile } from './utils/storage.js';
import { getBlockchain } from './utils/initBlockchain.js';

import authRoutes from './routes/auth.js';
import electionsRoutes from './routes/elections.js';
import votesRoutes from './routes/votes.js';

const app = express();

/**
 * Render provides PORT via environment variable
 * Fallback to 3000 for local development
 */
const PORT = process.env.PORT || 3000;

/**
 * Middleware
 * Allow all origins to avoid CORS issues in deployment
 */
app.use(cors());
app.use(express.json());

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/elections', electionsRoutes);
app.use('/api/votes', votesRoutes);

/**
 * Public Blockchain Audit Endpoint
 * (Votes anonymized)
 */
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
    }));

    res.json({
      chain: sanitized,
      isValid: blockchain.isChainValid()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch blockchain' });
  }
});

/**
 * Seed Default Admin (Demo Purpose Only)
 */
async function seedAdmin() {
  const data = (await readDataFile('users.json')) || { users: [] };

  const hasAdmin = data.users.some(user => user.role === 'admin');
  if (hasAdmin) return;

  const admin = {
    id: uuidv4(),
    email: 'admin@ballotbox.local',
    password: await bcrypt.hash('admin123', 10),
    name: 'Admin',
    role: 'admin',
    secretToken: uuidv4(),
    createdAt: Date.now()
  };

  data.users.push(admin);
  await writeDataFile('users.json', data);

  console.log('📋 Default admin created');
  console.log('   Email: admin@ballotbox.local');
  console.log('   Password: admin123');
}

/**
 * Start Server
 */
app.listen(PORT, async () => {
  await getBlockchain(); // Initialize blockchain
  await seedAdmin();     // Create demo admin if missing

  console.log('🗳️  Ballot Box Blockchain Server Started');
  console.log(`🚀 Running on port ${PORT}`);
});
