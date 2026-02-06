import { DarkfibreSDK } from '../../src/index';
import {
  SOL_MINT,
  TEST_TOKEN_MINT,
  TEST_SOL_AMOUNT,
  TEST_SLIPPAGE,
  TEST_PRIORITY,
  VERY_LOW_MAX_PRICE_IMPACT,
  VERY_LOW_MAX_PRIORITY_COST,
  INVALID_MINT,
  OPERATION_DELAY_MS,
} from '../helpers/constants';
import { ValidationError } from '../../src/errors/validation.error';
import { APIError } from '../../src/errors/api.error';
import { TestContext, delay } from './test-runner';

export async function runErrorTests(sdk: DarkfibreSDK, ctx: TestContext): Promise<void> {
  console.log('\nError Tests');
  console.log('─'.repeat(50));

  console.log('\n  maxPriceImpact validation');
  await ctx.test('should throw ValidationError when maxPriceImpact is exceeded in buy', async () => {
    try {
      await sdk.buy({
        mint: TEST_TOKEN_MINT,
        solAmount: TEST_SOL_AMOUNT,
        slippage: TEST_SLIPPAGE,
        priority: TEST_PRIORITY,
        maxPriceImpact: VERY_LOW_MAX_PRICE_IMPACT,
      });
      throw new Error('Expected ValidationError to be thrown');
    } catch (err) {
      if (!(err instanceof ValidationError)) {
        throw new Error(`Expected ValidationError, got ${err instanceof Error ? err.constructor.name : typeof err}`);
      }
      if (!err.message.match(/Price impact.*exceeds maximum allowed/i)) {
        throw new Error(`Expected price impact error message, got: ${err.message}`);
      }
    }
  });

  await ctx.test('should throw ValidationError when maxPriceImpact is exceeded in sell', async () => {
    const buyResult = await sdk.buy({
      mint: TEST_TOKEN_MINT,
      solAmount: TEST_SOL_AMOUNT,
      slippage: TEST_SLIPPAGE,
      priority: TEST_PRIORITY,
    });

    await delay(OPERATION_DELAY_MS);

    try {
      await sdk.sell({
        mint: TEST_TOKEN_MINT,
        tokenAmount: buyResult.tradeResult.outputAmount,
        slippage: TEST_SLIPPAGE,
        priority: TEST_PRIORITY,
        maxPriceImpact: VERY_LOW_MAX_PRICE_IMPACT,
      });
      throw new Error('Expected ValidationError to be thrown');
    } catch (err) {
      if (!(err instanceof ValidationError)) {
        throw new Error(`Expected ValidationError, got ${err instanceof Error ? err.constructor.name : typeof err}`);
      }
      if (!err.message.match(/Price impact.*exceeds maximum allowed/i)) {
        throw new Error(`Expected price impact error message, got: ${err.message}`);
      }
    }

    // Cleanup: sell without restrictive limits
    await delay(OPERATION_DELAY_MS);
    try {
      await sdk.sell({
        mint: TEST_TOKEN_MINT,
        tokenAmount: buyResult.tradeResult.outputAmount,
        slippage: TEST_SLIPPAGE,
        priority: TEST_PRIORITY,
      });
    } catch (cleanupErr) {
      console.warn(`    Cleanup sell failed: ${cleanupErr}`);
    }
  });

  await ctx.test('should throw ValidationError when maxPriceImpact is exceeded in swap', async () => {
    try {
      await sdk.swap({
        inputMint: SOL_MINT,
        outputMint: TEST_TOKEN_MINT,
        amount: TEST_SOL_AMOUNT,
        swapMode: 'exactIn',
        slippage: TEST_SLIPPAGE,
        priority: TEST_PRIORITY,
        maxPriceImpact: VERY_LOW_MAX_PRICE_IMPACT,
      });
      throw new Error('Expected ValidationError to be thrown');
    } catch (err) {
      if (!(err instanceof ValidationError)) {
        throw new Error(`Expected ValidationError, got ${err instanceof Error ? err.constructor.name : typeof err}`);
      }
      if (!err.message.match(/Price impact.*exceeds maximum allowed/i)) {
        throw new Error(`Expected price impact error message, got: ${err.message}`);
      }
    }
  });

  console.log('\n  maxPriorityCost validation');
  await ctx.test('should throw ValidationError when maxPriorityCost is exceeded in buy', async () => {
    try {
      await sdk.buy({
        mint: TEST_TOKEN_MINT,
        solAmount: TEST_SOL_AMOUNT,
        slippage: TEST_SLIPPAGE,
        priority: TEST_PRIORITY,
        maxPriorityCost: VERY_LOW_MAX_PRIORITY_COST,
      });
      throw new Error('Expected ValidationError to be thrown');
    } catch (err) {
      if (!(err instanceof ValidationError)) {
        throw new Error(`Expected ValidationError, got ${err instanceof Error ? err.constructor.name : typeof err}`);
      }
      if (!err.message.match(/Priority cost.*exceeds maximum allowed/i)) {
        throw new Error(`Expected priority cost error message, got: ${err.message}`);
      }
    }
  });

  await ctx.test('should throw ValidationError when maxPriorityCost is exceeded in sell', async () => {
    const buyResult = await sdk.buy({
      mint: TEST_TOKEN_MINT,
      solAmount: TEST_SOL_AMOUNT,
      slippage: TEST_SLIPPAGE,
      priority: TEST_PRIORITY,
    });

    await delay(OPERATION_DELAY_MS);

    try {
      await sdk.sell({
        mint: TEST_TOKEN_MINT,
        tokenAmount: buyResult.tradeResult.outputAmount,
        slippage: TEST_SLIPPAGE,
        priority: TEST_PRIORITY,
        maxPriorityCost: VERY_LOW_MAX_PRIORITY_COST,
      });
      throw new Error('Expected ValidationError to be thrown');
    } catch (err) {
      if (!(err instanceof ValidationError)) {
        throw new Error(`Expected ValidationError, got ${err instanceof Error ? err.constructor.name : typeof err}`);
      }
      if (!err.message.match(/Priority cost.*exceeds maximum allowed/i)) {
        throw new Error(`Expected priority cost error message, got: ${err.message}`);
      }
    }

    // Cleanup: sell without restrictive limits
    await delay(OPERATION_DELAY_MS);
    try {
      await sdk.sell({
        mint: TEST_TOKEN_MINT,
        tokenAmount: buyResult.tradeResult.outputAmount,
        slippage: TEST_SLIPPAGE,
        priority: TEST_PRIORITY,
      });
    } catch (cleanupErr) {
      console.warn(`    Cleanup sell failed: ${cleanupErr}`);
    }
  });

  await ctx.test('should throw ValidationError when maxPriorityCost is exceeded in swap', async () => {
    try {
      await sdk.swap({
        inputMint: SOL_MINT,
        outputMint: TEST_TOKEN_MINT,
        amount: TEST_SOL_AMOUNT,
        swapMode: 'exactIn',
        slippage: TEST_SLIPPAGE,
        priority: TEST_PRIORITY,
        maxPriorityCost: VERY_LOW_MAX_PRIORITY_COST,
      });
      throw new Error('Expected ValidationError to be thrown');
    } catch (err) {
      if (!(err instanceof ValidationError)) {
        throw new Error(`Expected ValidationError, got ${err instanceof Error ? err.constructor.name : typeof err}`);
      }
      if (!err.message.match(/Priority cost.*exceeds maximum allowed/i)) {
        throw new Error(`Expected priority cost error message, got: ${err.message}`);
      }
    }
  });

  console.log('\n  API errors');
  await ctx.test('should throw APIError with invalid API key', async () => {
    const invalidSDK = new DarkfibreSDK({
      apiKey: 'invalid-api-key-12345',
      privateKey: process.env.PRIVATE_KEY!,
    });

    try {
      await invalidSDK.buy({
        mint: TEST_TOKEN_MINT,
        solAmount: TEST_SOL_AMOUNT,
        slippage: TEST_SLIPPAGE,
        priority: TEST_PRIORITY,
      });
      throw new Error('Expected APIError to be thrown');
    } catch (err) {
      if (!(err instanceof APIError)) {
        throw new Error(`Expected APIError, got ${err instanceof Error ? err.constructor.name : typeof err}`);
      }
      if (err.status !== 401) {
        throw new Error(`Expected status 401, got ${err.status}`);
      }
    }
  });

  await ctx.test('should throw APIError with invalid mint address', async () => {
    try {
      await sdk.buy({
        mint: INVALID_MINT,
        solAmount: TEST_SOL_AMOUNT,
        slippage: TEST_SLIPPAGE,
        priority: TEST_PRIORITY,
      });
      throw new Error('Expected APIError to be thrown');
    } catch (err) {
      if (!(err instanceof APIError)) {
        throw new Error(`Expected APIError, got ${err instanceof Error ? err.constructor.name : typeof err}`);
      }
      if (err.status < 400) {
        throw new Error(`Expected status >= 400, got ${err.status}`);
      }
      if (!err.code) throw new Error('Error code is missing');
      if (!err.message) throw new Error('Error message is missing');
    }
  });

  await ctx.test('should throw APIError when trying to sell more tokens than owned', async () => {
    const hugeAmount = 999999999999;

    try {
      await sdk.sell({
        mint: TEST_TOKEN_MINT,
        tokenAmount: hugeAmount,
        slippage: TEST_SLIPPAGE,
        priority: TEST_PRIORITY,
      });
      throw new Error('Expected APIError to be thrown');
    } catch (err) {
      if (!(err instanceof APIError)) {
        throw new Error(`Expected APIError, got ${err instanceof Error ? err.constructor.name : typeof err}`);
      }
      if (err.status < 400) {
        throw new Error(`Expected status >= 400, got ${err.status}`);
      }
      if (!err.code) throw new Error('Error code is missing');
    }
  });
}
