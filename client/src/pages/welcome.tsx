import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useWallet } from "../contexts/WalletContext";
import pensacoinLogo from "../assets/pensacoin.png";

const Welcome = () => {
  const [_, setLocation] = useLocation();
  const { walletList, isInitializing } = useWallet();

  useEffect(() => {
    if (!isInitializing) {
      const activeWalletId = localStorage.getItem("activeWalletId");
      if (activeWalletId && walletList?.length > 0) {
        setLocation("/wallet");
      }
    }
  }, [isInitializing, walletList, setLocation]);

  if (isInitializing) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 px-4">
      {/* Main Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[rgba(169,0,232,1)] mb-4">
          Welcome to PensaWallet
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your secure gateway to the Solana ecosystem. Manage your SOL, PENSA tokens, and explore DeFi with confidence.
        </p>
      </div>

      {/* Main Content Card */}
      <div className="max-w-4xl mx-auto w-full">
        <Card className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-8">
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-shield-alt text-2xl text-white"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Secure & Safe</h3>
                <p className="text-sm text-gray-600">Advanced encryption protects your assets and private keys</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <img 
                    src={pensacoinLogo}
                    alt="Pensacoin" 
                    className="h-16 w-16 rounded-full"
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Pensacoin & Solana</h3>
                <p className="text-sm text-gray-600">Manage SOL and PENSA tokens with dedicated support</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-exchange-alt text-2xl text-white"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Easy Trading</h3>
                <p className="text-sm text-gray-600">Swap tokens and access DeFi directly from your wallet</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={() => setLocation("/create-wallet")}
                  className="gradient-bg hover:opacity-90 w-full h-14 text-lg font-medium"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Create New Wallet
                </Button>
                <Button
                  onClick={() => setLocation("/import-wallet")}
                  variant="outline"
                  className="w-full h-14 text-lg font-medium border-2 hover:bg-gray-50"
                >
                  <i className="fas fa-download mr-2"></i>
                  Import Existing Wallet
                </Button>
              </div>
              
              {walletList && walletList.length > 0 && (
                <Button
                  onClick={() => setLocation("/wallet")}
                  className="w-full gradient-bg hover:opacity-90 h-14 text-lg font-medium"
                >
                  <i className="fas fa-wallet mr-2"></i>
                  Open My Wallet
                </Button>
              )}
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <i className="fas fa-lock text-[rgba(169,0,232,1)]"></i>
                  <span>Bank-level security</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-mobile-alt text-[rgba(169,0,232,1)]"></i>
                  <span>Mobile optimized</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-rocket text-[rgba(169,0,232,1)]"></i>
                  <span>Lightning fast</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Welcome;