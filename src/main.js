const { ethers } = require("ethers");
const { connectProvider } = require("./ethereum");
const { connectWallet } = require("./wallet");
const {
  connectWETHContract,
  depositWETH,
  approveSpending,
} = require("./wethContract");
const {
  connectUniswapRouterContract,
  getAmountOutMin,
  swapTokens,
} = require("./uniswapRouterContract");
const { displayBalances } = require("./utils");

async function main() {
  try {
    const provider = connectProvider();
    const privateKey =
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

    const wallet = await connectWallet(provider, privateKey);
    const address = wallet.address;

    await displayBalances(provider, address, "Initial Balances");

    const wethContract = connectWETHContract(wallet);
    const amountToWrap = ethers.parseEther("2");
    await depositWETH(wethContract, amountToWrap);

    await displayBalances(provider, address, "Balances After Wrapping ETH");

    const usdtContractAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    await approveSpending(
      wethContract,
      "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      amountToWrap
    );

    const uniswapRouterContract = connectUniswapRouterContract(wallet);
    const amountOutMin = await getAmountOutMin(
      uniswapRouterContract,
      amountToWrap,
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      usdtContractAddress
    );

    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    await swapTokens(
      uniswapRouterContract,
      amountToWrap,
      amountOutMin,
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      usdtContractAddress,
      address,
      deadline
    );

    await displayBalances(
      provider,
      address,
      "Final Balances After Swapping WETH to USDT"
    );
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

main().catch(console.error);
