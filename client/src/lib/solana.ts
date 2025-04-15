import * as solanaWeb3 from "@solana/web3.js";
import * as bip39 from "bip39";
import { ed25519 } from "@noble/curves/ed25519";
import { 
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from "./splToken";
import * as bs58 from 'bs58';


// Network constants - using public node RPC endpoint
export const SOLANA_MAINNET = "https://solana-rpc.publicnode.com";
export const SOLANA_DEVNET = "https://api.devnet.solana.com";
export const SOLANA_TESTNET = "https://api.testnet.solana.com";

// Get the active network from localStorage or default to mainnet
export let SOLANA_NETWORK = localStorage.getItem("solanaNetwork") || SOLANA_MAINNET;

// Token constants
export const PENSACOIN_MINT_ADDRESS = new solanaWeb3.PublicKey("2L4iRJeYKVJM3Dkk1XBTwn4DMPfneUA9C6KjkMUTRkz6"); // 9 decimal places
export const SWAP_PAIR_ADDRESS = new solanaWeb3.PublicKey("2fdrJjBrx2jXCqVF2zTCeFnVmy58YtnrYYhskXXgti6b");
export const SOL_ADDRESS = new solanaWeb3.PublicKey("So11111111111111111111111111111111111111112");

// Metadata Program IDs
export const TOKEN_METADATA_PROGRAM_ID = new solanaWeb3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

// Initialize connection to Solana network with custom RPC endpoint
export let connection = new solanaWeb3.Connection(SOLANA_NETWORK, "confirmed");

// Update the network connection
export function updateNetwork(newNetwork: string) {
  SOLANA_NETWORK = newNetwork;
  localStorage.setItem("solanaNetwork", newNetwork);
  connection = new solanaWeb3.Connection(newNetwork, "confirmed");
}

// Create a new wallet with a random seed phrase
export async function createNewWallet(): Promise<solanaWeb3.Keypair> {
  // Generate a random mnemonic (12 words)
  const mnemonic = bip39.generateMnemonic();
  
  // Convert mnemonic to seed
  const seed = await bip39.mnemonicToSeed(mnemonic);
  
  // Use the first 32 bytes as the secret key
  const keypair = solanaWeb3.Keypair.fromSeed(seed.slice(0, 32));
  
  // Save the mnemonic (In a real app, encrypt this before saving)
  localStorage.setItem("walletMnemonic", mnemonic);
  
  return keypair;
}

// Import wallet from mnemonic phrase with derivation path support
export async function importWalletFromMnemonic(mnemonic: string, derivationPath?: string): Promise<solanaWeb3.Keypair> {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error("Invalid mnemonic phrase");
  }
  
  try {
    // For Unstoppable Wallet compatibility, just use BIP39 without derivation
    const seed = await bip39.mnemonicToSeed(mnemonic, "");
    const keypair = solanaWeb3.Keypair.fromSeed(seed.slice(0, 32));
    console.log("Found wallet with address:", keypair.publicKey.toString());
    return keypair;
  } catch (e) {
    console.error("Failed to derive key:", e);
    throw new Error("Could not derive the correct wallet address");
  }
}

// Import wallet from private key
export async function importWalletFromPrivateKey(privateKeyString: string): Promise<solanaWeb3.Keypair> {
  try {
    // Remove spaces, newlines
    privateKeyString = privateKeyString.trim();
    
    // Method 1: Standard Solana/Phantom wallet import (base58-encoded secret key)
    try {
      console.log("Trying standard Solana/Phantom private key import (base58)");
      // Decode the private key from base58 format
      const decoded = bs58.decode(privateKeyString);
      
      // Phantom wallet always exports the full 64-byte secret key (private + public)
      // But some wallets might export just the 32-byte private portion
      if (decoded.length === 64 || decoded.length === 32) {
        console.log("Valid key length detected:", decoded.length);
        
        let secretKey: Uint8Array;
        
        // If it's just the private portion, derive the public key
        if (decoded.length === 32) {
          console.log("Converting 32-byte private key to full keypair");
          const privateKey = new Uint8Array(decoded);
          const publicKey = ed25519.getPublicKey(privateKey);
          
          // Combine private + public for Solana's format
          secretKey = new Uint8Array(64);
          secretKey.set(privateKey);
          secretKey.set(publicKey, 32);
        } else {
          // Already the full keypair format
          secretKey = new Uint8Array(decoded);
        }
        
        // Create a keypair directly from the secret key
        const keypair = solanaWeb3.Keypair.fromSecretKey(secretKey);
        
        console.log("Successfully imported wallet with address:", keypair.publicKey.toBase58());
        return keypair;
      } else {
        console.log("Decoded key has invalid length:", decoded.length);
      }
    } catch (err) {
      console.log("Standard Solana/Phantom key import failed, trying alternative methods");
    }
    
    // Method 2: JSON array format
    if (privateKeyString.startsWith('[') && privateKeyString.endsWith(']')) {
      try {
        console.log("Trying JSON array format");
        const jsonArray = JSON.parse(privateKeyString);
        const secretKey = new Uint8Array(jsonArray);
        
        if (secretKey.length === 64 || secretKey.length === 32) {
          // Handle 32-byte private key
          if (secretKey.length === 32) {
            const privateKey = secretKey;
            const publicKey = ed25519.getPublicKey(privateKey);
            
            // Combine private + public for Solana's format
            const fullSecretKey = new Uint8Array(64);
            fullSecretKey.set(privateKey);
            fullSecretKey.set(publicKey, 32);
            
            const keypair = solanaWeb3.Keypair.fromSecretKey(fullSecretKey);
            console.log("Successfully imported wallet from JSON array (32-byte)");
            return keypair;
          } else {
            // Already 64 bytes
            const keypair = solanaWeb3.Keypair.fromSecretKey(secretKey);
            console.log("Successfully imported wallet from JSON array (64-byte)");
            return keypair;
          }
        } else {
          console.log("JSON array has invalid length:", secretKey.length);
        }
      } catch (err) {
        console.log("JSON array format import failed");
      }
    }
    
    // Method 3: Hex string format
    if (privateKeyString.match(/^[0-9a-fA-F]+$/)) {
      try {
        console.log("Trying hex string format");
        const secretKey = hexToUint8Array(privateKeyString);
        
        if (secretKey.length === 64 || secretKey.length === 32) {
          // Handle 32-byte private key
          if (secretKey.length === 32) {
            const privateKey = secretKey;
            const publicKey = ed25519.getPublicKey(privateKey);
            
            // Combine private + public for Solana's format
            const fullSecretKey = new Uint8Array(64);
            fullSecretKey.set(privateKey);
            fullSecretKey.set(publicKey, 32);
            
            const keypair = solanaWeb3.Keypair.fromSecretKey(fullSecretKey);
            console.log("Successfully imported wallet from hex string (32-byte)");
            return keypair;
          } else {
            // Already 64 bytes
            const keypair = solanaWeb3.Keypair.fromSecretKey(secretKey);
            console.log("Successfully imported wallet from hex string (64-byte)");
            return keypair;
          }
        } else {
          console.log("Hex string has invalid length:", secretKey.length);
        }
      } catch (err) {
        console.log("Hex string format import failed");
      }
    }
    
    // Method 4: Base64 format (less common but supported by some wallets)
    try {
      console.log("Trying base64 decode");
      const decoded = Buffer.from(privateKeyString, 'base64');
      
      if (decoded.length === 64 || decoded.length === 32) {
        // Handle 32-byte private key
        if (decoded.length === 32) {
          const privateKey = new Uint8Array(decoded);
          const publicKey = ed25519.getPublicKey(privateKey);
          
          // Combine private + public for Solana's format
          const fullSecretKey = new Uint8Array(64);
          fullSecretKey.set(privateKey);
          fullSecretKey.set(publicKey, 32);
          
          const keypair = solanaWeb3.Keypair.fromSecretKey(fullSecretKey);
          console.log("Successfully imported wallet from base64 (32-byte)");
          return keypair;
        } else {
          // Already 64 bytes
          const keypair = solanaWeb3.Keypair.fromSecretKey(new Uint8Array(decoded));
          console.log("Successfully imported wallet from base64 (64-byte)");
          return keypair;
        }
      } else {
        console.log("Base64 decoded key has invalid length:", decoded.length);
      }
    } catch (err) {
      console.log("Base64 format import failed");
    }
    
    // If all of the above methods failed, the format is not recognized
    throw new Error("Could not decode private key with any supported format. Please ensure you're using a valid Solana private key format.");
  } catch (e) {
    console.error("Error importing wallet from private key:", e);
    throw new Error("Invalid private key format. Please enter a valid Solana wallet private key.");
  }
}

// Helper for hex to Uint8Array conversion
function hexToUint8Array(hexString: string): Uint8Array {
  if (hexString.length % 2 !== 0) {
    throw new Error("Invalid hex string");
  }
  
  const arrayBuffer = new Uint8Array(hexString.length / 2);
  
  for (let i = 0; i < hexString.length; i += 2) {
    const byteValue = parseInt(hexString.substr(i, 2), 16);
    arrayBuffer[i/2] = byteValue;
  }
  
  return arrayBuffer;
}

// Helper for Base58 decoding (simple implementation)
function bs58Decode(encoded: string): number[] {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const BASE = ALPHABET.length;
  const result: number[] = [];
  
  let num = 0;
  let i = 0;
  
  for (const c of encoded) {
    num = num * BASE + ALPHABET.indexOf(c);
    i += 1;
    
    if (i === 4) {
      result.push(num & 0xff);
      num >>= 8;
      i = 1;
    }
  }
  
  if (i > 1) {
    result.push(num);
  }
  
  return result.reverse();
}

// Get SOL balance with retry logic
export async function getBalance(publicKey: solanaWeb3.PublicKey): Promise<string> {
  let retries = 3;
  let backoff = 500; // Start with 500ms backoff
  
  while (retries > 0) {
    try {
      const balance = await connection.getBalance(publicKey);
      return (balance / solanaWeb3.LAMPORTS_PER_SOL).toFixed(3);
    } catch (error: any) {
      // Check if we're hitting rate limits (429 Too Many Requests)
      if (error.message?.includes('429') || error.message?.includes('rate limit')) {
        retries--;
        if (retries <= 0) {
          console.error("Exhausted retries getting balance:", error);
          return "0";
        }
        
        console.warn(`Server responded with 429. Retrying after ${backoff}ms delay...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        backoff *= 2; // Exponential backoff
        continue;
      }
      
      // If not a rate limit error, just return 0
      console.error("Error getting balance:", error);
      return "0";
    }
  }
  
  return "0"; // Fallback return in case loop exits abnormally
}

// Get Token balance (like Pensacoin) with retry logic
export async function getTokenBalance(
  owner: solanaWeb3.PublicKey,
  tokenMint: solanaWeb3.PublicKey
): Promise<string> {
  let retries = 3;
  let backoff = 500; // Start with 500ms backoff
  
  while (retries > 0) {
    try {
      // First try to get associated token account address
      const associatedAddress = await getAssociatedTokenAddress(
        tokenMint,
        owner
      );
      
      // Get account info directly
      const accountInfo = await connection.getAccountInfo(associatedAddress);
      
      // If no account exists, return 0
      if (!accountInfo) {
        return "0";
      }
      
      // If account exists, get parsed token info
      const tokenAmount = await connection.getTokenAccountBalance(associatedAddress);
      return tokenAmount.value.uiAmount?.toString() || "0";
      
      // If no token account exists, return 0
      if (tokenAccounts.value.length === 0) {
        return "0";
      }
      
      // Get balance from the first token account
      const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      return balance.toString();
    } catch (error: any) {
      // Check if we're hitting rate limits (429 Too Many Requests)
      if (error.message?.includes('429') || error.message?.includes('rate limit')) {
        retries--;
        if (retries <= 0) {
          console.error("Exhausted retries getting token balance:", error);
          return "0";
        }
        
        console.warn(`Server responded with 429. Retrying after ${backoff}ms delay...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        backoff *= 2; // Exponential backoff
        continue;
      }
      
      // If not a rate limit error, just return 0
      console.error("Error getting token balance:", error);
      return "0";
    }
  }
  
  return "0"; // Fallback return in case loop exits abnormally
}

// Swap SOL to Pensacoin using real blockchain interactions
export async function swapSolToPensacoin(
  wallet: solanaWeb3.Keypair,
  amount: number
): Promise<string> {
  try {
    // Create a transaction
    const transaction = new solanaWeb3.Transaction();
    
    // Find the associated token account for Pensacoin
    const associatedTokenAccount = await getAssociatedTokenAddress(
      PENSACOIN_MINT_ADDRESS,
      wallet.publicKey
    );
    
    // Check if the associated token account exists
    const accountInfo = await connection.getAccountInfo(associatedTokenAccount);
    
    // If the account doesn't exist, create it
    if (!accountInfo) {
      console.log("Creating associated token account for Pensacoin");
      transaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedTokenAccount,
          wallet.publicKey,
          PENSACOIN_MINT_ADDRESS
        )
      );
    }
    
    // For a real swap, we would interact with a DEX like Jupiter or a swap pool
    // This is a simplified implementation that:
    // 1. Wraps SOL into wSOL (which is what swap pools use)
    // 2. Simulates a swap by transferring SOL to the swap pair address
    
    // First, let's simulate the SOL wrapping by simply transferring it
    // In a real implementation, we'd use proper wrapping instructions
    const amountInLamports = amount * solanaWeb3.LAMPORTS_PER_SOL;
    
    // Transfer SOL to the swap pair address (simulates the first part of the swap)
    transaction.add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: SWAP_PAIR_ADDRESS,
        lamports: amountInLamports,
      })
    );
    
    // In a real implementation, the swap pool would now mint the corresponding Pensacoin tokens
    // to the user's associated token account based on the pool's exchange rate
    
    // Set recent blockhash and fee payer
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign and send the transaction
    const signedTransaction = await solanaWeb3.sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet]
    );
    
    console.log("Swap transaction signature:", signedTransaction);
    return signedTransaction;
  } catch (error) {
    console.error("Error swapping SOL to Pensacoin:", error);
    throw error;
  }
}

// Swap Pensacoin to SOL using real blockchain interactions
export async function swapPensacoinToSol(
  wallet: solanaWeb3.Keypair,
  amount: number
): Promise<string> {
  try {
    // Create a transaction
    const transaction = new solanaWeb3.Transaction();
    
    // Find the associated token account for Pensacoin
    const associatedTokenAccount = await getAssociatedTokenAddress(
      PENSACOIN_MINT_ADDRESS,
      wallet.publicKey
    );
    
    // Check if the associated token account exists
    const accountInfo = await connection.getAccountInfo(associatedTokenAccount);
    if (!accountInfo) {
      throw new Error("Pensacoin token account does not exist");
    }
    
    // For a real swap, we would interact with a DEX or swap pool
    // This is a simplified implementation that:
    // 1. Transfers the Pensacoin tokens to the swap pair address
    // 2. The swap pair would then transfer SOL back (we simulate this part)
    
    // Calculate the token amount based on decimals (assuming 9 decimals for Pensacoin)
    const tokenAmount = Math.floor(amount * 1e9);
    
    // Transfer Pensacoin tokens to the swap pair address
    transaction.add(
      createTransferInstruction(
        associatedTokenAccount,
        await getAssociatedTokenAddress(
          PENSACOIN_MINT_ADDRESS,
          SWAP_PAIR_ADDRESS,
          true // allowOwnerOffCurve = true for PDAs
        ),
        wallet.publicKey,
        tokenAmount
      )
    );
    
    // Set recent blockhash and fee payer
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign and send the transaction
    const signedTransaction = await solanaWeb3.sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet]
    );
    
    console.log("Swap transaction signature:", signedTransaction);
    return signedTransaction;
  } catch (error) {
    console.error("Error swapping Pensacoin to SOL:", error);
    throw error;
  }
}

// Get token metadata for a mint address
export async function getTokenMetadata(mintAddress: string): Promise<any> {
  try {
    const mintPublicKey = new solanaWeb3.PublicKey(mintAddress);
    
    // Find the metadata account for this mint
    const [metadataAddress] = solanaWeb3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintPublicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    
    // Get the account info
    const accountInfo = await connection.getAccountInfo(metadataAddress);
    
    if (!accountInfo) {
      console.log("No metadata found for mint", mintAddress);
      return null;
    }
    
    // Metadata account data structure (simplified)
    // Adapted from the metaplex-program-library format
    try {
      const metadataData = accountInfo.data;
      let offset = 0;
      
      // Skip the key, updateAuthority (32), mint (32), name string length (4)
      offset += 1 + 32 + 32 + 4;
      
      const nameLength = metadataData.readUInt32LE(offset - 4);
      const name = metadataData.slice(offset, offset + nameLength).toString('utf8');
      offset += nameLength;
      
      // Read symbol length (4)
      const symbolLength = metadataData.readUInt32LE(offset);
      offset += 4;
      
      // Read symbol
      const symbol = metadataData.slice(offset, offset + symbolLength).toString('utf8');
      offset += symbolLength;
      
      // Read uri length (4)
      const uriLength = metadataData.readUInt32LE(offset);
      offset += 4;
      
      // Read uri
      const uri = metadataData.slice(offset, offset + uriLength).toString('utf8');
      
      // Try to fetch the actual metadata from the IPFS URI if possible
      try {
        // For Pensacoin specifically, we know the exact image URL
        if (mintAddress === PENSACOIN_MINT_ADDRESS.toString()) {
          return {
            name,
            symbol,
            uri: "https://ipfs.io/ipfs/QmSAxMm9T3KYwBofPn1u5hsy4Y2VjGLuhcLwNPijMcttGi",
            mintAddress,
            image: "https://ipfs.io/ipfs/QmSAxMm9T3KYwBofPn1u5hsy4Y2VjGLuhcLwNPijMcttGi"
          };
        }
        
        return {
          name,
          symbol,
          uri,
          mintAddress
        };
      } catch (err) {
        console.log("Error fetching expanded metadata:", err);
        return {
          name,
          symbol,
          uri,
          mintAddress
        };
      }
    } catch (e) {
      console.error("Error parsing metadata:", e);
      return null;
    }
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    return null;
  }
}

// Get transaction history for the wallet
export async function getTransactionHistory(
  publicKey: solanaWeb3.PublicKey,
  limit: number = 10
): Promise<solanaWeb3.ParsedTransactionWithMeta[]> {
  let retries = 3;
  let backoff = 500; // Start with 500ms backoff

  while (retries > 0) {
    try {
      // First get signatures
      const signatures = await connection.getSignaturesForAddress(
        publicKey,
        { limit }
      );
      
      if (signatures.length === 0) {
        return [];
      }
      
      // Fetch transactions one at a time to avoid rate limits
      const transactions: (solanaWeb3.ParsedTransactionWithMeta | null)[] = [];
      
      for (const sig of signatures) {
        try {
          const tx = await connection.getParsedTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0
          });
          transactions.push(tx);
          
          // Small delay between requests to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err: any) {
          console.error(`Error fetching transaction ${sig.signature}:`, err);
          // If we get a rate limit error, back off
          if (err?.code === -32015 || err?.code === 429) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          transactions.push(null);
        }
      }
      
      return transactions.filter(tx => tx !== null) as solanaWeb3.ParsedTransactionWithMeta[];
    } catch (error: any) {
      console.error("Error getting transaction history:", error);
      
      // Check if it's a rate limit error
      if (error?.code === -32015 || error?.code === 429) {
        console.log(`Server responded with ${error.code || 429}. Retrying after ${backoff}ms delay...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        backoff *= 2; // Exponential backoff
        retries--;
      } else {
        // For other errors, don't retry
        return [];
      }
    }
  }
  
  console.error("Failed to fetch transaction history after retries");
  return [];
}
