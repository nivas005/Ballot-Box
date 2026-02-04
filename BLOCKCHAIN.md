# Blockchain Design — Ballot Box

## Block Structure

Each block contains:

| Field          | Description                                      |
|----------------|--------------------------------------------------|
| `index`        | Block number (0 = genesis)                       |
| `timestamp`    | Unix timestamp when block was created            |
| `transactions` | Array of vote objects                            |
| `previousHash` | SHA-256 hash of previous block                   |
| `hash`         | SHA-256 hash of block contents + nonce           |
| `nonce`        | Number used for Proof-of-Work                    |

## Vote Transaction

```json
{
  "voterHash": "sha256(userId:secretToken)",
  "candidateId": "uuid-of-candidate",
  "electionId": "uuid-of-election",
  "timestamp": 1234567890
}
```

- **voterHash**: Anonymizes voter while enabling uniqueness (one vote per voterHash per election)
- **candidateId**: Which candidate received the vote
- **electionId**: Which election the vote belongs to

## Proof-of-Work

- **Difficulty**: 3 (hash must start with "000")
- **Purpose**: Computational cost to add blocks; makes tampering expensive
- **Process**: Increment nonce until `hash.substring(0, 3) === "000"`

## Integrity

- Each block's hash depends on previous block hash → chain integrity
- Modifying any past block invalidates all subsequent hashes
- `isChainValid()` verifies full chain on demand

## Double-Voting Prevention

- `votedAddresses` Set stores all `voterHash` values that have voted
- Before adding a vote, check `votedAddresses.has(voterHash)`
- Reject if already voted
