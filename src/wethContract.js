const { connectContract } = require("./ethereum");

function connectWETHContract(wallet) {
  const wethContractAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const wethABI = [
    "function deposit() payable",
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
  ];
  return connectContract(wallet, wethContractAddress, wethABI);
}

async function depositWETH(wethContract, amountToWrap) {
  const tx = await wethContract.deposit({ value: amountToWrap });
  await tx.wait();
}

async function approveSpending(wethContract, spenderAddress, approvalAmount) {
  const approveTx = await wethContract.approve(spenderAddress, approvalAmount, {
    gasLimit: 6000000,
  });
  await approveTx.wait();
  console.log("Approved Uniswap Router to spend WETH tokens");
}

module.exports = {
  connectWETHContract,
  depositWETH,
  approveSpending,
};
