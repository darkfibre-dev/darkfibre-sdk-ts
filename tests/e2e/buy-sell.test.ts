import { DarkfibreSDK, Priority } from '../../src/index';
import {
  TEST_TOKEN_MINT,
  TEST_SOL_AMOUNT,
  TEST_SLIPPAGE,
  TEST_PRIORITY,
  OPERATION_DELAY_MS,
} from '../helpers/constants';
import { TestContext, delay } from './test-runner';

/**
 * Helper: Buy tokens and then sell 100% back to close the account
 */
async function buyAndSellBack(
  sdk: DarkfibreSDK,
  mint: string,
  solAmount: number,
  slippage: number,
  priority: Priority
) {
  const buyResult = await sdk.buy({
    mint,
    solAmount,
    slippage,
    priority
  });

  await delay(OPERATION_DELAY_MS);

  const sellResult = await sdk.sell({
    mint,
    tokenAmount: buyResult.tradeResult.outputAmount,
    slippage,
    priority
  });

  return { buyResult, sellResult };
}

export async function runBuySellTests(sdk: DarkfibreSDK, ctx: TestContext): Promise<void> {
  console.log('\nBuy/Sell Tests');
  console.log('─'.repeat(50));

  await ctx.test('should successfully buy tokens and sell 100% back', async () => {
    const { buyResult, sellResult } = await buyAndSellBack(
      sdk,
      TEST_TOKEN_MINT,
      TEST_SOL_AMOUNT,
      TEST_SLIPPAGE,
      TEST_PRIORITY
    );

    if (!buyResult.signature) throw new Error('Buy signature is missing');
    if (!buyResult.signature.match(/^[A-Za-z0-9]{64,}$/)) {
      throw new Error('Buy signature format is invalid');
    }
    if (!buyResult.status) throw new Error('Buy status is missing');
    if (buyResult.slot <= 0) throw new Error('Buy slot is invalid');
    if (!buyResult.platform) throw new Error('Buy platform is missing');
    if (!buyResult.inputMint) throw new Error('Buy inputMint is missing');
    if (buyResult.outputMint !== TEST_TOKEN_MINT) {
      throw new Error(`Buy outputMint mismatch: expected ${TEST_TOKEN_MINT}, got ${buyResult.outputMint}`);
    }
    if (!buyResult.tradeResult) throw new Error('Buy tradeResult is missing');
    if (buyResult.tradeResult.inputAmount <= 0) throw new Error('Buy inputAmount is invalid');
    if (buyResult.tradeResult.outputAmount <= 0) throw new Error('Buy outputAmount is invalid');
    if (buyResult.priorityCost < 0) throw new Error('Buy priorityCost is invalid');

    if (!sellResult.signature) throw new Error('Sell signature is missing');
    if (!sellResult.signature.match(/^[A-Za-z0-9]{64,}$/)) {
      throw new Error('Sell signature format is invalid');
    }
    if (!sellResult.status) throw new Error('Sell status is missing');
    if (sellResult.slot <= 0) throw new Error('Sell slot is invalid');
    if (!sellResult.platform) throw new Error('Sell platform is missing');
    if (sellResult.inputMint !== TEST_TOKEN_MINT) {
      throw new Error(`Sell inputMint mismatch: expected ${TEST_TOKEN_MINT}, got ${sellResult.inputMint}`);
    }
    if (!sellResult.outputMint) throw new Error('Sell outputMint is missing');
    if (!sellResult.tradeResult) throw new Error('Sell tradeResult is missing');
    if (sellResult.tradeResult.inputAmount <= 0) throw new Error('Sell inputAmount is invalid');
    if (sellResult.tradeResult.outputAmount <= 0) throw new Error('Sell outputAmount is invalid');
    if (sellResult.priorityCost < 0) throw new Error('Sell priorityCost is invalid');

    if (sellResult.tradeResult.inputAmount !== buyResult.tradeResult.outputAmount) {
      throw new Error('Sell amount does not match buy amount');
    }
  });

  await ctx.test('should buy with maxPriceImpact limit and sell back', async () => {
    const buyResult = await sdk.buy({
      mint: TEST_TOKEN_MINT,
      solAmount: TEST_SOL_AMOUNT,
      slippage: TEST_SLIPPAGE,
      priority: TEST_PRIORITY,
      maxPriceImpact: 0.5,
    });

    if (!buyResult.signature) throw new Error('Buy signature is missing');

    await delay(OPERATION_DELAY_MS);

    const sellResult = await sdk.sell({
      mint: TEST_TOKEN_MINT,
      tokenAmount: buyResult.tradeResult.outputAmount,
      slippage: TEST_SLIPPAGE,
      priority: TEST_PRIORITY,
    });

    if (!sellResult.signature) throw new Error('Sell signature is missing');
    if (sellResult.tradeResult.inputAmount !== buyResult.tradeResult.outputAmount) {
      throw new Error('Sell amount does not match buy amount');
    }
  });

  await ctx.test('should buy with maxPriorityCost limit and sell back', async () => {
    const buyResult = await sdk.buy({
      mint: TEST_TOKEN_MINT,
      solAmount: TEST_SOL_AMOUNT,
      slippage: TEST_SLIPPAGE,
      priority: TEST_PRIORITY,
      maxPriorityCost: 0.001,
    });

    if (!buyResult.signature) throw new Error('Buy signature is missing');
    if (buyResult.priorityCost > 0.001) {
      throw new Error(`Priority cost ${buyResult.priorityCost} exceeds limit 0.001`);
    }

    await delay(OPERATION_DELAY_MS);

    const sellResult = await sdk.sell({
      mint: TEST_TOKEN_MINT,
      tokenAmount: buyResult.tradeResult.outputAmount,
      slippage: TEST_SLIPPAGE,
      priority: TEST_PRIORITY,
    });

    if (!sellResult.signature) throw new Error('Sell signature is missing');
    if (sellResult.tradeResult.inputAmount !== buyResult.tradeResult.outputAmount) {
      throw new Error('Sell amount does not match buy amount');
    }
  });

  await ctx.test('should sell with maxPriceImpact limit', async () => {
    const buyResult = await sdk.buy({
      mint: TEST_TOKEN_MINT,
      solAmount: TEST_SOL_AMOUNT,
      slippage: TEST_SLIPPAGE,
      priority: TEST_PRIORITY,
    });

    await delay(OPERATION_DELAY_MS);

    const sellResult = await sdk.sell({
      mint: TEST_TOKEN_MINT,
      tokenAmount: buyResult.tradeResult.outputAmount,
      slippage: TEST_SLIPPAGE,
      priority: TEST_PRIORITY,
      maxPriceImpact: 0.5,
    });

    if (!sellResult.signature) throw new Error('Sell signature is missing');
    if (!sellResult.signature.match(/^[A-Za-z0-9]{64,}$/)) {
      throw new Error('Sell signature format is invalid');
    }
    if (sellResult.tradeResult && sellResult.tradeResult.inputAmount !== buyResult.tradeResult.outputAmount) {
      throw new Error('Sell amount does not match buy amount');
    }
  });

  await ctx.test('should sell with maxPriorityCost limit', async () => {
    const buyResult = await sdk.buy({
      mint: TEST_TOKEN_MINT,
      solAmount: TEST_SOL_AMOUNT,
      slippage: TEST_SLIPPAGE,
      priority: TEST_PRIORITY,
    });

    await delay(OPERATION_DELAY_MS);

    const sellResult = await sdk.sell({
      mint: TEST_TOKEN_MINT,
      tokenAmount: buyResult.tradeResult.outputAmount,
      slippage: TEST_SLIPPAGE,
      priority: TEST_PRIORITY,
      maxPriorityCost: 0.001,
    });

    if (!sellResult.signature) throw new Error('Sell signature is missing');
    if (!sellResult.signature.match(/^[A-Za-z0-9]{64,}$/)) {
      throw new Error('Sell signature format is invalid');
    }
    if (sellResult.priorityCost > 0.001) {
      throw new Error(`Priority cost ${sellResult.priorityCost} exceeds limit 0.001`);
    }
    if (sellResult.tradeResult && sellResult.tradeResult.inputAmount !== buyResult.tradeResult.outputAmount) {
      throw new Error('Sell amount does not match buy amount');
    }
  });
}
