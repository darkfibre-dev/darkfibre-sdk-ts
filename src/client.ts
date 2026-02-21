import { HttpClient } from './core/http-client.js';
import { TransactionSigner, createKeyPairFromBase58 } from './core/signer.js';
import { TradeService } from './services/trade.service.js';
import {
  SDKConfig,
  BuyOptions,
  SellOptions,
  SwapOptions,
  TransactionResult,
  RegisterResult,
  ProfileResult,
} from './types/index.js';
import { RegisterRequest, RegisterResponse, ProfileResponse } from './types/api.js';
import { signBytes, getAddressFromPublicKey } from '@solana/kit';
import bs58 from 'bs58';

/**
 * Main SDK client for interacting with the Darkfibre DEX API
 *
 * @example
 * ```typescript
 * const sdk = new DarkfibreSDK({
 *   apiKey: 'your-api-key',
 *   privateKey: 'your-base58-private-key',
 *   // baseUrl is optional, defaults to 'https://api.darkfibre.dev/v1'
 * });
 *
 * const result = await sdk.buy({
 *   mint: 'token-mint-address',
 *   solAmount: 0.1,
 *   slippage: 0.01,
 *   priority: 'fast'
 * });
 * ```
 */
export class DarkfibreSDK {
  private static readonly MESSAGE_PREFIX = 'darkfibre:';
  private readonly httpClient: HttpClient;
  private readonly tradeService: TradeService;

  /**
   * Creates a new instance of the Darkfibre SDK
   * @param config - SDK configuration options
   */
  constructor(config: SDKConfig) {
    // Initialize core components
    const baseUrl = config.baseUrl ?? 'https://api.darkfibre.dev/v1';
    this.httpClient = new HttpClient(baseUrl, config.apiKey);
    const signer = new TransactionSigner(config.privateKey);

    // Initialize services
    this.tradeService = new TradeService(this.httpClient, signer);
  }

  /**
   * Register a new wallet and get an API key (static method)
   *
   * This method creates a message with the current timestamp, signs it with your wallet,
   * and sends it to the registration endpoint to prove wallet ownership.
   *
   * **Important:** The API key is only returned once on registration. Store it securely!
   *
   * @param privateKey - Base58-encoded Solana private key (32 or 64 bytes)
   * @param baseUrl - Optional API base URL (should include `/v1`). Defaults to `https://api.darkfibre.dev/v1`
   * @returns Registration result with API key and wallet address
   *
   * @example
   * ```typescript
   * // Simple registration (no SDK instance needed)
   * const result = await DarkfibreSDK.register('your-base58-private-key');
   * console.log('API Key:', result.apiKey);
   * console.log('Wallet Address:', result.walletAddress);
   *
   * // Store the API key securely and use it for future SDK instances
   * const sdk = new DarkfibreSDK({
   *   apiKey: result.apiKey,
   *   privateKey: 'your-base58-private-key',
   * });
   * ```
   */
  public static async register(privateKey: string, baseUrl?: string): Promise<RegisterResult> {
    const url = baseUrl ?? 'https://api.darkfibre.dev/v1';

    // Create keypair from private key
    const keyPair = await createKeyPairFromBase58(privateKey);
    const walletAddress = await getAddressFromPublicKey(keyPair.publicKey);

    // Create and sign message
    const timestamp = Date.now();
    const message = `${DarkfibreSDK.MESSAGE_PREFIX}${timestamp}`;
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = await signBytes(keyPair.privateKey, messageBytes);
    const signature = bs58.encode(signatureBytes);

    // Make HTTP request
    const httpClient = new HttpClient(url);
    const response = await httpClient.post<RegisterResponse, RegisterRequest>('/auth/register', {
      walletAddress,
      message,
      signature,
    });

    return response.data.data;
  }

  /**
   * Buy tokens using SOL
   * @param options - Buy operation parameters
   * @returns Transaction result with signature and trade amounts
   *
   * @example
   * ```typescript
   * const result = await sdk.buy({
   *   mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
   *   solAmount: 0.1,
   *   slippage: 0.01,
   *   priority: 'fast'
   * });
   * console.log('Transaction signature:', result.signature);
   * ```
   */
  public async buy(options: BuyOptions): Promise<TransactionResult> {
    return this.tradeService.buy(options);
  }

  /**
   * Sell tokens for SOL
   * @param options - Sell operation parameters
   * @returns Transaction result with signature and trade amounts
   *
   * @example
   * ```typescript
   * const result = await sdk.sell({
   *   mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
   *   tokenAmount: 100,
   *   slippage: 0.01,
   *   priority: 'fast'
   * });
   * console.log('Transaction signature:', result.signature);
   * ```
   */
  public async sell(options: SellOptions): Promise<TransactionResult> {
    return this.tradeService.sell(options);
  }

  /**
   * Swap tokens (generic swap endpoint)
   * @param options - Swap operation parameters
   * @returns Transaction result with signature and trade amounts
   *
   * @example
   * ```typescript
   * const result = await sdk.swap({
   *   inputMint: 'SOL',
   *   outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
   *   amount: 0.002,
   *   swapMode: 'exactIn',
   *   slippage: 0.05,
   *   priority: 'fast'
   * });
   * console.log('Transaction signature:', result.signature);
   * ```
   */
  public async swap(options: SwapOptions): Promise<TransactionResult> {
    return this.tradeService.swap(options);
  }

  /**
   * Get the authenticated user's profile, including wallet info, 30-day trade volume, and current fee tier
   * @returns Profile result with wallet address, volume, and fee tier info
   *
   * @example
   * ```typescript
   * const profile = await sdk.getProfile();
   * console.log('Wallet:', profile.walletAddress);
   * console.log('30d volume:', profile.volume.sol30d, 'SOL');
   * console.log('Current fee:', profile.fee.bps, 'bps');
   * ```
   */
  public async getProfile(): Promise<ProfileResult> {
    const response = await this.httpClient.get<ProfileResponse>('/auth/profile');
    return response.data.data;
  }
}
