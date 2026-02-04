# Ballot Box on Blockchain

A decentralized, tamper-proof online voting system where votes are recorded on a custom blockchain and cannot be altered.

## Features

- **Admin**: Create elections, add candidates, set start/end times, view real-time results
- **Voter**: Register/login, cast exactly one vote per election, verify vote on blockchain
- **Blockchain**: Custom implementation with Proof-of-Work, immutable vote records
- **Security**: Vote anonymity (hashed voter ID), no modification/deletion, double-voting prevention

## Tech Stack

- **Frontend**: React 18, Vite, React Router
- **Backend**: Node.js, Express
- **Blockchain**: Custom JavaScript blockchain (Block, Blockchain, Proof-of-Work)
- **Storage**: JSON files (users, elections, blockchain)

## Project Structure

```
ballot-box-blockchain/
├── backend/
│   ├── blockchain/       # Block, Blockchain, ProofOfWork
│   ├── routes/           # auth, elections, votes
│   ├── middleware/       # JWT auth
│   ├── utils/            # storage, initBlockchain
│   ├── data/             # users.json, elections.json, blockchain.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/      # AuthContext
│   │   ├── pages/        # Home, Login, Register, Dashboard, Voting, Results
│   │   └── utils/        # API client
│   └── vite.config.js
├── ARCHITECTURE.md
├── BLOCKCHAIN.md
├── SECURITY.md
└── README.md
```

## Step-by-Step: Run Locally

### Prerequisites

- Node.js 18+ 
- npm

### 1. Install Dependencies

```bash
# From project root
npm install
cd backend && npm install
cd ../frontend && npm install
```

Or use the convenience script:

```bash
npm run install:all
```

### 2. Start Backend

```bash
cd backend
npm start
```

Backend runs at `http://localhost:3000`.

### 3. Start Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 4. Use the Application

1. Open `http://localhost:5173` in your browser.
2. **Login as Admin**: `admin@ballotbox.local` / `admin123`
3. **Create Election**: Admin → Create Election → fill form → Create Election
4. **Register voter**: Logout → Register → create account
5. **Vote**: Go to Elections → select active election → Vote → choose candidate → Cast Vote
6. **Verify**: After voting, click "Verify My Vote on Blockchain" to confirm your vote is on-chain
7. **Results**: View real-time results on any election's Results page

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register voter |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user (auth) |
| GET | `/api/elections` | List elections |
| GET | `/api/elections/:id` | Get election + vote counts |
| GET | `/api/elections/:id/results` | Get results |
| POST | `/api/elections` | Create election (admin) |
| POST | `/api/votes` | Cast vote (auth) |
| GET | `/api/votes/verify/:electionId` | Verify my vote (auth) |
| GET | `/api/votes/has-voted/:electionId` | Check if voted (auth) |
| GET | `/api/blockchain` | Public chain audit |

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — System architecture and data flow
- **[BLOCKCHAIN.md](./BLOCKCHAIN.md)** — Blockchain design and block structure
- **[SECURITY.md](./SECURITY.md)** — Transparency, security, integrity

## License

srinivaskompella2005@gmail.com
