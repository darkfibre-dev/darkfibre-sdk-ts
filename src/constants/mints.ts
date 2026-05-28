/**
 * Canonical mint addresses for the SDK's quote-currency aliases.
 */
export const Mints = {
  SOL: 'So11111111111111111111111111111111111111112',
  WSOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
} as const;

/**
 * Resolve a `'SOL'` / `'WSOL'` / `'USDC'` alias to its mint address.
 * Any other string is returned unchanged.
 */
export function resolveMint(mint: string): string {
  switch (mint) {
    case 'SOL':
      return Mints.SOL;
    case 'WSOL':
      return Mints.WSOL;
    case 'USDC':
      return Mints.USDC;
    default:
      return mint;
  }
}
