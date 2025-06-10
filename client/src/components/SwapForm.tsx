import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useWallet } from "@/contexts/WalletContext";
import { useSwap } from "@/contexts/SwapContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowUpDown, RefreshCw, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

const SwapForm = () => {
  const { wallet, solBalance, pensacoinBalance, refreshBalances } = useWallet();
  const { 
    swapTokens,
    calculateSwapOutput, 
    swapRate, 
    swapFeePercent, 
    getNetworkFee,
    isSwapLoading
  } = useSwap();
  const { toast } = useToast();

  const [fromToken, setFromToken] = useState<'SOL' | 'PENSA'>('SOL');
  const [toToken, setToToken] = useState<'SOL' | 'PENSA'>('PENSA');
  const [amount, setAmount] = useState("");
  const [estimatedOutput, setEstimatedOutput] = useState("");
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Handle output calculation with proper formatting 
  useEffect(() => {
    const calculateOutput = () => {
      // Remove any commas from the input for calculation
      const cleanAmount = amount.replace(/,/g, '');

      if (cleanAmount && !isNaN(parseFloat(cleanAmount)) && parseFloat(cleanAmount) > 0) {
        setIsLoadingRoute(true);

        try {
          // Calculate the estimated output using our local calculation with the clean amount
          const output = calculateSwapOutput(fromToken, toToken, parseFloat(cleanAmount));

          // Format the output appropriately based on token type with better formatting
          if (fromToken === 'PENSA' && toToken === 'SOL') {
            // For SOL output, show up to 10 decimal places
            setEstimatedOutput(output.toFixed(10));
          } else if (fromToken === 'SOL' && toToken === 'PENSA') {
            // For PENSA output, use proper comma formatting for large numbers
            setEstimatedOutput(output.toLocaleString('en-US', { maximumFractionDigits: 0 }));
          } else {
            // Default formatting for other cases
            setEstimatedOutput(output.toFixed(8));
          }
        } catch (error) {
          console.error("Failed to calculate output:", error);
          setEstimatedOutput("0");
        } finally {
          setIsLoadingRoute(false);
        }
      } else {
        setEstimatedOutput("0");
      }
    };

    calculateOutput();
  }, [amount, fromToken, toToken, calculateSwapOutput]);

  // Switch from/to tokens
  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmount(""); // Reset amount when switching
  };

  // Validate amount based on token balances
  const validateAmount = (): boolean => {
    // Remove any commas from the amount for validation
    const cleanAmount = amount.replace(/,/g, '');

    if (!cleanAmount || isNaN(parseFloat(cleanAmount)) || parseFloat(cleanAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return false;
    }

    // Use the clean amount with no commas for numeric comparison
    const inputAmount = parseFloat(cleanAmount);
    const availableBalance = fromToken === 'SOL' 
      ? parseFloat(solBalance)
      : parseFloat(pensacoinBalance);

    if (inputAmount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${fromToken} for this swap`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Get maximum available balance for the selected token
  const getMaxBalance = () => {
    if (fromToken === 'SOL') {
      // Leave some SOL for transaction fees
      const max = Math.max(parseFloat(solBalance) - 0.01, 0);
      return max > 0 ? max.toString() : "0";
    } else {
      return pensacoinBalance;
    }
  };

  // Handle using maximum available balance
  const handleMaxBalance = () => {
    setAmount(getMaxBalance());
  };

  // Handle swap via Raydium
  const handleSwap = async () => {
    if (!wallet) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to swap tokens",
        variant: "destructive",
      });
      return;
    }

    if (!validateAmount()) return;

    // Simple clean-up to remove commas for internal calculations
    const rawAmount = amount.replace(/,/g, '');

    toast({
      title: "Initiating Token Swap",
      description: `Preparing to swap ${amount} ${fromToken} for approximately ${estimatedOutput} ${toToken}. Please approve the transaction.`,
    });

    try {
      // Use the RAW user input exactly as they typed it
      // This preserves the user intent - when they type 5000 they mean 5,000 tokens
      console.log(`🚀 FINAL SWAP AMOUNT: "${amount}" tokens, (${parseFloat(rawAmount).toLocaleString()} tokens)`);

      // CRITICAL FIX: We need to pass the exact string value to avoid floating point precision issues
      await swapTokens(
        wallet,
        refreshBalances,
        fromToken,
        toToken,
        amount // Pass user's EXACT input
      );

      // Reset input after successful swap
      setAmount("");
      setEstimatedOutput("0");

      toast({
        title: "Swap Complete",
        description: `Successfully swapped ${amount} ${fromToken} for ${toToken}. Your balances will update shortly.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Swap error:", error);

      // Show a helpful error message
      toast({
        title: "Transaction Failed",
        description: error instanceof Error 
          ? `Error: ${error.message}` 
          : "Failed to complete the swap. Please check your balance and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto neumorphic bg-white">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-2xl text-[rgba(169,0,232,1)]">Swap</CardTitle>
          <Link href="/wallet-dashboard">
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-[rgba(169,0,232,1)]">
              <i className="fas fa-chevron-left"></i> Back
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-white p-4 rounded-xl neumorphic text-sm">
          <p className="font-medium mb-1 text-[rgba(169,0,232,1)]">Raydium Trading API</p>
          <p className="text-gray-700">Execute real token swaps using Raydium's official trading API. All transactions are executed on the Solana blockchain with true liquidity pools.</p>
        </div>
        {/* From Token */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-gray-700">From</label>
            <span className="text-sm text-gray-500">
              Balance: {fromToken === 'SOL' ? solBalance : pensacoinBalance} {fromToken}
            </span>
          </div>

          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0.0"
                value={amount}
                onChange={(e) => {
                  // Store raw input without commas for calculation
                  const rawValue = e.target.value.replace(/,/g, '');

                  // Validate that it's a valid number
                  if (rawValue === '' || (!isNaN(Number(rawValue)) && !rawValue.includes('e'))) {
                    // Store the raw value to ensure exact amount is used in transaction
                    setAmount(rawValue);
                  }
                }}
                className="pr-16 neumorphic-inset bg-white"
                disabled={isSwapLoading}
              />
              <button
                onClick={handleMaxBalance}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-[rgba(169,0,232,1)] font-medium"
                disabled={isSwapLoading}
              >
                MAX
              </button>
            </div>

            <div className="flex-shrink-0">
              <Button 
                variant="outline" 
                className="h-full min-w-[80px] font-medium neumorphic bg-white text-gray-700"
                onClick={() => setFromToken(fromToken === 'SOL' ? 'PENSA' : 'SOL')}
                disabled={isSwapLoading}
              >
                {fromToken}
              </Button>
            </div>
          </div>
        </div>

        {/* Switch Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={switchTokens}
            className="h-8 w-8 rounded-full bg-white neumorphic hover:text-[rgba(169,0,232,1)]"
            disabled={isSwapLoading}
          >
            <ArrowUpDown size={16} className="text-gray-700" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-gray-700">To (Estimated)</label>
            <span className="text-sm text-gray-500">
              Balance: {toToken === 'SOL' ? solBalance : pensacoinBalance} {toToken}
            </span>
          </div>

          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="0.0"
                value={estimatedOutput}
                readOnly
                className="flex-grow neumorphic-inset bg-white"
              />
              {isLoadingRoute && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <RefreshCw size={16} className="animate-spin text-[rgba(169,0,232,1)]" />
                </div>
              )}
            </div>

            <Button 
              variant="outline" 
              className="flex-shrink-0 h-full min-w-[80px] font-medium neumorphic bg-white text-gray-700"
              onClick={() => setToToken(toToken === 'SOL' ? 'PENSA' : 'SOL')}
              disabled={isSwapLoading}
            >
              {toToken}
            </Button>
          </div>
        </div>

        {/* Swap Details */}
        <div className="bg-white p-4 rounded-xl neumorphic space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Rate</span>
            <span className="font-medium text-black">
              {fromToken === 'SOL' 
                ? `1 SOL = ${swapRate.solToPensa.toLocaleString()} PENSA`
                : `1 PENSA = ${swapRate.pensaToSol.toFixed(14)} SOL`}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Expected Fee</span>
            <span className="font-medium text-black">{swapFeePercent}%</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Network Fee</span>
            <span className="font-medium text-black">{getNetworkFee()}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Button 
          className="w-full bg-[rgba(169,0,232,1)] text-white hover:bg-[rgba(169,0,232,0.9)] neumorphic"
          disabled={isSwapLoading || isLoadingRoute || !amount || parseFloat(amount) <= 0}
          onClick={handleSwap}
        >
          {isSwapLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Executing Trade...
            </>
          ) : (
            <>
              Swap
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SwapForm;