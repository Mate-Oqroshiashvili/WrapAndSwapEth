const { ethers } = require("ethers");

function connectContract(wallet, contractAddress, abi) {
  return new ethers.Contract(contractAddress, abi, wallet);
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

async function swapTokens(
  uniswapRouterContract,
  amountIn,
  amountOutMin,
  wethContractAddress,
  usdtContractAddress,
  recipientAddress,
  deadline
) {
  const txSwap = await uniswapRouterContract.swapExactTokensForTokens(
    amountIn,
    amountOutMin,
    [wethContractAddress, usdtContractAddress],
    recipientAddress,
    deadline,
    { gasLimit: 6000000, value: 0 }
  );
  await txSwap.wait();
}

module.exports = {
  connectContract,
  depositWETH,
  approveSpending,
  swapTokens,
};
