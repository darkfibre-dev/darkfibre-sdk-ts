import {
  getTransactionDecoder,
  createKeyPairFromBytes,
  createKeyPairFromPrivateKeyBytes,
  signTransaction,
  getBase64EncodedWireTransaction,
  signBytes,
  getAddressFromPublicKey
} from '@solana/kit';
import bs58 from 'bs58';
import { SigningError } from '../errors';

/**
 * Creates a CryptoKeyPair from a base58-encoded private key
 * Supports both 32-byte private keys and 64-byte keypairs
 * @param privateKey - Base58-encoded private key (32 or 64 bytes)
 * @returns CryptoKeyPair for signing operations
 * @throws SigningError if the private key length is invalid
 */
export async function createKeyPairFromBase58(privateKey: string): Promise<CryptoKeyPair> {
  try {
    const keyBytes = bs58.decode(privateKey);

    // Most common: base58-encoded 64-byte keypair
    if (keyBytes.length === 64) {
      return await createKeyPairFromBytes(keyBytes);
    }
    // Alternate: base58-encoded 32-byte private key
    else if (keyBytes.length === 32) {
      return await createKeyPairFromPrivateKeyBytes(keyBytes);
    } else {
      throw new SigningError(
        `Invalid private key length: ${keyBytes.length} bytes. Expected 32 or 64 bytes.`
      );
    }
  } catch (error) {
    if (error instanceof SigningError) {
      throw error;
    }
    throw new SigningError(
      'Failed to create keypair from private key',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Handles transaction signing operations
 */
export class TransactionSigner {
  private privateKey: string;
  private signer: CryptoKeyPair | null = null;

  constructor(privateKey: string) {
    this.privateKey = privateKey;
  }

  /**
   * Gets or creates the signer keypair from the private key
   */
  private async getSigner(): Promise<CryptoKeyPair> {
    if (!this.signer) {
      this.signer = await createKeyPairFromBase58(this.privateKey);
    }
    return this.signer;
  }

  /**
   * Signs a base64-encoded unsigned transaction
   * @param unsignedTxBase64 - Base64-encoded unsigned transaction
   * @returns Base64-encoded signed transaction
   */
  public async signTransaction(unsignedTxBase64: string): Promise<string> {
    try {
      const signer = await this.getSigner();
      const unsignedTx = getTransactionDecoder().decode(Buffer.from(unsignedTxBase64, 'base64'));
      const signed = await signTransaction([signer], unsignedTx);
      return getBase64EncodedWireTransaction(signed);
    } catch (error) {
      if (error instanceof SigningError) {
        throw error;
      }
      throw new SigningError(
        'Failed to sign transaction',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Signs an arbitrary message with the wallet's private key
   * @param message - Message to sign (as string)
   * @returns Base58-encoded signature
   */
  public async signMessage(message: string): Promise<string> {
    const signer = await this.getSigner();
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = await signBytes(signer.privateKey, messageBytes);
    return bs58.encode(signatureBytes);
  }

  /**
   * Gets the wallet address (public key) associated with this signer
   * @returns Base58-encoded wallet address
   */
  public async getWalletAddress(): Promise<string> {
    const signer = await this.getSigner();
    return await getAddressFromPublicKey(signer.publicKey);
  }
}
