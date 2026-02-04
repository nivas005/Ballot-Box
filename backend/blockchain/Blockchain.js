import crypto from 'crypto';
import { Block } from './Block.js';
import { DIFFICULTY } from './ProofOfWork.js';
import { readDataFile, writeDataFile } from '../utils/storage.js';

const BLOCKCHAIN_FILE = 'blockchain.json';

/**
 * Custom blockchain implementation for voting system.
 * Ensures immutability, transparency, and vote integrity.
 */
export class Blockchain {
  constructor() {
    this.chain = [];
    this.pendingVotes = [];
    this.difficulty = DIFFICULTY;
    this.votedAddresses = new Set(); // Prevents double voting
  }

  /**
   * Create genesis block
   */
  createGenesisBlock() {
    return new Block(0, Date.now(), [{ type: 'genesis', data: 'Ballot Box Genesis' }], '0');
  }

  /**
   * Initialize or load blockchain from storage
   */
  async init() {
    try {
      const data = await readDataFile(BLOCKCHAIN_FILE);
      if (data && data.chain && data.chain.length > 0) {
        this.chain = data.chain.map(
          (b) =>
            Object.assign(new Block(), {
              ...b,
              transactions: b.transactions || []
            })
        );
        this.votedAddresses = new Set(data.votedAddresses || []);
        return;
      }
    } catch {
      // File doesn't exist or invalid - create new chain
    }

    this.chain = [this.createGenesisBlock()];
    this.votedAddresses = new Set();
    await this.save();
  }

  /**
   * Persist blockchain to storage
   */
  async save() {
    await writeDataFile(BLOCKCHAIN_FILE, {
      chain: this.chain,
      votedAddresses: [...this.votedAddresses]
    });
  }

  /**
   * Get latest block
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Add a vote transaction. Vote structure: { voterHash, candidateId, electionId }
   * voterHash = hash(voterId + secretToken) - anonymizes voter while enabling uniqueness check
   */
  async addVote(vote) {
    const { voterHash, candidateId, electionId } = vote;

    if (this.votedAddresses.has(voterHash)) {
      throw new Error('Double voting attempt detected. This address has already voted.');
    }

    const voteData = {
      voterHash,
      candidateId,
      electionId,
      timestamp: Date.now()
    };

    const block = new Block(
      this.chain.length,
      Date.now(),
      [voteData],
      this.getLatestBlock().hash
    );

    block.mineBlock(this.difficulty);
    this.chain.push(block);
    this.votedAddresses.add(voterHash);
    await this.save();

    return block;
  }

  /**
   * Verify the entire chain integrity
   */
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock.validate()) {
        return false;
      }
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get all votes for a specific election
   */
  getElectionVotes(electionId) {
    const votes = {};
    for (const block of this.chain) {
      if (block.index === 0) continue; // Skip genesis
      for (const tx of block.transactions || []) {
        if (tx.electionId === electionId) {
          votes[tx.candidateId] = (votes[tx.candidateId] || 0) + 1;
        }
      }
    }
    return votes;
  }

  /**
   * Verify a voter's vote exists (without revealing which candidate)
   * voterHash = hash(voterId + secretToken)
   */
  verifyVote(voterHash, electionId) {
    for (const block of this.chain) {
      for (const tx of block.transactions || []) {
        if (tx.voterHash === voterHash && tx.electionId === electionId) {
          return {
            exists: true,
            blockIndex: block.index,
            blockHash: block.hash,
            timestamp: tx.timestamp
          };
        }
      }
    }
    return { exists: false };
  }

  /**
   * Generate voter hash for anonymity (voterId + secretToken)
   */
  static generateVoterHash(voterId, secretToken) {
    return crypto.createHash('sha256').update(`${voterId}:${secretToken}`).digest('hex');
  }

  /**
   * Get full chain for transparency/audit
   */
  getChain() {
    return this.chain;
  }
}
