/**
 * Darkfibre SDK - TypeScript SDK for the Darkfibre Solana DEX API
 * @packageDocumentation
 */

// Main client
export { DarkfibreSDK } from './client.js';

// Types
export type {
  SDKConfig,
  Priority,
  BuyOptions,
  SellOptions,
  SwapOptions,
  SwapMode,
  TradeEstimates,
  TradeAmounts,
  TransactionResult,
  RegisterResult,
  ProfileResult,
} from './types/index.js';

// Errors
export { APIError, SigningError, ValidationError } from './errors/index.js';

// Default export
export { DarkfibreSDK as default } from './client.js';
