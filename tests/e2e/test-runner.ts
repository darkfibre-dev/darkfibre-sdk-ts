/**
 * Shared test runner utilities for E2E tests
 */

export interface TestStats {
  passed: number;
  failed: number;
  failures: Array<{ name: string; error: string }>;
}

export interface TestContext {
  test: (name: string, fn: () => Promise<void>) => Promise<void>;
  delay: (ms: number) => Promise<void>;
  stats: TestStats;
}

/**
 * Delay helper
 */
export async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a test context with shared utilities
 */
export function createTestContext(
  delayMs: number,
  stats: TestStats
): TestContext {
  async function test(name: string, fn: () => Promise<void>): Promise<void> {
    process.stdout.write(`  ${name}... `);
    try {
      await fn();
      console.log('PASS');
      stats.passed++;
    } catch (err) {
      console.log('FAIL');
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`    Error: ${errorMessage}`);
      stats.failures.push({ name, error: errorMessage });
      stats.failed++;
    }
    await delay(delayMs);
  }

  return {
    test,
    delay,
    stats,
  };
}
