import { Priority } from './config.js';

/**
 * Swap mode for determining how amount is interpreted
 */
export type SwapMode = 'exactIn' | 'exactOut';

/**
 * Options for buying tokens
 */
export interface BuyOptions {
  /**
   * Token mint address to buy
   */
  mint: string;

  /**
   * Amount of SOL to spend
   */
  solAmount: number;

  /**
   * Slippage tolerance (e.g., 0.01 for 1%)
   */
  slippage: number;

  /**
   * Transaction priority level
   */
  priority: Priority;

  /**
   * Optional maximum price impact allowed (e.g., 0.1 for 10%).
   * If the trade would exceed this limit, the operation will fail.
   * Price impact shows how much your trade will move the market price.
   */
  maxPriceImpact?: number;

  /**
   * Optional maximum priority fee cost in SOL (e.g., 0.05 for 0.05 SOL).
   * If the priority fee would exceed this limit, the operation will fail.
   * The fastest priority can cost 0.1 SOL or more during peak network conditions.
   */
  maxPriorityCost?: number;
}

/**
 * Options for selling tokens
 */
export interface SellOptions {
  /**
   * Token mint address to sell
   */
  mint: string;

  /**
   * Amount of tokens to sell
   */
  tokenAmount: number;

  /**
   * Slippage tolerance (e.g., 0.01 for 1%)
   */
  slippage: number;

  /**
   * Transaction priority level
   */
  priority: Priority;

  /**
   * Optional maximum price impact allowed (e.g., 0.1 for 10%).
   * If the trade would exceed this limit, the operation will fail.
   * Price impact shows how much your trade will move the market price.
   */
  maxPriceImpact?: number;

  /**
   * Optional maximum priority fee cost in SOL (e.g., 0.05 for 0.05 SOL).
   * If the priority fee would exceed this limit, the operation will fail.
   * The fastest priority can cost 0.1 SOL or more during peak network conditions.
   */
  maxPriorityCost?: number;
}

/**
 * Options for swapping tokens
 */
export interface SwapOptions {
  /**
   * Input mint address or "SOL" for native SOL
   */
  inputMint: string;

  /**
   * Output mint address or "SOL" for native SOL
   */
  outputMint: string;

  /**
   * Amount to swap (interpreted based on swapMode)
   */
  amount: number;

  /**
   * Swap mode: 'exactIn' means amount is the exact input amount,
   * 'exactOut' means amount is the exact output amount
   */
  swapMode: SwapMode;

  /**
   * Slippage tolerance (e.g., 0.05 for 5%, must be 0 <= slippage < 1)
   */
  slippage: number;

  /**
   * Transaction priority level
   */
  priority: Priority;

  /**
   * Optional maximum price impact allowed (e.g., 0.1 for 10%).
   * If the trade would exceed this limit, the operation will fail.
   * Price impact shows how much your trade will move the market price.
   */
  maxPriceImpact?: number;

  /**
   * Optional maximum priority fee cost in SOL (e.g., 0.05 for 0.05 SOL).
   * If the priority fee would exceed this limit, the operation will fail.
   * The fastest priority can cost 0.1 SOL or more during peak network conditions.
   */
  maxPriorityCost?: number;
}

/**
 * Estimated trade amounts from the build phase
 */
export interface TradeEstimates {
  /**
   * Estimated input amount
   */
  inputAmount: number;

  /**
   * Estimated output amount
   */
  outputAmount: number;

  /**
   * Estimated price impact (e.g., 0.00346 means ~0.346% price impact)
   */
  priceImpact: number;
}

/**
 * Actual trade amounts from the completed transaction
 */
export interface TradeAmounts {
  /**
   * Amount of input tokens
   */
  inputAmount: number;

  /**
   * Amount of output tokens
   */
  outputAmount: number;
}

/**
 * Result of a completed transaction
 */
export interface TransactionResult {
  /**
   * Transaction signature
   */
  signature: string;

  /**
   * Transaction status
   */
  status: string;

  /**
   * Solana slot number
   */
  slot: number;

  /**
   * Trading platform identifier (e.g., "pump_fun")
   */
  platform: string;

  /**
   * Input mint address (from DEX perspective)
   */
  inputMint: string;

  /**
   * Output mint address (from DEX perspective)
   */
  outputMint: string;

  /**
   * Actual trade amounts
   */
  tradeResult: TradeAmounts;

  /**
   * Priority fee cost in SOL
   */
  priorityCost: number;
}
