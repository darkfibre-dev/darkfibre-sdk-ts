/**
 * Configuration options for the Darkfibre SDK
 */
export interface SDKConfig {
  /**
   * API key for authenticating with the Darkfibre API
   * Required for all SDK operations. Use web based registration at https://darkfibre.dev/register or DarkfibreSDK.register() to obtain an API key.
   */
  apiKey: string;

  /**
   * Base58-encoded Solana private key (32 or 64 bytes)
   */
  privateKey: string;

  /**
   * Base URL for the API (should include /v1)
   * @default "https://api.darkfibre.dev/v1"
   * @example "https://api.darkfibre.dev/v1"
   */
  baseUrl?: string;
}

/**
 * Transaction priority level affecting fee and processing speed
 */
export type Priority = 'economy' | 'fast' | 'faster' | 'fastest';
