const { connectContract } = require("./ethereum");

function connectUniswapRouterContract(wallet) {
  const uniswapRouterContractAddress =
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const uniswapRouterABI = [
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
  ];
  return connectContract(
    wallet,
    uniswapRouterContractAddress,
    uniswapRouterABI
  );
}

async function getAmountOutMin(
  uniswapRouterContract,
  amountIn,
  wethContractAddress,
  usdtContractAddress
) {
  const amountsOut = await uniswapRouterContract.getAmountsOut(amountIn, [
    wethContractAddress,
    usdtContractAddress,
  ]);
  return amountsOut[1];
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
  connectUniswapRouterContract,
  getAmountOutMin,
  swapTokens,
};
