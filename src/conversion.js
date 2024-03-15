const { ethers } = require("ethers");

async function main() {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "http://localhost:8545"
    );
    const wallet = await connectWallet(provider);

    const address = wallet.address;

    // Display initial balances
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

    // Display balances after wrapping ETH
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

    // Display final balances after swapping WETH to USDT
    await displayBalances(
      provider,
      address,
      "Final Balances After Swapping WETH to USDT"
    );
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

async function displayBalances(provider, address, title) {
  console.log("\n" + title);
  console.log("===========================================");
  console.log(
    "ETH balance:",
    ethers.utils.formatEther(await provider.getBalance(address))
  );

  const wethContractAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const wethContract = new ethers.Contract(
    wethContractAddress,
    ["function balanceOf(address owner) view returns (uint256)"],
    provider
  );
  console.log(
    "WETH balance:",
    ethers.utils.formatEther(await wethContract.balanceOf(address))
  );

  const usdtContractAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  const usdtContract = new ethers.Contract(
    usdtContractAddress,
    ["function balanceOf(address owner) view returns (uint256)"],
    provider
  );
  console.log(
    "USDT balance:",
    ethers.utils.formatUnits(await usdtContract.balanceOf(address), 6)
  );
}

async function connectWallet(provider) {
  const privateKey =
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  return new ethers.Wallet(privateKey, provider);
}

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

main().catch(console.error);
