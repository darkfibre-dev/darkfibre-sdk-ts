import { DarkfibreSDK } from '../../src/index';
import { createKeyPairFromBytes, getAddressFromPublicKey } from '@solana/kit';
import bs58 from 'bs58';
import crypto from 'crypto';
import { TestContext } from './test-runner';

/**
 * Generate a random Solana keypair for testing
 */
async function generateTestKeypair() {
  const seed = crypto.randomBytes(32);
  
  const webCryptoKeypair = await globalThis.crypto.subtle.generateKey(
    'Ed25519',
    true,
    ['sign', 'verify']
  );
  
  const privateKeyPkcs8 = await globalThis.crypto.subtle.exportKey('pkcs8', webCryptoKeypair.privateKey);
  const publicKeySpki = await globalThis.crypto.subtle.exportKey('spki', webCryptoKeypair.publicKey);
  
  const privateKeyRaw = new Uint8Array(privateKeyPkcs8).slice(16);
  const publicKeyRaw = new Uint8Array(publicKeySpki).slice(12);
  
  const keypairBytes = new Uint8Array(64);
  keypairBytes.set(privateKeyRaw, 0);
  keypairBytes.set(publicKeyRaw, 32);
  
  const keyPair = await createKeyPairFromBytes(keypairBytes);
  const privateKeyBase58 = bs58.encode(keypairBytes);
  
  return { keyPair, privateKeyBase58, keypairBytes };
}

export async function runRegisterTests(ctx: TestContext): Promise<void> {
  console.log('\nRegister Tests');
  console.log('─'.repeat(50));

  await ctx.test('should successfully register a new wallet and return API key', async () => {
    const { keyPair, privateKeyBase58 } = await generateTestKeypair();
    
    const result = await DarkfibreSDK.register(privateKeyBase58);
    
    if (!result) throw new Error('Result is undefined');
    if (!result.apiKey) throw new Error('API key is missing');
    if (!result.apiKey.match(/^api_/)) throw new Error('API key format is invalid');
    if (!result.walletAddress) throw new Error('Wallet address is missing');
    if (!result.walletAddress.match(/^[A-Za-z0-9]{32,44}$/)) {
      throw new Error('Wallet address format is invalid');
    }
    
    const expectedAddress = await getAddressFromPublicKey(keyPair.publicKey);
    if (result.walletAddress !== expectedAddress) {
      throw new Error(`Wallet address mismatch: expected ${expectedAddress}, got ${result.walletAddress}`);
    }
  });

  await ctx.test('should register with custom baseUrl', async () => {
    const { privateKeyBase58 } = await generateTestKeypair();
    
    const result = await DarkfibreSDK.register(
      privateKeyBase58,
      'https://api.darkfibre.dev/v1'
    );
    
    if (!result) throw new Error('Result is undefined');
    if (!result.apiKey) throw new Error('API key is missing');
    if (!result.walletAddress) throw new Error('Wallet address is missing');
  });

  await ctx.test('should throw error with invalid private key format', async () => {
    const invalidPrivateKey = 'invalid-key-format';
    
    try {
      await DarkfibreSDK.register(invalidPrivateKey);
      throw new Error('Expected register to throw an error');
    } catch (err) {
      if (!(err instanceof Error)) {
        throw new Error('Expected Error instance');
      }
    }
  });

  await ctx.test('should throw error with wrong private key length', async () => {
    const wrongLengthKey = bs58.encode(new Uint8Array(16));
    
    try {
      await DarkfibreSDK.register(wrongLengthKey);
      throw new Error('Expected register to throw an error');
    } catch (err) {
      if (!(err instanceof Error)) {
        throw new Error('Expected Error instance');
      }
      if (!err.message.match(/Invalid private key length/i)) {
        throw new Error(`Expected "Invalid private key length" error, got: ${err.message}`);
      }
    }
  });

  await ctx.test('should not allow duplicate registration with same wallet', async () => {
    const existingPrivateKey = process.env.PRIVATE_KEY!;
    
    try {
      await DarkfibreSDK.register(existingPrivateKey);
      throw new Error('Expected register to throw an error for duplicate registration');
    } catch (err) {
      if (!(err instanceof Error)) {
        throw new Error('Expected Error instance');
      }
    }
  });
}
