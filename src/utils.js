const { ethers } = require("ethers");

async function displayBalances(provider, address, title) {
  console.log("\n" + title);
  console.log("===========================================");
  console.log(
    "ETH balance:",
    ethers.formatEther(await provider.getBalance(address))
  );

  const wethContractAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const wethContract = new ethers.Contract(
    wethContractAddress,
    ["function balanceOf(address owner) view returns (uint256)"],
    provider
  );
  console.log(
    "WETH balance:",
    ethers.formatEther(await wethContract.balanceOf(address))
  );

  const usdtContractAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  const usdtContract = new ethers.Contract(
    usdtContractAddress,
    ["function balanceOf(address owner) view returns (uint256)"],
    provider
  );
  console.log(
    "USDT balance:",
    ethers.formatUnits(await usdtContract.balanceOf(address), 6)
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

module.exports = {
  displayBalances,
  getAmountOutMin,
};
