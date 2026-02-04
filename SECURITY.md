# Security, Transparency & Integrity

## How the System Ensures

### 1. Transparency

- **Public blockchain audit**: `GET /api/blockchain` returns the full chain (blocks, hashes, timestamps). Anyone can verify blocks exist and are linked.
- **Real-time results**: Vote counts are derived directly from on-chain transactions. No hidden tallying.
- **Immutable record**: Votes are appended to the chain. Historical data cannot be modified without breaking the chain.

### 2. Security

- **Vote anonymity**: Votes store `voterHash = SHA256(userId + secretToken)`, not the user ID. The voter’s identity is not exposed on-chain.
- **JWT authentication**: Protected endpoints require a valid token.
- **Password hashing**: bcrypt with salt for user passwords.
- **Role-based access**: Admin-only endpoints (create election, add candidates) check `role === 'admin'`.

### 3. Integrity

- **No modification**: Blocks are append-only. There is no API to edit or delete votes.
- **No deletion**: Removing a block would break the chain; validation would fail.
- **Proof-of-Work**: Adding blocks requires computational work, making casual tampering impractical.
- **Chain validation**: `isChainValid()` checks every block’s hash and previous-hash links.

### 4. Double-Voting Prevention

- `votedAddresses` Set tracks which `voterHash` values have voted.
- Before adding a vote: check `voterHash` is not in the set.
- If already voted: return error "You have already voted in this election".

### Demo Limitations

- **Identity verification**: Basic demo; no KYC or strong identity proof.
- **Secret token**: Stored server-side in users.json; in production, consider a user-held secret.
- **JWT secret**: Default secret for demo; use a strong env var in production.
- **Storage**: JSON files; use a proper DB (e.g. MongoDB) for production.
