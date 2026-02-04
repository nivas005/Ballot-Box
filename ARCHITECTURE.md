# Ballot Box on Blockchain — System Architecture

## Overview

A decentralized, tamper-proof online voting system where votes are recorded on a custom blockchain and cannot be altered. The system supports two roles: **Admin** (creates elections, manages candidates) and **Voter** (registers, casts one vote per election, verifies vote on-chain).

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                       │
│  Home | Login/Register | Election Dashboard | Voting | Results       │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP/REST (JSON)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js + Express)                      │
│  Auth (JWT) | Elections API | Votes API | Blockchain API             │
└──────────────┬──────────────────────────┬───────────────────────────┘
               │                          │
       ┌───────▼───────┐          ┌──────▼──────┐
       │  JSON Storage │          │  Blockchain │
       │  (users.json, │          │  (in-memory │
       │  elections.json)         │  + persisted)│
       └───────────────┘          └─────────────┘
```

## Components

### 1. Frontend (React + Vite)

- **Pages**: Home, Login, Register, Election Dashboard, Voting Page, Results Page, Create Election (admin)
- **State**: Auth context (JWT in localStorage)
- **API**: Proxy to backend `/api` via Vite dev server

### 2. Backend (Node.js + Express)

- **Auth**: JWT-based; bcrypt for password hashing
- **Routes**:
  - `/api/auth` — login, register, me
  - `/api/elections` — CRUD elections, candidates, results
  - `/api/votes` — cast vote, verify vote, has-voted
  - `/api/blockchain` — public chain audit (read-only)

### 3. Blockchain Module

- **Block**: index, timestamp, transactions, previousHash, hash, nonce
- **Proof-of-Work**: Difficulty 3 (3 leading zeros in hash)
- **Persistence**: `blockchain.json` (chain + voted addresses set)
- **Vote structure**: `{ voterHash, candidateId, electionId, timestamp }`

### 4. Data Storage (JSON)

- `users.json` — user accounts (id, email, hashed password, role, secretToken)
- `elections.json` — elections (id, title, candidates, start/end times)
- `blockchain.json` — chain + votedAddresses set

## Data Flow

### Voting Flow

1. Voter logs in → receives JWT
2. Voter selects election and candidate → POST `/api/votes`
3. Backend: verify election active, user not voted, candidate valid
4. Generate `voterHash = SHA256(userId + secretToken)` (anonymity)
5. Blockchain adds vote block (Proof-of-Work)
6. Block persisted to `blockchain.json`

### Verification Flow

1. Voter requests verification → GET `/api/votes/verify/:electionId`
2. Backend computes voterHash from user + secretToken
3. Searches chain for transaction with matching voterHash + electionId
4. Returns `{ exists, blockIndex, blockHash }` (no candidate revealed)
