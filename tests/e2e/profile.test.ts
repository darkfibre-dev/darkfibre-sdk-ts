import { DarkfibreSDK } from '../../src/index';
import { APIError } from '../../src/errors/api.error';
import { TestContext } from './test-runner';

const VALID_FEE_TIERS_BPS = [20, 25, 35, 45, 50];

export async function runProfileTests(sdk: DarkfibreSDK, ctx: TestContext): Promise<void> {
  console.log('\nProfile Tests');
  console.log('─'.repeat(50));

  await ctx.test('should return profile with wallet address and fee info', async () => {
    const profile = await sdk.getProfile();

    if (!profile) throw new Error('Profile result is undefined');
    if (typeof profile.walletAddress !== 'string' || !profile.walletAddress) {
      throw new Error('walletAddress is missing or not a string');
    }
    if (typeof profile.createdAt !== 'string' || !profile.createdAt) {
      throw new Error('createdAt is missing or not a string');
    }
    if (!profile.volume) throw new Error('volume is missing');
    if (typeof profile.volume.sol30d !== 'number') {
      throw new Error('volume.sol30d is missing or not a number');
    }
    if (typeof profile.volume.trades30d !== 'number') {
      throw new Error('volume.trades30d is missing or not a number');
    }
    if (!profile.fee) throw new Error('fee is missing');
    if (typeof profile.fee.bps !== 'number') {
      throw new Error('fee.bps is missing or not a number');
    }
    if (typeof profile.fee.decimal !== 'number') {
      throw new Error('fee.decimal is missing or not a number');
    }
    if (profile.fee.nextBps !== null && typeof profile.fee.nextBps !== 'number') {
      throw new Error('fee.nextBps must be a number or null');
    }
    if (profile.fee.nextThresholdSol !== null && typeof profile.fee.nextThresholdSol !== 'number') {
      throw new Error('fee.nextThresholdSol must be a number or null');
    }
  });

  await ctx.test('should return valid fee tier values', async () => {
    const profile = await sdk.getProfile();

    if (!VALID_FEE_TIERS_BPS.includes(profile.fee.bps)) {
      throw new Error(
        `fee.bps ${profile.fee.bps} is not a recognized tier (expected one of ${VALID_FEE_TIERS_BPS.join(', ')})`
      );
    }

    const expectedDecimal = profile.fee.bps / 10000;
    if (Math.abs(profile.fee.decimal - expectedDecimal) > 1e-9) {
      throw new Error(
        `fee.decimal ${profile.fee.decimal} does not match fee.bps / 10000 = ${expectedDecimal}`
      );
    }

    // nextBps and nextThresholdSol must either both be null (top tier) or both be numbers
    const bothNull = profile.fee.nextBps === null && profile.fee.nextThresholdSol === null;
    const bothPresent =
      typeof profile.fee.nextBps === 'number' && typeof profile.fee.nextThresholdSol === 'number';
    if (!bothNull && !bothPresent) {
      throw new Error('fee.nextBps and fee.nextThresholdSol must both be null or both be numbers');
    }
  });

  await ctx.test('should throw APIError with invalid API key', async () => {
    const invalidSdk = new DarkfibreSDK({
      apiKey: 'invalid-api-key-12345',
      privateKey: process.env.PRIVATE_KEY!,
    });

    try {
      await invalidSdk.getProfile();
      throw new Error('Expected APIError to be thrown');
    } catch (err) {
      if (!(err instanceof APIError)) {
        throw new Error(
          `Expected APIError, got ${err instanceof Error ? err.constructor.name : typeof err}`
        );
      }
      if (err.status !== 401) {
        throw new Error(`Expected status 401, got ${err.status}`);
      }
    }
  });
}
