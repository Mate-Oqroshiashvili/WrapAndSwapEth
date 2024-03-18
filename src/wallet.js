const { ethers } = require("ethers");

async function connectWallet(provider, privateKey) {
  return new ethers.Wallet(privateKey, provider);
}

async function getWalletBalance(wallet) {
  return wallet.getBalance();
}

module.exports = {
  connectWallet,
  getWalletBalance,
};
