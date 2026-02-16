import { HttpClient } from '../core/http-client.js';
import { TransactionSigner } from '../core/signer.js';
import { ValidationError } from '../errors/index.js';
import {
  BuyOptions,
  SellOptions,
  SwapOptions,
  TransactionResult,
  TradeResponse,
  SubmitResponse,
  SubmitRequest,
} from '../types/index.js';

/**
 * Service for handling trading operations
 */
export class TradeService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly signer: TransactionSigner
  ) {}

  /**
   * Validates price impact against optional limit
   * @param priceImpact - Price impact value
   * @param maxPriceImpact - Optional maximum price impact limit
   * @throws ValidationError if limit is exceeded
   */
  private validatePriceImpact(priceImpact: number, maxPriceImpact?: number): void {
    if (maxPriceImpact !== undefined && priceImpact > maxPriceImpact) {
      throw new ValidationError(
        `Price impact ${(priceImpact * 100).toFixed(2)}% exceeds maximum allowed ${(maxPriceImpact * 100).toFixed(2)}%`,
        'maxPriceImpact'
      );
    }
  }

  /**
   * Validates priority cost against optional limit
   * @param priorityCost - Priority cost in SOL
   * @param maxPriorityCost - Optional maximum priority cost limit
   * @throws ValidationError if limit is exceeded
   */
  private validatePriorityCost(priorityCost: number, maxPriorityCost?: number): void {
    if (maxPriorityCost !== undefined && priorityCost > maxPriorityCost) {
      throw new ValidationError(
        `Priority cost ${priorityCost} SOL exceeds maximum allowed ${maxPriorityCost} SOL`,
        'maxPriorityCost'
      );
    }
  }

  /**
   * Execute a buy operation
   * @param options - Buy parameters
   * @returns Transaction result with signature and trade amounts
   */
  public async buy(options: BuyOptions): Promise<TransactionResult> {
    // Get unsigned transaction from API
    const buyResponse = await this.httpClient.post<TradeResponse, BuyOptions>('/tx/buy', options);

    const { submissionToken, unsignedTransaction, estimates, priorityCost } = buyResponse.data.data;

    // Validate limits before signing (we have exact values at build time)
    this.validatePriceImpact(estimates.priceImpact, options.maxPriceImpact);
    this.validatePriorityCost(priorityCost, options.maxPriorityCost);

    // Sign the transaction
    const signedTransaction = await this.signer.signTransaction(unsignedTransaction);

    // Submit the signed transaction
    const submitRequest: SubmitRequest = {
      submissionToken,
      signedTransaction,
    };

    const submitResponse = await this.httpClient.post<SubmitResponse, SubmitRequest>(
      '/tx/submit',
      submitRequest
    );

    const { signature, status, slot, platform, inputMint, outputMint, tradeResult } =
      submitResponse.data.data;

    return {
      signature,
      status,
      slot,
      platform,
      inputMint,
      outputMint,
      tradeResult: tradeResult ?? {
        inputAmount: estimates.inputAmount,
        outputAmount: estimates.outputAmount,
      },
      priorityCost,
    };
  }

  /**
   * Execute a sell operation
   * @param options - Sell parameters
   * @returns Transaction result with signature and trade amounts
   */
  public async sell(options: SellOptions): Promise<TransactionResult> {
    // Get unsigned transaction from API
    const sellResponse = await this.httpClient.post<TradeResponse, SellOptions>(
      '/tx/sell',
      options
    );

    const { submissionToken, unsignedTransaction, estimates, priorityCost } =
      sellResponse.data.data;

    // Validate limits before signing (we have exact values at build time)
    this.validatePriceImpact(estimates.priceImpact, options.maxPriceImpact);
    this.validatePriorityCost(priorityCost, options.maxPriorityCost);

    // Sign the transaction
    const signedTransaction = await this.signer.signTransaction(unsignedTransaction);

    // Submit the signed transaction
    const submitRequest: SubmitRequest = {
      submissionToken,
      signedTransaction,
    };

    const submitResponse = await this.httpClient.post<SubmitResponse, SubmitRequest>(
      '/tx/submit',
      submitRequest
    );

    const { signature, status, slot, platform, inputMint, outputMint, tradeResult } =
      submitResponse.data.data;

    return {
      signature,
      status,
      slot,
      platform,
      inputMint,
      outputMint,
      tradeResult: tradeResult ?? {
        inputAmount: estimates.inputAmount,
        outputAmount: estimates.outputAmount,
      },
      priorityCost,
    };
  }

  /**
   * Execute a swap operation
   * @param options - Swap parameters
   * @returns Transaction result with signature and trade amounts
   */
  public async swap(options: SwapOptions): Promise<TransactionResult> {
    // Get unsigned transaction from API
    const swapResponse = await this.httpClient.post<TradeResponse, SwapOptions>(
      '/tx/swap',
      options
    );

    const { submissionToken, unsignedTransaction, estimates, priorityCost } =
      swapResponse.data.data;

    // Validate limits before signing (we have exact values at build time)
    this.validatePriceImpact(estimates.priceImpact, options.maxPriceImpact);
    this.validatePriorityCost(priorityCost, options.maxPriorityCost);

    // Sign the transaction
    const signedTransaction = await this.signer.signTransaction(unsignedTransaction);

    // Submit the signed transaction
    const submitRequest: SubmitRequest = {
      submissionToken,
      signedTransaction,
    };

    const submitResponse = await this.httpClient.post<SubmitResponse, SubmitRequest>(
      '/tx/submit',
      submitRequest
    );

    const { signature, status, slot, platform, inputMint, outputMint, tradeResult } =
      submitResponse.data.data;

    return {
      signature,
      status,
      slot,
      platform,
      inputMint,
      outputMint,
      tradeResult: tradeResult ?? {
        inputAmount: estimates.inputAmount,
        outputAmount: estimates.outputAmount,
      },
      priorityCost,
    };
  }
}
