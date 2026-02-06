/**
 * Darkfibre SDK - TypeScript SDK for the Darkfibre Solana DEX API
 * @packageDocumentation
 */

// Main client
export { DarkfibreSDK } from './client';

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
} from './types';

// Errors
export { APIError, SigningError, ValidationError } from './errors';

// Default export
export { DarkfibreSDK as default } from './client';
