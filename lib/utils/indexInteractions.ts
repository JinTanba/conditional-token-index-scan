import { ethers, type BigNumber } from "ethers"

/** ------- CONSTANTS ------- **/
const collateralToken = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" // USDC‑e (6 dec)
const polygonRPC = "https://polygon-mainnet.g.alchemy.com/v2/xCvVMlO5hVjJ6_w5uJ4EQjSZ0RKiI7ym"
const staticProvider = new ethers.providers.JsonRpcProvider(polygonRPC)

/** Minimal ERC‑20 ABI (approve / allowance / balanceOf / decimals) */
const erc20Abi = [
  "function approve(address spender,uint256 amount) external returns (bool)",
  "function allowance(address owner,address spender) external view returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)",
]

/** Index Contract ABI */
const indexAbi = [
  "function deposit(uint256 amount) external returns (uint256)",
  "function withdraw(uint256 amount) external returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)",
  "function totalSupply() external view returns (uint256)",
  "function getUnderlyingBalance() external view returns (uint256)",
  "function approve(address spender,uint256 amount) external returns (bool)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)",
]

/** Helpers */
const MAX_UINT256 = ethers.constants.MaxUint256
const SIX_DECIMALS = 6
const EIGHTEEN_DECIMALS = 18

/** Get a signer from the browser (throws if none) */
function getWeb3Signer(): ethers.Signer {
  if (!((window as any)?.ethereum)) throw new Error("No injected wallet found")
  const web3Provider = new ethers.providers.Web3Provider((window as any).ethereum)
  return web3Provider.getSigner()
}

/** Connects to the index contract with either signer (TX) or provider (READ) */
export function getIndexContract(address: string, withSigner = false) {
  return new ethers.Contract(address, indexAbi, withSigner ? getWeb3Signer() : staticProvider)
}

/** Connects to USDC with same provider/signer context as index */
function getUsdcContract(withSigner = false) {
  return new ethers.Contract(collateralToken, erc20Abi, withSigner ? getWeb3Signer() : staticProvider)
}

/** -------  PUBLIC API  ------- **/

/**
 * Deposit USDC and mint index tokens.
 * @param indexContractAddress address of deployed index (SplitAndOracleImpl proxy)
 * @param amount               human‑readable USDC amount (e.g. 250.5)
 */
export async function supply(indexContractAddress: string, amount: number) {
  const signer = getWeb3Signer()
  const index = getIndexContract(indexContractAddress, true)
  const usdc = getUsdcContract(true)

  // Convert to 6‑decimals (USDC) Wei
  const value = ethers.utils.parseUnits(amount.toString(), SIX_DECIMALS)

  /* 1.  Ensure allowance */
  const owner = await signer.getAddress()
  const allowance = await usdc.allowance(owner, indexContractAddress)

  if (allowance.lt(value)) {
    const approveTx = await usdc.approve(indexContractAddress, value)
    await approveTx.wait()
  }

  /* 2.  Call deposit(uint256) */
  const tx = await index.deposit(value)
  return tx.wait() // resolve to receipt
}

/**
 * Burn index tokens and redeem underlying.
 * @param indexContractAddress address of deployed index
 * @param amount               human‑readable index amount (18 dec)
 */
export async function withdraw(indexContractAddress: string, amount: number) {
  console.log("Withdraw amount", amount)
  const index = getIndexContract(indexContractAddress, true)

  // Convert to 18‑decimals (index token) Wei
  const value = ethers.utils.parseUnits(amount.toString(), EIGHTEEN_DECIMALS)
  //approve index to move index token
  const approveTx = await index.approve(indexContractAddress, value)
  await approveTx.wait()

  const tx = await index.withdraw(value)
  return tx.wait()
}

/**
 * Read an account's balance of the index token.
 * @param indexContractAddress address of deployed index
 * @param owner                account address
 * @returns BigNumber (18 decimals)
 */
export async function balanceOf(indexContractAddress: string, owner: string) {
  const index = getIndexContract(indexContractAddress)
  return index.balanceOf(owner) as Promise<BigNumber>
}

/* Optional utilities ----------------------------------------------------- */

/** Reads the USDC balance (for UI convenience) */
export async function usdcBalance(address: string) {
  const usdc = getUsdcContract()
  return usdc.balanceOf(address) as Promise<BigNumber>
}

/** Reads the index token's decimals (should be 18, but defensive) */
export async function indexDecimals(indexContractAddress: string) {
  const index = getIndexContract(indexContractAddress)
  return index.decimals() as Promise<number>
}

/** Formats a BigNumber to a human-readable string with specified decimals */
export function formatBigNumber(value: BigNumber, decimals = 18, displayDecimals = 2): string {
  const formatted = ethers.utils.formatUnits(value, decimals)
  const parts = formatted.split(".")
  if (parts.length === 1) return parts[0]
  return `${parts[0]}.${parts[1].substring(0, displayDecimals)}`
}

/** Gets the token symbol */
export async function getTokenSymbol(tokenAddress: string): Promise<string> {
  const token = new ethers.Contract(tokenAddress, erc20Abi, staticProvider)
  return token.symbol()
}

/** Gets the total supply of an index token */
export async function getTotalSupply(indexContractAddress: string): Promise<BigNumber> {
  const index = getIndexContract(indexContractAddress)
  return index.totalSupply() as Promise<BigNumber>
}

/** Gets the underlying balance of the index contract */
export async function getUnderlyingBalance(indexContractAddress: string): Promise<BigNumber> {
  const index = getIndexContract(indexContractAddress)
  return index.getUnderlyingBalance() as Promise<BigNumber>
}


