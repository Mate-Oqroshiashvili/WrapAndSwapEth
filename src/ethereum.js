const { ethers } = require("ethers");

function connectProvider() {
  return new ethers.providers.JsonRpcProvider("http://localhost:8545");
}

module.exports = {
  connectProvider,
};
