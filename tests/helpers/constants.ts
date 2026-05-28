/**
 * Test constants for E2E tests
 */

/**
 * Wrapped SOL mint address (used as the quote mint for SOL/WSOL trades)
 */
export const SOL_MINT = 'So11111111111111111111111111111111111111112';

/**
 * Canonical USDC mint address on Solana mainnet
 */
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

/**
 * Test token mint address (from your example)
 * Update this to a token that exists and has liquidity for testing
 */
export const TEST_TOKEN_MINT = '5UUH9RTDiSpq6HKS6bp4NdU9PNJpXRXuiw6ShBTBhgH2';

/**
 * Test token mint with a USDC pair.
 */
export const TEST_USDC_PAIRED_TOKEN_MINT = '4MqHnbYT4sU4SGeLucMtNFCL5YzbY7b1r3CMsYgvpump';

/**
 * Small test amounts to minimize cost
 */
export const TEST_QUOTE_AMOUNT = 0.0001;
/**
 * Small USDC test amount (1 cent)
 */
export const TEST_USDC_AMOUNT = 0.01;
export const TEST_SLIPPAGE = 0.05; // 5%
export const TEST_PRIORITY = 'economy' as const;

/**
 * Very restrictive limits for error testing
 */
export const VERY_LOW_MAX_PRICE_IMPACT = 0.00001; // 0.001%
export const VERY_LOW_MAX_PRIORITY_COST = 0.00000001; // Very small amount

/**
 * Invalid mint address for error testing
 */
export const INVALID_MINT = 'InvalidMintAddress123456789012345678901234567890';

/**
 * Delay between operations (buy/sell, swap/swap) in milliseconds
 */
export const OPERATION_DELAY_MS = 4000;
