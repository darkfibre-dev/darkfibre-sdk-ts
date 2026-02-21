# Darkfibre SDK
Official TypeScript SDK for trading on Solana with the Darkfibre trading API.

Darkfibre builds the transaction, **you** sign it locally and the SDK submits it through our priority lanes for fast block inclusion.

**Your private keys never leave your device**.

[![npm version](https://img.shields.io/npm/v/@darkfibre/sdk.svg)](https://www.npmjs.com/package/@darkfibre/sdk)

## What this SDK does
It wraps the core flow:

1. **Build** – ask the Darkfibre API to build you a trade transaction.
2. **Sign** – sign the transaction locally.
3. **Submit** – send the signed transaction back for priority execution.
4. **Receive result** – get the real on-chain outcome once the trade lands.

> For deeper explanations, architecture, and examples, see the documentation: [https://docs.darkfibre.dev/](https://docs.darkfibre.dev/)

## Installation

```bash
npm install @darkfibre/sdk
```

## Quick Start

```typescript
import { DarkfibreSDK } from '@darkfibre/sdk';

const sdk = new DarkfibreSDK({
  apiKey: 'your-api-key',
  privateKey: 'your-base58-private-key',
});

// Buy tokens
const result = await sdk.buy({
  mint: 'token-mint-address',
  solAmount: 0.01,
  slippage: 0.05,
  priority: 'fast'
});

console.log('Transaction signature:', result.signature);
console.log('Status:', result.status);
console.log('Trade result:', result.tradeResult);
```

## API Reference

### Constructor

```typescript
new DarkfibreSDK(config: SDKConfig)
```

**Parameters:**
- `config.apiKey` - Your Darkfibre API key
- `config.privateKey` - Base58-encoded Solana private key (32 or 64 bytes)
- `config.baseUrl` - (Optional) API base URL (should include `/v1`). Defaults to `https://api.darkfibre.dev/v1`

### Response Format

All trading methods (`buy`, `sell`, `swap`) return a `TransactionResult` object with the following structure:

```typescript
{
  signature: string;        // Transaction signature
  status: string;           // Transaction status (e.g., "confirmed")
  slot: number;             // Solana slot number
  platform: string;         // Trading platform identifier (e.g., "pump_fun")
  inputMint: string;        // Input mint address (from DEX perspective)
  outputMint: string;       // Output mint address (from DEX perspective)
  tradeResult: {            // Actual trade amounts (or fallback to estimates)
    inputAmount: number;
    outputAmount: number;
  };
  priorityCost: number;     // Priority fee cost in SOL
}
```

> **Note:** `inputMint` / `outputMint` are from the DEX perspective (what goes in vs what comes out).

### Methods

#### `DarkfibreSDK.register(privateKey: string, baseUrl?: string): Promise<RegisterResult>`

Register a new wallet and get an API key. This is a static method that doesn't require instantiating the SDK. It creates a message with the current timestamp, signs it with your wallet, and sends it to the registration endpoint to prove wallet ownership.

**Important:** The API key is only returned once on registration. Store it securely!

**Parameters:**
- `privateKey` - Base58-encoded Solana private key (32 or 64 bytes)
- `baseUrl` - (Optional) API base URL (should include `/v1`). Defaults to `https://api.darkfibre.dev/v1`

**Returns:** `RegisterResult` with:
- `apiKey` - API key for authenticating with the Darkfibre API
- `walletAddress` - Wallet address that was registered

**Example:**

```typescript
// Simple registration (no SDK instance needed)
const result = await DarkfibreSDK.register('your-base58-private-key');
console.log('API Key:', result.apiKey);
console.log('Wallet Address:', result.walletAddress);

// Store the API key securely and use it for future SDK instances
const sdk = new DarkfibreSDK({
  apiKey: result.apiKey,
  privateKey: 'your-base58-private-key',
});
```

For simpler browser-based wallet registration, you can use: [https://darkfibre.dev/register](https://darkfibre.dev/register)

#### `getProfile(): Promise<ProfileResult>`

Returns the authenticated user's wallet info, 30-day rolling trade volume, and current fee tier. The fee tier is computed live from the rolling window on every request.

**Returns:** `ProfileResult` with:
- `walletAddress` - Registered wallet address
- `createdAt` - Account creation timestamp (ISO 8601)
- `volume.sol30d` - Total SOL traded in the last 30 days
- `volume.trades30d` - Number of confirmed trades in the last 30 days
- `fee.bps` - Current platform fee in basis points (e.g. `50` = 0.5%)
- `fee.decimal` - Current platform fee as a decimal (e.g. `0.005` = 0.5%)
- `fee.nextBps` - Fee tier unlocked at the next volume threshold (`null` if already at top tier)
- `fee.nextThresholdSol` - SOL volume needed to reach `nextBps` (`null` if already at top tier)

**Example:**

```typescript
const profile = await sdk.getProfile();
console.log('Wallet:', profile.walletAddress);
console.log('30d volume:', profile.volume.sol30d, 'SOL');
console.log('Current fee:', profile.fee.bps, 'bps');
```

#### `buy(options: BuyOptions): Promise<TransactionResult>`

Buy tokens using SOL.

**Parameters:**
- `mint` - Token mint address to buy
- `solAmount` - Amount of SOL to spend
- `slippage` - Slippage tolerance (e.g., 0.01 for 1%)
- `priority` - Transaction priority: `'fast'`, `'faster'`, or `'fastest'`
- `maxPriceImpact` - (Optional) Maximum price impact allowed (e.g., 0.1 for 10%)
- `maxPriorityCost` - (Optional) Maximum priority fee cost in SOL (e.g., 0.05 for 0.05 SOL)

**Returns:** `TransactionResult` (see [Response Format](#response-format))

**Example:**

```typescript
const result = await sdk.buy({
  mint: 'token-mint-address',
  solAmount: 0.01,
  slippage: 0.05,
  priority: 'fast',
  maxPriceImpact: 0.1,      // Optional: reject if price impact > 10%
  maxPriorityCost: 0.05      // Optional: reject if priority fee > 0.05 SOL
});

console.log('Signature:', result.signature);
console.log('Status:', result.status);
console.log('Trade result:', result.tradeResult);
```

#### `sell(options: SellOptions): Promise<TransactionResult>`

Sell tokens for SOL.

**Parameters:**
- `mint` - Token mint address to sell
- `tokenAmount` - Amount of tokens to sell
- `slippage` - Slippage tolerance (e.g., 0.01 for 1%)
- `priority` - Transaction priority: `'fast'`, `'faster'`, or `'fastest'`
- `maxPriceImpact` - (Optional) Maximum price impact allowed (e.g., 0.1 for 10%).
- `maxPriorityCost` - (Optional) Maximum priority fee cost in SOL (e.g., 0.05 for 0.05 SOL).

**Returns:** `TransactionResult` (see [Response Format](#response-format))

**Example:**

```typescript
const result = await sdk.sell({
  mint: 'token-mint-address',
  tokenAmount: 1000,
  slippage: 0.05,
  priority: 'fast',
  maxPriceImpact: 0.1,      // Optional: reject if price impact > 10%
  maxPriorityCost: 0.05      // Optional: reject if priority fee > 0.05 SOL
});
```

#### `swap(options: SwapOptions): Promise<TransactionResult>`

Swap tokens using the generic swap endpoint (power endpoint).

**Parameters:**
- `inputMint` - Input token mint address
- `outputMint` - Output token mint address
- `amount` - Amount to swap
- `swapMode` - `'exactIn'` or `'exactOut'`
- `slippage` - Slippage tolerance (e.g., 0.05 for 5%)
- `priority` - `'fast'`, `'faster'`, or `'fastest'`
- `maxPriceImpact` - (Optional) Maximum price impact allowed (e.g., 0.1 for 10%).
- `maxPriorityCost` - (Optional) Maximum priority fee cost in SOL (e.g., 0.05 for 0.05 SOL).

**Returns:** `TransactionResult` (see [Response Format](#response-format))

**Note:** Currently, at least one of `inputMint` or `outputMint` must be SOL or WSOL. For more details, see the [swap API documentation](https://docs.darkfibre.dev/api/tx-swap/).

**Example:**

```typescript
const result = await sdk.swap({
  inputMint: 'So11111111111111111111111111111111111111112',
  outputMint: 'token-mint-address',
  amount: 0.01,
  swapMode: 'exactIn',
  slippage: 0.05,
  priority: 'fast',
  maxPriceImpact: 0.1,      // Optional: reject if price impact > 10%
  maxPriorityCost: 0.05      // Optional: reject if priority fee > 0.05 SOL
});
```

## Error Handling

The SDK throws specific error types for different failure modes:

```typescript
import { APIError, SigningError, ValidationError } from '@darkfibre/sdk';

try {
  const result = await sdk.buy({...});
} catch (error) {
  if (error instanceof APIError) {
    console.error('API Error:', error.code, error.message, error.status);
  } else if (error instanceof SigningError) {
    console.error('Signing Error:', error.message);
  } else if (error instanceof ValidationError) {
    console.error('Validation Error:', error.field, error.message);
  }
}
```

## Types

All TypeScript types are exported for use in your application:

```typescript
import type {
  SDKConfig,
  Priority,
  BuyOptions,
  SellOptions,
  SwapOptions,
  SwapMode,
  TradeEstimates,
  TradeAmounts,
  TransactionResult,
  ProfileResult,
} from '@darkfibre/sdk';
```

## Development

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
npm run lint:fix
```

### Format

```bash
npm run format
npm run format:check
```

---

## License

This SDK is licensed under the **Business Source License 1.1 (BUSL-1.1)**. You have complete freedom to use, modify, and integrate it into your trading applications for commercial purposes.

> This license protects our work from being repurposed by competing trading platforms.

**You can:**
- Build trading bots, platforms, and applications using Darkfibre (including commercial use)
- Modify the SDK to fit your application's needs
- Distribute your applications that incorporate this SDK

**You cannot:**
- Modify this SDK to connect to competing trading APIs and distribute it
- Create an SDK, API wrapper, or client library for competing trading services based on this code
- Fork this to build infrastructure that competes with or replaces Darkfibre

**In short:** Use this SDK to build with Darkfibre, not to help Darkfibre's competitors.

For full terms, see the [LICENSE](./LICENSE) file.