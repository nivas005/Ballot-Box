import { Blockchain } from '../blockchain/Blockchain.js';

let blockchainInstance = null;

export async function getBlockchain() {
  if (!blockchainInstance) {
    blockchainInstance = new Blockchain();
    await blockchainInstance.init();
  }
  return blockchainInstance;
}
