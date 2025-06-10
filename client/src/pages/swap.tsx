import { useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import SwapForm from "@/components/SwapForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { InfoIcon, ChevronLeft } from "lucide-react";

const Swap = () => {
  const { refreshBalances } = useWallet();

  // Refresh balances when the component mounts
  useEffect(() => {
    refreshBalances();
  }, [refreshBalances]);

  return (
    <div className="max-w-md mx-auto mt-6 pb-8">
      {/* Swap Form */}
      <SwapForm />
      
      {/* Information about Raydium */}
      <Card className="mt-6 neumorphic bg-white">
        <CardContent className="pt-6">
          <div className="flex items-start mb-4">
            <InfoIcon className="text-[rgba(169,0,232,1)] mr-3 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-medium mb-1 text-black">About Raydium Swaps</h3>
              <p className="text-sm text-gray-700 mb-2">
                Raydium is one of Solana's leading decentralized exchanges that offers competitive swap rates and deep liquidity.
              </p>
              <p className="text-sm text-gray-700 mb-2">
                This integration uses the Raydium swap URL approach which provides secure and efficient token exchanges through Raydium's platform.
              </p>
              <p className="text-sm text-gray-700">
                When you click "Swap via Raydium," you'll be redirected to the Raydium swap interface with your tokens and amounts pre-filled.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl neumorphic text-sm mt-4">
            <p className="font-medium mb-2 text-[rgba(169,0,232,1)]">How It Works</p>
            <p className="mb-2 text-gray-700">
              1. Enter the amount you want to swap
            </p>
            <p className="mb-2 text-gray-700">
              2. Click "Swap via Raydium" to be redirected to Raydium's interface
            </p>
            <p className="mb-2 text-gray-700">
              3. Connect your wallet on Raydium and complete the swap
            </p>
            <p className="text-gray-700">
              4. Return to this app and refresh your balances
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Swap;
