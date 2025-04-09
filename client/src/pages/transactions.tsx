import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import TransactionItem from "@/components/TransactionItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWallet } from "@/contexts/WalletContext";
import * as solanaWeb3 from "@solana/web3.js";
import { getTransactionHistory } from "@/lib/solana";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

// Filter types
type FilterType = "all" | "received" | "sent" | "swaps";

// Transaction data interface
interface TransactionData {
  type: "receive" | "send" | "swap";
  title: string;
  date: string;
  amount: string;
  value?: string;
  fromAddress?: string;
  toAddress?: string;
  signature: string;
  confirmations?: number;
  swapDetails?: {
    fromToken: string;
    fromAmount: string;
    toToken: string;
    toAmount: string;
    rate: string;
  };
}

const Transactions = () => {
  const { wallet, solPrice, pensaPrice } = useWallet();
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const transactionsPerPage = 10;

  // Fetch transaction history
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!wallet) return;

      setIsLoading(true);
      try {
        // Use our improved getTransactionHistory function
        const txHistory = await getTransactionHistory(wallet.publicKey, 20);

        if (txHistory.length > 0) {
          // Process and format the transactions
          const processedTxs = txHistory.map((tx) => processTransaction(tx));
          setTransactions(processedTxs);
        }
      } catch (error) {
        console.error("Error fetching transaction history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [wallet]);

  // Process a transaction into our format
  const processTransaction = (tx: solanaWeb3.ParsedTransactionWithMeta): TransactionData => {
    // Default to "send" type, will determine actual type based on transaction data
    let type: "receive" | "send" | "swap" = "send";
    let title = "Transaction";
    let amount = "0.000 SOL";
    let value: string | undefined;
    let fromAddress;
    let toAddress;

    // Format the date
    const timestamp = tx.blockTime ? new Date(tx.blockTime * 1000) : new Date();
    const date = timestamp.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true
    });

    // Process transaction instructions
    if (tx.meta && tx.transaction.message.instructions) {
      const instructions = tx.transaction.message.instructions;

      try {
        // This logic is a simplified version since the full parsing of Solana txs is complex
        // In a production app, we'd want more robust logic here

        // For SOL transfers
        if (tx.meta.preBalances && tx.meta.postBalances && tx.transaction.message.accountKeys) {
          const walletIndex = tx.transaction.message.accountKeys.findIndex(
            key => key.toString() === wallet!.publicKey.toString()
          );

          if (walletIndex >= 0) {
            const preBalance = tx.meta.preBalances[walletIndex];
            const postBalance = tx.meta.postBalances[walletIndex];
            const balanceDiff = (postBalance - preBalance) / solanaWeb3.LAMPORTS_PER_SOL;

            if (balanceDiff > 0) {
              type = "receive";
              title = "Received SOL";
              amount = `+${balanceDiff.toFixed(4)} SOL`;

              // Calculate value in USD
              const valueInUsd = Math.abs(balanceDiff) * solPrice;
              value = `$${valueInUsd.toFixed(2)}`;

              // Try to find the sender (simplified)
              for (let i = 0; i < tx.transaction.message.accountKeys.length; i++) {
                if (i !== walletIndex && tx.meta.preBalances[i] > tx.meta.postBalances[i]) {
                  fromAddress = tx.transaction.message.accountKeys[i].toString();
                  break;
                }
              }
            } else if (balanceDiff < 0) {
              type = "send";
              title = "Sent SOL";
              amount = `${balanceDiff.toFixed(4)} SOL`; // Already negative

              // Calculate value in USD
              const valueInUsd = Math.abs(balanceDiff) * solPrice;
              value = `$${valueInUsd.toFixed(2)}`;

              // Try to find the recipient (simplified)
              for (let i = 0; i < tx.transaction.message.accountKeys.length; i++) {
                if (i !== walletIndex && tx.meta.preBalances[i] < tx.meta.postBalances[i]) {
                  toAddress = tx.transaction.message.accountKeys[i].toString();
                  break;
                }
              }
            }
          }
        }

        // Simplified swap detection (in a real app this would be more robust)
        if (instructions.length > 2) {
          const programIds = instructions.map((ix: any) => 
            ix.programId ? ix.programId.toString() : ''
          );

          // If transaction involves token program, it might be a swap/token transfer
          if (programIds.includes('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')) {
            type = "swap";
            title = "Token Swap";
            amount = "Token Exchange";
          }
        }
      } catch (error) {
        console.error("Error processing transaction:", error);
      }
    }

    // Calculate an estimated confirmation count
    let confirmations = 0;
    if (tx.slot && tx.blockTime) {
      // Estimate confirmations based on time elapsed
      // Solana produces blocks roughly every 400ms
      const secondsElapsed = Math.floor(Date.now() / 1000) - tx.blockTime;
      confirmations = Math.max(1, Math.min(Math.floor(secondsElapsed / 0.4), 1000));
    }

    return {
      type,
      title,
      date,
      amount,
      value,
      fromAddress,
      toAddress,
      signature: tx.transaction.signatures[0],
      confirmations: confirmations
    };
  };

  // Filter transactions based on selected filter
  const filteredTransactions = transactions.filter(transaction => {
    if (currentFilter === "all") return true;
    if (currentFilter === "received") return transaction.type === "receive";
    if (currentFilter === "sent") return transaction.type === "send";
    if (currentFilter === "swaps") return transaction.type === "swap";
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const startIndex = (page - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  return (
    <div className="max-w-4xl mx-auto pt-12">
      <header className="mb-6">
        <div className="flex justify-start mb-1">
          <Link href="/wallet-dashboard">
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-[rgba(169,0,232,1)]">
              <ChevronLeft size={16} /> Back
            </Button>
          </Link>
        </div>
      </header>

      <Card className="mb-6 neumorphic bg-white">
        <CardContent className="pt-4">
          <h1 className="text-2xl font-bold text-[rgba(169,0,232,1)] mb-4">Transactions</h1>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4 justify-center">
            <Button 
              variant="outline"
              className={currentFilter === "all" 
                ? "neumorphic bg-white text-[rgba(169,0,232,1)] border-[rgba(169,0,232,0.3)]" 
                : "neumorphic bg-white text-gray-700"}
              onClick={() => setCurrentFilter("all")}
            >
              All
            </Button>
            <Button 
              variant="outline"
              className={currentFilter === "received" 
                ? "neumorphic bg-white text-[rgba(169,0,232,1)] border-[rgba(169,0,232,0.3)]" 
                : "neumorphic bg-white text-gray-700"}
              onClick={() => setCurrentFilter("received")}
            >
              Received
            </Button>
            <Button 
              variant="outline"
              className={currentFilter === "sent" 
                ? "neumorphic bg-white text-[rgba(169,0,232,1)] border-[rgba(169,0,232,0.3)]" 
                : "neumorphic bg-white text-gray-700"}
              onClick={() => setCurrentFilter("sent")}
            >
              Sent
            </Button>
            <Button 
              variant="outline"
              className={currentFilter === "swaps" 
                ? "neumorphic bg-white text-[rgba(169,0,232,1)] border-[rgba(169,0,232,0.3)]" 
                : "neumorphic bg-white text-gray-700"}
              onClick={() => setCurrentFilter("swaps")}
            >
              Swaps
            </Button>
          </div>

          {/* Transaction List */}
          <div className="divide-y divide-gray-100">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin w-10 h-10 border-2 border-[rgba(169,0,232,1)] border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-gray-700">Loading transactions...</p>
              </div>
            ) : paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((transaction: TransactionData, index: number) => (
                <TransactionItem 
                  key={index}
                  type={transaction.type}
                  title={transaction.title}
                  date={transaction.date}
                  amount={transaction.amount}
                  value={transaction.value}
                  fromAddress={transaction.fromAddress}
                  toAddress={transaction.toAddress}
                  signature={transaction.signature}
                  confirmations={transaction.confirmations}
                  swapDetails={transaction.swapDetails}
                />
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="text-gray-400 mb-3 flex justify-center">
                  <Search size={36} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No transactions found</h3>
                <p className="text-gray-500">Try changing your filter or make some transactions</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="neumorphic bg-white text-gray-700"
              >
                <ChevronLeft size={14} className="mr-1" /> Previous
              </Button>
              <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="neumorphic bg-white text-gray-700"
              >
                Next <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;