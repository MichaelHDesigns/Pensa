import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useWallet } from "@/contexts/WalletContext";
import TokenCard from "@/components/TokenCard";
import QuickActionButton from "@/components/QuickActionButton";
import TransactionItem from "@/components/TransactionItem";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTransactionHistory } from "@/lib/solana";
import * as solanaWeb3 from "@solana/web3.js";
import { ClockIcon, ChevronRight } from "lucide-react";

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

// Quick action buttons data with updated Lucide icon names
const quickActions = [
  { icon: "qrcode", label: "Receive", path: "/receive", color: "indigo" },
  { icon: "paper-plane", label: "Send", path: "/send", color: "blue" },
  { icon: "exchange-alt", label: "Swap", path: "/swap", color: "purple" },
  { icon: "history", label: "History", path: "/transactions", color: "amber" },
  { icon: "cog", label: "Settings", path: "/settings", color: "gray" }
];

const WalletDashboard = () => {
  const { wallet, refreshBalances, removeWallet, solBalance, pensacoinBalance, solValueUsd, pensacoinValueUsd, solPrice, pensaPrice, currency } = useWallet();
  const [recentTransactions, setRecentTransactions] = useState<TransactionData[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  
  // Refresh balances and transaction history when the component mounts
  useEffect(() => {
    refreshBalances();
    
    if (wallet) {
      fetchTransactionHistory();
    }
  }, [refreshBalances, wallet]);
  
  // Fetch and process transaction history
  const fetchTransactionHistory = async () => {
    if (!wallet) return;
    
    setIsLoadingTransactions(true);
    
    try {
      // Get transactions from the blockchain
      const transactions = await getTransactionHistory(wallet.publicKey, 5);
      
      if (transactions.length > 0) {
        // Process and format transaction data
        const formattedTransactions = transactions.map(tx => processTransaction(tx));
        setRecentTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error("Error fetching transaction history:", error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };
  
  // Process transaction data from Solana
  const processTransaction = (tx: solanaWeb3.ParsedTransactionWithMeta): TransactionData => {
    // Default to "send" type, will determine actual type based on transaction data
    let type: "receive" | "send" | "swap" = "send";
    let title = "Transaction";
    let amount = "";
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
  
  return (
    <div className="max-w-5xl mx-auto bg-[rgba(169,0,232,0.05)]">
      {/* Wallet Balance Card */}
      <div className="mb-8">
        {/* Solana Balance Card */}
        {wallet && (
          <TokenCard 
            type="sol"
            symbol="SOL"
            name="Solana"
            balance={solBalance}
            value={solValueUsd}
            address={wallet.publicKey.toString()}
            pensaBalance={pensacoinBalance}
            pensaValue={pensacoinValueUsd}
            solPrice={solPrice}
            pensaPrice={pensaPrice}
          />
        )}
      </div>
      
      {/* Quick Actions */}
      <Card className="mb-8 neumorphic bg-white">
        <CardContent className="pt-4">
          <h3 className="font-medium mb-4 px-2 text-[rgba(169,0,232,1)]">Quick Actions</h3>
          <div className="neumorphic-inset p-4 rounded-xl">
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
              {quickActions.map((action) => (
                <QuickActionButton
                  key={action.path}
                  icon={action.icon}
                  label={action.label}
                  path={action.path}
                  color={action.color}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Transactions */}
      <Card className="mb-8 neumorphic bg-white">
        <CardContent className="pt-4">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="font-medium text-[rgba(169,0,232,1)]">Transaction History</h3>
            <Link href="/transactions" className="text-sm text-[rgba(169,0,232,1)] hover:underline flex items-center gap-1 font-medium">
              View All <span className="text-xs">→</span>
            </Link>
          </div>
          
          {/* Transaction filter tabs for dashboard */}
          <div className="border-b border-gray-200 mb-2">
            <div className="flex space-x-4 px-2">
              <button className="py-2 text-sm font-medium text-[rgba(169,0,232,1)] border-b-2 border-[rgba(169,0,232,1)]">
                Recent
              </button>
              <button className="py-2 text-sm font-medium text-gray-500 hover:text-[rgba(169,0,232,0.8)]">
                Pending
              </button>
            </div>
          </div>
          
          <div className="neumorphic-inset p-4 rounded-xl">
            <div className="divide-y divide-gray-100">
              {isLoadingTransactions ? (
                <div className="py-8 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-[rgba(169,0,232,1)] border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading transactions...</p>
                </div>
              ) : recentTransactions.length > 0 ? (
                recentTransactions.map((transaction, index) => (
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
                    compact={true}
                  />
                ))
              ) : (
                <div className="py-8 text-center">
                  <div className="text-[rgba(169,0,232,1)] mb-2 flex justify-center">
                    <ClockIcon size={24} />
                  </div>
                  <p className="text-sm font-medium text-black">No transactions yet</p>
                  <p className="text-xs text-gray-500 mt-1">Your transaction history will appear here</p>
                </div>
              )}
            </div>
          </div>
          
          {recentTransactions.length > 0 && (
            <div className="mt-4 text-center">
              <Button 
                variant="link" 
                size="sm" 
                className="text-[rgba(169,0,232,1)] font-medium"
                onClick={() => window.location.href = '/transactions'}
              >
                View complete transaction history
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletDashboard;
