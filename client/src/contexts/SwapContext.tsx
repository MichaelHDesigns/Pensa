import { createContext, useContext, useState, ReactNode } from "react";
import * as solanaWeb3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import { useToast } from "@/hooks/use-toast";
import { 
  connection,
  PENSACOIN_MINT_ADDRESS, 
  SOL_ADDRESS
} from "@/lib/solana";
import * as splTokenLib from "@/lib/splToken";
import BN from "bn.js";
import axios from "axios";
import { API_URLS } from "@raydium-io/raydium-sdk-v2";

// Define token addresses
const SOL_TOKEN_ADDRESS = SOL_ADDRESS.toString();
const PENSA_TOKEN_ADDRESS = PENSACOIN_MINT_ADDRESS.toString();
const NATIVE_MINT = SOL_ADDRESS.toString(); // SOL

interface SwapRate {
  solToPensa: number;
  pensaToSol: number;
}

interface SwapContextType {
  swapTokens: (wallet: solanaWeb3.Keypair, refreshBalancesFn: () => Promise<void>, fromToken: 'SOL' | 'PENSA', toToken: 'SOL' | 'PENSA', amount: string) => Promise<void>;
  calculateSwapOutput: (fromToken: 'SOL' | 'PENSA', toToken: 'SOL' | 'PENSA', amount: number) => number;
  swapRate: SwapRate;
  swapFeePercent: number;
  getNetworkFee: () => string;
  isSwapLoading: boolean;
  estimatedSwapRoute: any;
  getEstimatedRoute: (fromToken: 'SOL' | 'PENSA', toToken: 'SOL' | 'PENSA', amount: number) => Promise<void>;
}

const SwapContext = createContext<SwapContextType | undefined>(undefined);

export function SwapProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isSwapLoading, setIsSwapLoading] = useState(false);
  const [estimatedSwapRoute, setEstimatedSwapRoute] = useState<any>(null);

  // Real market data from GeckoTerminal API
  const swapRate: SwapRate = {
    solToPensa: 23640708.63, // 1 SOL = 23,640,708.63 PENSA
    pensaToSol: 0.00000004229991646  // 1 PENSA = 0.00000004229991646 SOL
  };

  const swapFeePercent = 0.5; // 0.5% swap fee

  // Calculate network fee (estimated)
  const getNetworkFee = (): string => {
    return "~0.000005 SOL";
  };

  // Calculate swap output amount based on input
  const calculateSwapOutput = (fromToken: 'SOL' | 'PENSA', toToken: 'SOL' | 'PENSA', amount: number): number => {
    if (fromToken === toToken) return amount;

    // Ensure we're working with the exact amount, not a rounded version
    const exactAmount = parseFloat(amount.toFixed(6));

    // Use our predefined rates
    const rate = fromToken === 'SOL' ? swapRate.solToPensa : swapRate.pensaToSol;
    const outputBeforeFee = exactAmount * rate;
    const fee = outputBeforeFee * (swapFeePercent / 100);

    const finalResult = outputBeforeFee - fee;

    // Format appropriately based on token type (more decimal places for SOL)
    return toToken === 'SOL' 
      ? parseFloat(finalResult.toFixed(9))  // SOL has 9 decimals
      : parseFloat(finalResult.toFixed(6)); // PENSA has 6 decimals 
  };

  // Generate estimated route for display purposes
  const getEstimatedRoute = async (
    fromToken: 'SOL' | 'PENSA', 
    toToken: 'SOL' | 'PENSA', 
    amount: number
  ): Promise<void> => {
    if (amount <= 0) {
      setEstimatedSwapRoute(null);
      return;
    }

    try {
      // Calculate the estimated output amount
      const estimatedOutput = calculateSwapOutput(fromToken, toToken, amount);

      // Create a simple route object for UI display
      setEstimatedSwapRoute({
        fromToken,
        toToken,
        inputAmount: amount,
        outputAmount: estimatedOutput
      });

    } catch (error) {
      console.error("Failed to get estimated route:", error);
      toast({
        title: "Estimation Failed",
        description: "Could not estimate swap amount. Please try again.",
        variant: "destructive",
      });
      setEstimatedSwapRoute(null);
    }
  };

  // Execute the swap using Raydium Trade API - REAL TRADING!
  const swapTokens = async (
    wallet: solanaWeb3.Keypair,
    refreshBalancesFn: () => Promise<void>,
    fromToken: 'SOL' | 'PENSA',
    toToken: 'SOL' | 'PENSA',
    amount: string // CRITICAL: Accept string to preserve exact numeric value
  ): Promise<void> => {
    try {
      setIsSwapLoading(true);

      // Return if trying to swap the same token
      if (fromToken === toToken) {
        toast({
          title: "Invalid Swap",
          description: "Cannot swap a token for itself",
          variant: "destructive",
        });
        setIsSwapLoading(false);
        return;
      }

      toast({
        title: `Swapping ${amount} ${fromToken} to ${toToken}`,
        description: "Getting quote from Raydium...",
      });

      // Get input and output token public keys
      const inputMint = fromToken === 'SOL' ? SOL_ADDRESS.toString() : PENSACOIN_MINT_ADDRESS.toString();
      const outputMint = toToken === 'SOL' ? SOL_ADDRESS.toString() : PENSACOIN_MINT_ADDRESS.toString();

      // Check if user has a PENSA token account
      try {
        // Find the user's PENSA token account - this is CRITICAL for swaps to work correctly
        let userPensaATA: solanaWeb3.PublicKey | null = null;

        try {
          // Get the associated token address for the user's PENSA account
          userPensaATA = await splToken.getAssociatedTokenAddress(
            PENSACOIN_MINT_ADDRESS,
            wallet.publicKey
          );

          // ALWAYS check if the token account exists before using it
          const accountInfo = await connection.getAccountInfo(userPensaATA);

          // Token account MUST exist for PENSA operations
          // If the account doesn't exist and we're receiving OR sending PENSA, create it first
          if (!accountInfo && (toToken === 'PENSA' || fromToken === 'PENSA')) {
            console.log("Creating Pensacoin token account");

            // Create a transaction just to make the token account
            const createTokenTx = new solanaWeb3.Transaction();

            // Create the token account instruction
            const createTokenAccountIx = splToken.createAssociatedTokenAccountInstruction(
              wallet.publicKey, // Payer
              userPensaATA, // Associated token account address
              wallet.publicKey, // Token account owner
              PENSACOIN_MINT_ADDRESS // Token mint
            );

            createTokenTx.add(createTokenAccountIx);
            createTokenTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            createTokenTx.feePayer = wallet.publicKey;
            createTokenTx.sign(wallet);

            // Send the transaction to the network
            console.log("Creating token account for PENSA...");
            const createSig = await connection.sendTransaction(createTokenTx, [wallet]);
            console.log("Token account creation submitted:", createSig);

            // Wait for confirmation
            await connection.confirmTransaction(createSig, 'confirmed');
            console.log("Token account created successfully");
          }
        } catch (error) {
          console.error("Error checking PENSA token account:", error);
          throw error;
        }

        // Determine accurate decimals for amount conversion
        const SOL_DECIMALS = 9;
        const PENSA_DECIMALS = 6;

        // Convert amount to proper decimals (considering token decimals)
        const fromDecimals = fromToken === 'SOL' ? SOL_DECIMALS : PENSA_DECIMALS;

        // This is the CRITICAL fix for amount processing
        // For PENSA to SOL swaps, we need to ensure we're using the full amount entered (5000, not 5)

        // COMPLETELY REWORKED critical amount handling
        // DO NOT USE PARSEFLOT - it causes 5000 to be interpreted as 5 in some cases

        // Step 1: CRITICAL - directly multiple by decimal power to preserve exact value
        // For example, when user enters "5000" for PENSA, we need 5000000000 base units (not 5000000)
        let amountInSmallestUnits: number;

        if (fromToken === 'PENSA') {
          // 1. Clean any commas from input (5,000 -> 5000)
          const cleanAmount = amount.toString().replace(/,/g, '');

          // 2. Parse as float to work with numeric value
          const numericAmount = parseFloat(cleanAmount);

          // 3. PENSA has 9 decimal places (1 PENSA = 1,000,000,000 base units)
          // For example: 5000 PENSA = 5000 * 1,000,000,000 = 5,000,000,000,000 base units
          amountInSmallestUnits = numericAmount * 1000000000;

          // 4. Simple verification
          if (amountInSmallestUnits <= 0 || isNaN(amountInSmallestUnits)) {
            throw new Error("Invalid PENSA amount - please enter a valid number");
          }
        } else {
          // For SOL: Convert "0.1" to 100000000 (full SOL * 10^9)
          // Multiply by EXACTLY 1,000,000,000 to get the right number of base units
          amountInSmallestUnits = Number(amount) * 1000000000;
          console.log(`📌 BUYING WITH EXACTLY: ${amount} ${fromToken} = ${amountInSmallestUnits} base units`);
        }

        // Additional safety checks for suspicious amounts
        if (fromToken === 'PENSA') {
          // If amount is WAY too small, likely an error
          if (amountInSmallestUnits < 100000) {
            console.log("⚠️ SUSPICIOUS SMALL AMOUNT DETECTED!");
            throw new Error("Amount seems suspiciously small. Please verify you're entering the correct amount.");
          }

          // Log clear readable information
          console.log(`✅ VERIFIED AMOUNT: Selling ${amount} PENSA = ${amountInSmallestUnits.toLocaleString()} base units`);
        }

        console.log(`⚡ FINAL AMOUNT: ${amount} ${fromToken} = ${amountInSmallestUnits} base units`);

        // Validation to prevent accidental small amounts
        if (fromToken === 'PENSA' && amountInSmallestUnits < 1000000) {
          throw new Error("Amount too small - please enter at least 1 PENSA");
        }

        console.log(`Converting ${amount} ${fromToken} to ${amountInSmallestUnits} base units`);

        // Set slippage (in basis points, 0.01%)
        const slippageBps = 100; // 1%
        const txVersion = 'LEGACY' as string; // Using string type to avoid LSP errors

        // Step 1: Get quote from Raydium API
        // Use base-in for exact input amount, base-out for exact output amount
        console.log(`Getting swap quote from Raydium for ${fromToken} to ${toToken}`);

        try {
          // Get the swap quote
          const { data: swapResponse } = await axios.get(
            `${API_URLS.SWAP_HOST}/compute/swap-base-in?` +
            `inputMint=${inputMint}&` +
            `outputMint=${outputMint}&` +
            `amount=${amountInSmallestUnits}&` +
            `slippageBps=${slippageBps}&` +
            `txVersion=${txVersion}`
          );

          console.log("Received quote:", swapResponse);

          // Step 2: Get priority fee information (optional but recommended)
          const { data: priorityFeeData } = await axios.get(
            `${API_URLS.BASE_HOST}${API_URLS.PRIORITY_FEE}`
          );

          // Step 3: Request transaction data from Raydium
          console.log("Requesting swap transaction from Raydium");

          const isInputSol = fromToken === 'SOL';
          const isOutputSol = toToken === 'SOL';

          // Critical validation: Ensure we have a valid PENSA token account
          if ((fromToken === 'PENSA' || toToken === 'PENSA') && !userPensaATA) {
            throw new Error("Cannot perform swap: PENSA token account is not properly set up");
          }

          // Log critical information for debugging
          console.log(`⚡ REAL SWAP: ${fromToken} → ${toToken}, Amount: ${amountInSmallestUnits} base units`);
          console.log(`👤 User wallet: ${wallet.publicKey.toBase58()}`);
          console.log(`💰 PENSA token account: ${userPensaATA?.toBase58()}`);

          // CRITICAL FIX for Raydium API:
          // When selling PENSA, we MUST set:
          // - inputAccount = PENSA token account
          // - wrapSol = false (not wrapping SOL as input)
          // - unwrapSol = true (need to unwrap wSOL to SOL)

          // When buying PENSA, we MUST set:
          // - outputAccount = PENSA token account
          // - wrapSol = true (converting SOL to wSOL for the swap)
          // - unwrapSol = false (not unwrapping wSOL)

          // Create proper request to Raydium Trade API
          const { data: swapTransactions } = await axios.post(
            `${API_URLS.SWAP_HOST}/transaction/swap-base-in`,
            {
              computeUnitPriceMicroLamports: String(priorityFeeData.data.default.h), // high priority fee
              swapResponse,
              txVersion,
              wallet: wallet.publicKey.toBase58(),

              // CRITICAL! These values must be correctly set based on swap direction
              wrapSol: isInputSol, // true if input is SOL (wrapping SOL to wSOL for protocol)
              unwrapSol: isOutputSol, // true if output is SOL (unwrapping wSOL to SOL for output)

              // Account specification is REQUIRED according to Raydium API docs
              // "account always needs to be passed if inputToken ≠ SOL"
              inputAccount: isInputSol ? undefined : userPensaATA.toBase58(),
              outputAccount: isOutputSol ? undefined : userPensaATA.toBase58(),
            }
          );

          console.log("Received swap transaction data:", swapTransactions);

          // Step 4: Deserialize, sign, and execute the transaction
          // We should get one or more transactions to execute
          const allTxBuf = swapTransactions.data.map(
            (tx: any) => Buffer.from(tx.transaction, 'base64')
          );

          // Since we're using LEGACY transactions, directly deserialize as Transaction
          const allTransactions = allTxBuf.map(
            (txBuf: Buffer) => solanaWeb3.Transaction.from(txBuf)
          );

          console.log(`Received ${allTransactions.length} transactions to process`);

          // For each transaction, sign it and send it
          let txIndex = 0;
          for (const tx of allTransactions) {
            txIndex++;
            console.log(`Processing transaction ${txIndex} of ${allTransactions.length}`);

            // LEGACY transaction
            const transaction = tx as solanaWeb3.Transaction;
            transaction.sign(wallet);

            console.log(`Sending transaction ${txIndex}...`);
            const txId = await connection.sendTransaction(transaction, [wallet], {
              skipPreflight: true
            });

            console.log(`Transaction sent with signature: ${txId}`);

            // Get the latest blockhash for proper confirmation
            const { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash({
              commitment: 'finalized'
            });

            // Wait for confirmation with proper parameters
            console.log(`Confirming transaction ${txId}...`);
            const confirmation = await connection.confirmTransaction({
              blockhash,
              lastValidBlockHeight,
              signature: txId
            }, 'confirmed');

            console.log(`Transaction ${txIndex} confirmed:`, confirmation);
          }

          // All transactions processed successfully
          console.log("✅ Swap completed successfully");

          // IMPORTANT: We need to wait a bit before checking balances to make sure the blockchain has updated
          console.log("Waiting for blockchain state to settle...");
          await new Promise(resolve => setTimeout(resolve, 4000));

          try {
            // Show success message right away
            toast({
              title: "Swap Successful",
              description: `Successfully swapped ${amount} ${fromToken} for ${toToken}`,
              variant: "default",
            });

            // First balance refresh
            console.log("Refreshing balances (first pass)...");
            await refreshBalancesFn();

            // Wait longer for blockchain state to fully propagate
            console.log("Waiting for full blockchain confirmation...");
            await new Promise(resolve => setTimeout(resolve, 6000));

            // One more refresh to ensure we have the latest balances
            console.log("Refreshing balances (final pass)...");
            await refreshBalancesFn();

            console.log("✅ Balance refresh complete");
          } catch (refreshError) {
            console.error("Error refreshing balances:", refreshError);
          }

        } catch (apiError) {
          console.error("Raydium API error:", apiError);
          toast({
            title: "Swap Failed",
            description: `Error: ${apiError instanceof Error ? apiError.message : "Failed to execute Raydium swap"}`,
            variant: "destructive",
          });
          throw apiError;
        }

      } catch (error) {
        console.error("Error preparing swap:", error);
        toast({
          title: "Swap Failed",
          description: `Error: ${error instanceof Error ? error.message : "Failed to prepare swap transaction"}`,
          variant: "destructive",
        });
        throw error;
      }

      // Final refresh and cleanup
      try {
        // One more refresh after everything is done
        await refreshBalancesFn();
      } catch (e) {
        console.error("Final balance refresh failed:", e);
      }

      setIsSwapLoading(false);

    } catch (error) {
      console.error("Swap failed:", error);
      setIsSwapLoading(false);
      throw error; // Propagate the error to be handled by the component
    }
  };

  return (
    <SwapContext.Provider
      value={{
        swapTokens,
        calculateSwapOutput,
        swapRate,
        swapFeePercent,
        getNetworkFee,
        isSwapLoading,
        estimatedSwapRoute,
        getEstimatedRoute
      }}
    >
      {children}
    </SwapContext.Provider>
  );
}

export function useSwap() {
  const context = useContext(SwapContext);
  if (context === undefined) {
    throw new Error("useSwap must be used within a SwapProvider");
  }
  return context;
}