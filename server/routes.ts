import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as solanaWeb3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";

// Constants for Solana blockchain
const SOLANA_NETWORK = solanaWeb3.clusterApiUrl("mainnet-beta");
const PENSACOIN_MINT_ADDRESS = new solanaWeb3.PublicKey("2L4iRJeYKVJM3Dkk1XBTwn4DMPfneUA9C6KjkMUTRkz6");
const SWAP_PAIR_ADDRESS = new solanaWeb3.PublicKey("2fdrJjBrx2jXCqVF2zTCeFnVmy58YtnrYYhskXXgti6b");
const SOL_ADDRESS = new solanaWeb3.PublicKey("So11111111111111111111111111111111111111112");

// Initialize Solana connection
const connection = new solanaWeb3.Connection(SOLANA_NETWORK, "confirmed");

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to get current SOL price
  app.get("/api/price/sol", async (req, res) => {
    try {
      // In a real app, we would fetch the price from a price oracle or exchange API
      // For demo purposes, we'll return a fixed price
      res.json({ price: 70 }); // $70 per SOL
    } catch (error) {
      console.error("Error fetching SOL price:", error);
      res.status(500).json({ error: "Failed to fetch SOL price" });
    }
  });

  // API endpoint to get current Pensacoin price
  app.get("/api/price/pensacoin", async (req, res) => {
    try {
      // In a real app, we would fetch the price from a price oracle or exchange API
      // For demo purposes, we'll return a fixed price
      res.json({ price: 0.10 }); // $0.10 per PENSA
    } catch (error) {
      console.error("Error fetching Pensacoin price:", error);
      res.status(500).json({ error: "Failed to fetch Pensacoin price" });
    }
  });

  // API endpoint to get wallet balances
  app.get("/api/wallet/balance/:address", async (req, res) => {
    try {
      const { address } = req.params;
      
      // Validate the address
      let publicKey: solanaWeb3.PublicKey;
      try {
        publicKey = new solanaWeb3.PublicKey(address);
      } catch (error) {
        return res.status(400).json({ error: "Invalid Solana address" });
      }
      
      // Get SOL balance
      const solBalance = await connection.getBalance(publicKey);
      const solBalanceFormatted = (solBalance / solanaWeb3.LAMPORTS_PER_SOL).toFixed(3);
      
      // Get Pensacoin balance (SPL token)
      let pensacoinBalance = "0";
      try {
        // Find token accounts for this token owned by the address
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { mint: PENSACOIN_MINT_ADDRESS }
        );
        
        if (tokenAccounts.value.length > 0) {
          pensacoinBalance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount.toString();
        }
      } catch (error) {
        console.error("Error fetching Pensacoin balance:", error);
        // Continue with zero balance if token account doesn't exist
      }
      
      res.json({
        solBalance: solBalanceFormatted,
        pensacoinBalance
      });
    } catch (error) {
      console.error("Error fetching wallet balances:", error);
      res.status(500).json({ error: "Failed to fetch wallet balances" });
    }
  });

  // API endpoint to get transaction history
  app.get("/api/wallet/transactions/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Validate the address
      let publicKey: solanaWeb3.PublicKey;
      try {
        publicKey = new solanaWeb3.PublicKey(address);
      } catch (error) {
        return res.status(400).json({ error: "Invalid Solana address" });
      }
      
      // Get transaction signatures for the address
      const signatures = await connection.getSignaturesForAddress(
        publicKey,
        { limit }
      );
      
      // Get transaction details
      const transactions = await connection.getParsedTransactions(
        signatures.map(sig => sig.signature)
      );
      
      // Format transactions
      const formattedTransactions = transactions
        .filter(tx => tx !== null)
        .map((tx, index) => {
          const signature = signatures[index].signature;
          const timestamp = signatures[index].blockTime 
            ? new Date(signatures[index].blockTime * 1000).toISOString()
            : new Date().toISOString();
          
          // Determine transaction type and details (simplified)
          let type = "unknown";
          let amount = "0";
          let fromAddress = "";
          let toAddress = "";
          
          if (tx?.transaction.message.instructions.length) {
            // This is a very simplified detection logic
            // In a real app, we would have more sophisticated parsing
            const programId = tx.transaction.message.instructions[0].programId.toString();
            
            if (programId === solanaWeb3.SystemProgram.programId.toString()) {
              // SOL transfer
              type = tx.transaction.message.accountKeys[0].pubkey.equals(publicKey) ? "send" : "receive";
              
              // Find the transfer instruction
              const transferInstr = tx.transaction.message.instructions.find(
                instr => instr.parsed?.type === "transfer"
              );
              
              if (transferInstr?.parsed) {
                amount = (transferInstr.parsed.info.lamports / solanaWeb3.LAMPORTS_PER_SOL).toString();
                fromAddress = transferInstr.parsed.info.source;
                toAddress = transferInstr.parsed.info.destination;
              }
            } else if (programId === splToken.TOKEN_PROGRAM_ID.toString()) {
              // SPL token transfer
              type = "swap"; // Simplification, could be any token transfer
              
              // More detailed parsing would be needed for real app
              amount = "0"; // Placeholder
            }
          }
          
          return {
            signature,
            timestamp,
            type,
            amount,
            fromAddress,
            toAddress,
            confirmations: signatures[index].confirmationStatus === "finalized" ? 100 : 1
          };
        });
      
      res.json(formattedTransactions);
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      res.status(500).json({ error: "Failed to fetch transaction history" });
    }
  });

  // API endpoint to get swap rate
  app.get("/api/swap/rate", (req, res) => {
    try {
      // In a real app, this would be fetched from a liquidity pool or exchange
      res.json({
        solToPensa: 100, // 1 SOL = 100 PENSA
        pensaToSol: 0.01, // 1 PENSA = 0.01 SOL
        feePercent: 0.3 // 0.3% fee
      });
    } catch (error) {
      console.error("Error fetching swap rate:", error);
      res.status(500).json({ error: "Failed to fetch swap rate" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
