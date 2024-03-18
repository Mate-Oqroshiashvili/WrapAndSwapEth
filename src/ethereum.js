const { ethers } = require("ethers");

function connectProvider() {
  return new ethers.JsonRpcProvider("http://localhost:8545");
}

function connectContract(wallet, contractAddress, abi) {
  return new ethers.Contract(contractAddress, abi, wallet);
}

module.exports = {
  connectProvider,
  connectContract,
};
