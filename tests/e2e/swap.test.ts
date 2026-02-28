import { DarkfibreSDK, Priority } from '../../src/index';
import {
  SOL_MINT,
  TEST_TOKEN_MINT,
  TEST_SOL_AMOUNT,
  TEST_SLIPPAGE,
  TEST_PRIORITY,
  OPERATION_DELAY_MS,
} from '../helpers/constants';
import { TestContext, delay } from './test-runner';

/**
 * Helper: Swap SOL to token and then swap 100% back to SOL to close the account
 */
async function swapAndSwapBack(
  sdk: DarkfibreSDK,
  tokenMint: string,
  solAmount: number,
  slippage: number,
  priority: Priority
) {
  const swapToTokenResult = await sdk.swap({
    inputMint: SOL_MINT,
    outputMint: tokenMint,
    amount: solAmount,
    swapMode: 'exactIn',
    slippage,
    priority
  });

  await delay(OPERATION_DELAY_MS);

  const swapToSolResult = await sdk.swap({
    inputMint: tokenMint,
    outputMint: SOL_MINT,
    amount: swapToTokenResult.tradeResult.outputAmount,
    swapMode: 'exactIn',
    slippage,
    priority
  });

  return { swapToTokenResult, swapToSolResult };
}

export async function runSwapTests(sdk: DarkfibreSDK, ctx: TestContext): Promise<void> {
  console.log('\nSwap Tests');
  console.log('─'.repeat(50));

  await ctx.test('should successfully swap SOL to token and swap 100% back', async () => {
    const { swapToTokenResult, swapToSolResult } = await swapAndSwapBack(
      sdk,
      TEST_TOKEN_MINT,
      TEST_SOL_AMOUNT,
      TEST_SLIPPAGE,
      TEST_PRIORITY
    );

    if (!swapToTokenResult.signature) throw new Error('Swap to token signature is missing');
    if (!swapToTokenResult.signature.match(/^[A-Za-z0-9]{64,}$/)) {
      throw new Error('Swap to token signature format is invalid');
    }
    if (!swapToTokenResult.status) throw new Error('Swap to token status is missing');
    if (swapToTokenResult.slot <= 0) throw new Error('Swap to token slot is invalid');
    if (!swapToTokenResult.platform) throw new Error('Swap to token platform is missing');
    if (!swapToTokenResult.inputMint) throw new Error('Swap to token inputMint is missing');
    if (swapToTokenResult.outputMint !== TEST_TOKEN_MINT) {
      throw new Error(`Swap to token outputMint mismatch: expected ${TEST_TOKEN_MINT}, got ${swapToTokenResult.outputMint}`);
    }
    if (!swapToTokenResult.tradeResult) throw new Error('Swap to token tradeResult is missing');
    if (swapToTokenResult.tradeResult.inputAmount <= 0) throw new Error('Swap to token inputAmount is invalid');
    if (swapToTokenResult.tradeResult.outputAmount <= 0) throw new Error('Swap to token outputAmount is invalid');
    if (swapToTokenResult.priorityCost < 0) throw new Error('Swap to token priorityCost is invalid');

    if (!swapToSolResult.signature) throw new Error('Swap to SOL signature is missing');
    if (!swapToSolResult.signature.match(/^[A-Za-z0-9]{64,}$/)) {
      throw new Error('Swap to SOL signature format is invalid');
    }
    if (!swapToSolResult.status) throw new Error('Swap to SOL status is missing');
    if (swapToSolResult.slot <= 0) throw new Error('Swap to SOL slot is invalid');
    if (!swapToSolResult.platform) throw new Error('Swap to SOL platform is missing');
    if (swapToSolResult.inputMint !== TEST_TOKEN_MINT) {
      throw new Error(`Swap to SOL inputMint mismatch: expected ${TEST_TOKEN_MINT}, got ${swapToSolResult.inputMint}`);
    }
    if (!swapToSolResult.outputMint) throw new Error('Swap to SOL outputMint is missing');
    if (swapToSolResult.tradeResult.inputAmount <= 0) throw new Error('Swap to SOL inputAmount is invalid');
    if (swapToSolResult.tradeResult.outputAmount <= 0) throw new Error('Swap to SOL outputAmount is invalid');
    if (swapToSolResult.priorityCost < 0) throw new Error('Swap to SOL priorityCost is invalid');

    if (swapToSolResult.tradeResult.inputAmount !== swapToTokenResult.tradeResult.outputAmount) {
      throw new Error('Swap amounts do not match');
    }
  });

  await ctx.test('should swap with maxPriceImpact limit', async () => {
    const swap1Result = await sdk.swap({
      inputMint: SOL_MINT,
      outputMint: TEST_TOKEN_MINT,
      amount: TEST_SOL_AMOUNT,
      swapMode: 'exactIn',
      slippage: TEST_SLIPPAGE,
      priority: TEST_PRIORITY,
      maxPriceImpact: 0.5,
    });

    if (!swap1Result.signature) throw new Error('Swap signature is missing');

    await delay(OPERATION_DELAY_MS);

    const swap2Result = await sdk.swap({
      inputMint: TEST_TOKEN_MINT,
      outputMint: SOL_MINT,
      amount: swap1Result.tradeResult.outputAmount,
      swapMode: 'exactIn',
      slippage: TEST_SLIPPAGE,
      priority: TEST_PRIORITY,
    });

    if (!swap2Result.signature) throw new Error('Swap back signature is missing');
    if (swap2Result.tradeResult.inputAmount !== swap1Result.tradeResult.outputAmount) {
      throw new Error('Swap amounts do not match');
    }
  });

  await ctx.test('should swap with maxPriorityCost limit', async () => {
    const swap1Result = await sdk.swap({
      inputMint: SOL_MINT,
      outputMint: TEST_TOKEN_MINT,
      amount: TEST_SOL_AMOUNT,
      swapMode: 'exactIn',
      slippage: TEST_SLIPPAGE,
      priority: TEST_PRIORITY,
      maxPriorityCost: 0.001,
    });

    if (!swap1Result.signature) throw new Error('Swap signature is missing');
    if (swap1Result.priorityCost > 0.001) {
      throw new Error(`Priority cost ${swap1Result.priorityCost} exceeds limit 0.001`);
    }

    await delay(OPERATION_DELAY_MS);

    const swap2Result = await sdk.swap({
      inputMint: TEST_TOKEN_MINT,
      outputMint: SOL_MINT,
      amount: swap1Result.tradeResult.outputAmount,
      swapMode: 'exactIn',
      slippage: TEST_SLIPPAGE,
      priority: TEST_PRIORITY,
    });

    if (!swap2Result.signature) throw new Error('Swap back signature is missing');
    if (swap2Result.tradeResult.inputAmount !== swap1Result.tradeResult.outputAmount) {
      throw new Error('Swap amounts do not match');
    }
  });
}
