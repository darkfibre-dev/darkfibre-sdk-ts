/**
 * Test constants for E2E tests
 */

/**
 * SOL mint address (native SOL)
 */
export const SOL_MINT = 'So11111111111111111111111111111111111111112';

/**
 * Test token mint address (from your example)
 * Update this to a token that exists and has liquidity for testing
 */
export const TEST_TOKEN_MINT = '5UUH9RTDiSpq6HKS6bp4NdU9PNJpXRXuiw6ShBTBhgH2';

/**
 * Small test amounts to minimize cost
 */
export const TEST_SOL_AMOUNT = 0.002;
export const TEST_SLIPPAGE = 0.05; // 5%
export const TEST_PRIORITY = 'fast' as const;

/**
 * Very restrictive limits for error testing
 */
export const VERY_LOW_MAX_PRICE_IMPACT = 0.00001; // 0.001%
export const VERY_LOW_MAX_PRIORITY_COST = 0.0000001; // Very small amount

/**
 * Invalid mint address for error testing
 */
export const INVALID_MINT = 'InvalidMintAddress123456789012345678901234567890';

/**
 * Delay between operations (buy/sell, swap/swap) in milliseconds
 */
export const OPERATION_DELAY_MS = 4000;
