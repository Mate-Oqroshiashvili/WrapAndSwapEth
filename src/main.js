const { ethers } = require("ethers");
const { connectProvider } = require("./ethereum");
const { connectWallet, getWalletBalance } = require("./wallet");
const {
  connectContract,
  depositWETH,
  approveSpending,
  swapTokens,
} = require("./contract");
const { displayBalances, getAmountOutMin } = require("./utils");

async function main() {
  try {
    const provider = connectProvider();
    const privateKey =
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

    const wallet = await connectWallet(provider, privateKey);
    const address = wallet.address;

    await displayBalances(provider, address, "Initial Balances");

    const wethContract = connectContract(
      wallet,
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      [
        "function deposit() payable",
        "function balanceOf(address owner) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)",
      ]
    );

    const amountToWrap = ethers.utils.parseEther("2");
    await depositWETH(wethContract, amountToWrap);

    await displayBalances(provider, address, "Balances After Wrapping ETH");

    const usdtContractAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    await approveSpending(
      wethContract,
      "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      amountToWrap
    );

    const uniswapRouterContract = connectContract(
      wallet,
      "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      [
        "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
        "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
      ]
    );

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
