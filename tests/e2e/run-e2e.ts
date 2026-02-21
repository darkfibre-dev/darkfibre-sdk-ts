#!/usr/bin/env node
/**
 * E2E Test Runner
 * 
 * Runs all e2e tests sequentially with explicit delays to avoid rate limits.
 */

import dotenv from 'dotenv';
import { DarkfibreSDK } from '../../src/index';
import { createTestContext, TestStats } from './test-runner';
import { runRegisterTests } from './register.test';
import { runBuySellTests } from './buy-sell.test';
import { runSwapTests } from './swap.test';
import { runErrorTests } from './errors.test';
import { runProfileTests } from './profile.test';

// Load environment variables
dotenv.config();

// Configuration
const DELAY_MS = 5000; // Delay between tests (5 seconds)
const REQUIRED_ENV_VARS = ['API_KEY', 'PRIVATE_KEY'] as const;

/**
 * Validate that all required environment variables are present
 */
function validateEnv(): void {
  const missing: string[] = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please create a .env file with API_KEY and PRIVATE_KEY'
    );
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log('Darkfibre SDK E2E Tests');
  console.log('═'.repeat(50));
  console.log(`Delay between tests: ${DELAY_MS}ms`);
  console.log('═'.repeat(50));

  // Validate environment
  validateEnv();

  // Initialize SDK
  const sdk = new DarkfibreSDK({
    apiKey: process.env.API_KEY!,
    privateKey: process.env.PRIVATE_KEY!,
  });

  // Initialize test statistics
  const stats: TestStats = {
    passed: 0,
    failed: 0,
    failures: [],
  };

  const ctx = createTestContext(DELAY_MS, stats);
  const startTime = Date.now();

  try {
    // Run all test suites sequentially
    await runRegisterTests(ctx);
    await runProfileTests(sdk, ctx);
    await runBuySellTests(sdk, ctx);
    await runSwapTests(sdk, ctx);
    await runErrorTests(sdk, ctx);
  } catch (err) {
    console.error('\nFatal error during test execution:');
    console.error(err);
    process.exit(1);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Print summary
  console.log('\n' + '═'.repeat(50));
  console.log('Test Summary');
  console.log('═'.repeat(50));
  console.log(`Total: ${stats.passed + stats.failed}`);
  console.log(`Passed: ${stats.passed}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`Duration: ${duration}s`);

  if (stats.failures.length > 0) {
    console.log('\nFailed Tests:');
    stats.failures.forEach(({ name, error }) => {
      console.log(`  ${name}`);
      console.log(`    ${error}`);
    });
  }

  console.log('═'.repeat(50));

  // Exit with non-zero code if any test failed
  if (stats.failed > 0) {
    process.exit(1);
  }
}

// Run tests
main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
