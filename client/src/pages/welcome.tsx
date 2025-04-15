import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useWallet } from "../contexts/WalletContext";

const Welcome = () => {
  const [_, setLocation] = useLocation();
  const { walletList } = useWallet();

  useEffect(() => {
    const activeWalletId = localStorage.getItem("activeWalletId");
    if (activeWalletId && walletList?.length > 0) {
      setLocation("/wallet");
    }
  }, [walletList, setLocation]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-gray-900">Welcome to PensaWallet</CardTitle>
            <CardDescription className="text-center text-gray-600">Get started with your crypto journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Button
                onClick={() => setLocation("/create-wallet")}
                className="gradient-bg hover:opacity-90 w-full"
              >
                Create New Wallet
              </Button>
              <Button
                onClick={() => setLocation("/import-wallet")}
                variant="outline"
                className="w-full"
              >
                Import Existing Wallet
              </Button>
            </div>
          </CardContent>
          {walletList && walletList.length > 0 && (
            <CardFooter>
              <Button
                onClick={() => setLocation("/wallet")}
                className="w-full gradient-bg hover:opacity-90"
              >
                Open My Wallet
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Welcome;