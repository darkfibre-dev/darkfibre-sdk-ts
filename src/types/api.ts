import { TradeEstimates, TradeAmounts } from './trade.js';

/**
 * Standard API error response structure
 */
export interface APIErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

/**
 * Response from buy/sell/swap endpoints
 */
export interface TradeResponse {
  data: {
    /**
     * Token for submitting the signed transaction
     */
    submissionToken: string;

    /**
     * Base64-encoded unsigned transaction
     */
    unsignedTransaction: string;

    /**
     * Transaction expiration timestamp (ISO 8601)
     */
    expiresAt: string;

    /**
     * Trading platform identifier (e.g., "pump_fun")
     */
    platform: string;

    /**
     * Input mint address (from DEX perspective)
     */
    inputMint: string;

    /**
     * Output mint address (from DEX perspective)
     */
    outputMint: string;

    /**
     * Estimated trade amounts with estimated price impact
     */
    estimates: TradeEstimates;

    /**
     * Priority fee cost in SOL
     */
    priorityCost: number;
  };
}

/**
 * Response from submit endpoint
 */
export interface SubmitResponse {
  data: {
    /**
     * Transaction signature
     */
    signature: string;

    /**
     * Transaction status
     */
    status: string;

    /**
     * Solana slot number
     */
    slot: number;

    /**
     * Trading platform identifier (e.g., "pump_fun")
     */
    platform: string;

    /**
     * Input mint address (from DEX perspective)
     */
    inputMint: string;

    /**
     * Output mint address (from DEX perspective)
     */
    outputMint: string;

    /**
     * Actual trade result (may be null if the RPC does not return parsed amounts)
     */
    tradeResult: TradeAmounts | null;

    /**
     * Priority fee cost in SOL
     */
    priorityCost: number;
  };
}

/**
 * Request payload for transaction submission
 */
export interface SubmitRequest {
  /**
   * Token received from buy/sell endpoint
   */
  submissionToken: string;

  /**
   * Base64-encoded signed transaction
   */
  signedTransaction: string;
}

/**
 * Request payload for user registration
 */
export interface RegisterRequest {
  /**
   * Solana wallet address (base58)
   */
  walletAddress: string;

  /**
   * Message in format darkfibre:<timestamp> that was signed
   */
  message: string;

  /**
   * Base58-encoded signature of the message, signed by the wallet
   */
  signature: string;
}

/**
 * Response from registration endpoint
 */
export interface RegisterResponse {
  success: boolean;
  data: {
    /**
     * API key for authenticating with the Darkfibre API
     * Only returned once on registration - store it securely
     */
    apiKey: string;

    /**
     * Wallet address that was registered
     */
    walletAddress: string;
  };
}

/**
 * Result returned from register method
 */
export interface RegisterResult {
  /**
   * API key for authenticating with the Darkfibre API
   * Only returned once on registration - store it securely
   */
  apiKey: string;

  /**
   * Wallet address that was registered
   */
  walletAddress: string;
}
