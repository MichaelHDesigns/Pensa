
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="max-w-md mx-auto">
      <header className="mb-6">
        <div className="flex justify-center mb-1">
          <Link href="/settings" className="absolute left-4">
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-[rgba(169,0,232,1)]">
              <ChevronLeft size={16} /> Back
            </Button>
          </Link>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[rgba(169,0,232,1)]">About Pensacola Crypto Wallet</h1>
          <p className="text-gray-600 mt-1">Version 0.0.1</p>
        </div>
      </header>

      <div className="space-y-6 p-4">
        <div className="neumorphic-inset bg-white p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-3 text-[rgba(169,0,232,1)]">Overview</h2>
          <p className="text-gray-700">
            Pensacola Crypto Wallet, developed by Pensacola Crypto, is your secure gateway to the Solana blockchain. Our wallet provides a seamless and user-friendly experience for managing digital assets, particularly SOL and PENSA tokens.
          </p>
        </div>

        <div className="neumorphic-inset bg-white p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-3 text-[rgba(169,0,232,1)]">Key Features</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-[rgba(169,0,232,0.1)] flex items-center justify-center flex-shrink-0 mt-1">
                <i className="fa-solid fa-shield-halved text-sm text-[rgba(169,0,232,1)]"></i>
              </div>
              <div>
                <h3 className="font-medium">Secure Wallet Management</h3>
                <p className="text-sm text-gray-600">Create and manage wallets with industry-standard security protocols</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-[rgba(169,0,232,0.1)] flex items-center justify-center flex-shrink-0 mt-1">
                <i className="fa-solid fa-arrow-right-arrow-left text-sm text-[rgba(169,0,232,1)]"></i>
              </div>
              <div>
                <h3 className="font-medium">Token Swaps</h3>
                <p className="text-sm text-gray-600">Fast and efficient swaps between SOL and PENSA tokens</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-[rgba(169,0,232,0.1)] flex items-center justify-center flex-shrink-0 mt-1">
                <i className="fa-solid fa-qrcode text-sm text-[rgba(169,0,232,1)]"></i>
              </div>
              <div>
                <h3 className="font-medium">QR Code Support</h3>
                <p className="text-sm text-gray-600">Easy sharing of wallet addresses via QR codes</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-[rgba(169,0,232,0.1)] flex items-center justify-center flex-shrink-0 mt-1">
                <i className="fa-solid fa-network-wired text-sm text-[rgba(169,0,232,1)]"></i>
              </div>
              <div>
                <h3 className="font-medium">Multi-Network Support</h3>
                <p className="text-sm text-gray-600">Support for Mainnet, Devnet, and Testnet networks</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="neumorphic-inset bg-white p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-3 text-[rgba(169,0,232,1)]">Security</h2>
          <p className="text-gray-700">Your security is our top priority. Pensacola Crypto Wallet implements:</p>
          <ul className="mt-2 space-y-2 text-gray-700">
            <li className="flex items-center gap-2">
              <i className="fa-solid fa-check text-[rgba(169,0,232,1)]"></i>
              <span>Advanced encryption for wallet storage</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-solid fa-check text-[rgba(169,0,232,1)]"></i>
              <span>Secure transaction signing</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-solid fa-check text-[rgba(169,0,232,1)]"></i>
              <span>Recovery phrase backup system</span>
            </li>
          </ul>
        </div>

        <div className="neumorphic-inset bg-white p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-3 text-[rgba(169,0,232,1)]">About Us</h2>
          <p className="text-gray-700">
            Developed by Pensacola Crypto, we're committed to making cryptocurrency management accessible and secure for everyone. Our team combines blockchain expertise with user-centered design to deliver a superior wallet experience.
          </p>
        </div>
      </div>
    </div>
  );
}
