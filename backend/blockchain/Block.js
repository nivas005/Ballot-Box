import crypto from 'crypto';

/**
 * Represents a single block in the blockchain.
 * Each block contains vote transactions, timestamp, and cryptographic links.
 */
export class Block {
  constructor(index, timestamp, transactions, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions; // Array of vote objects
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  /**
   * Calculate SHA-256 hash of block contents.
   * Vote data is hashed - maintains anonymity while ensuring integrity.
   */
  calculateHash() {
    const voteDataHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(this.transactions))
      .digest('hex');

    return crypto
      .createHash('sha256')
      .update(
        this.index +
          this.timestamp +
          voteDataHash +
          this.previousHash +
          this.nonce
      )
      .digest('hex');
  }

  /**
   * Mine block with Proof-of-Work (find nonce meeting difficulty requirement)
   */
  mineBlock(difficulty) {
    const target = '0'.repeat(difficulty);
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }

  /**
   * Validate block structure and hash
   */
  validate() {
    const calculatedHash = this.calculateHash();
    return this.hash === calculatedHash;
  }
}
