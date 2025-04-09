import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const Welcome = () => {
  const [_, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="h-20 w-20 gradient-bg rounded-full flex items-center justify-center text-white mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">Welcome to PensaSwap</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A secure Solana wallet that lets you manage your assets and swap between Pensacoin and Solana easily.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mt-10">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="text-[#9945FF] text-4xl mb-4">
              <i className="fas fa-plus-circle"></i>
            </div>
            <h2 className="text-xl font-semibold mb-2">Create New Wallet</h2>
            <p className="text-gray-600 mb-6">Generate a new Solana wallet with a secure recovery phrase.</p>
            <Button 
              className="w-full gradient-bg hover:opacity-90"
              onClick={() => setLocation("/create-wallet")}
            >
              Create Wallet
            </Button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="text-[#00C2FF] text-4xl mb-4">
              <i className="fas fa-key"></i>
            </div>
            <h2 className="text-xl font-semibold mb-2">Import Existing Wallet</h2>
            <p className="text-gray-600 mb-6">Import your wallet using a recovery phrase or private key.</p>
            <Button 
              variant="outline" 
              className="w-full border-[#00C2FF] text-[#00C2FF] hover:bg-[#00C2FF] hover:bg-opacity-10"
              onClick={() => setLocation("/import-wallet")}
            >
              Import Wallet
            </Button>
          </div>
        </div>
        
        <div className="mt-16">
          <h2 className="text-xl font-semibold mb-4 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 rounded-full bg-[#9945FF] bg-opacity-10 flex items-center justify-center text-[#9945FF] mb-4">
                <i className="fas fa-wallet"></i>
              </div>
              <h3 className="font-medium mb-2">1. Set Up Your Wallet</h3>
              <p className="text-gray-600 text-sm">Create a new wallet or import an existing one to start managing your assets.</p>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 rounded-full bg-[#00C2FF] bg-opacity-10 flex items-center justify-center text-[#00C2FF] mb-4">
                <i className="fas fa-coins"></i>
              </div>
              <h3 className="font-medium mb-2">2. View Your Balance</h3>
              <p className="text-gray-600 text-sm">Check your SOL and Pensacoin balances securely in one place.</p>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 rounded-full bg-[#14F195] bg-opacity-10 flex items-center justify-center text-[#14F195] mb-4">
                <i className="fas fa-exchange-alt"></i>
              </div>
              <h3 className="font-medium mb-2">3. Swap Tokens</h3>
              <p className="text-gray-600 text-sm">Easily swap between Pensacoin and Solana with just a few clicks.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
