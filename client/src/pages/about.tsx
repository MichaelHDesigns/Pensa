
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
          <h1 className="text-2xl font-semibold text-[rgba(169,0,232,1)]">About Pensa Wallet</h1>
          <p className="text-gray-600 mt-1">Version 0.0.1</p>
        </div>
      </header>

      <div className="space-y-6 p-4">
        <section>
          <h2 className="text-lg font-semibold mb-3 text-[rgba(169,0,232,1)]">Overview</h2>
          <p className="text-gray-700">
            Pensa Wallet is your secure gateway to the Solana blockchain, offering a seamless experience for managing your digital assets.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 text-[rgba(169,0,232,1)]">Key Features</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-[rgba(169,0,232,0.1)] flex items-center justify-center flex-shrink-0 mt-1">
                <i className="fa-solid fa-wallet text-sm text-[rgba(169,0,232,1)]"></i>
              </div>
              <div>
                <h3 className="font-medium">Secure Wallet Management</h3>
                <p className="text-sm text-gray-600">Create and import wallets with industry-standard security</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-[rgba(169,0,232,0.1)] flex items-center justify-center flex-shrink-0 mt-1">
                <i className="fa-solid fa-arrow-right-arrow-left text-sm text-[rgba(169,0,232,1)]"></i>
              </div>
              <div>
                <h3 className="font-medium">Token Swaps</h3>
                <p className="text-sm text-gray-600">Seamlessly swap between SOL and PENSA tokens</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-[rgba(169,0,232,0.1)] flex items-center justify-center flex-shrink-0 mt-1">
                <i className="fa-solid fa-clock-rotate-left text-sm text-[rgba(169,0,232,1)]"></i>
              </div>
              <div>
                <h3 className="font-medium">Transaction History</h3>
                <p className="text-sm text-gray-600">Track all your transactions in one place</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-[rgba(169,0,232,0.1)] flex items-center justify-center flex-shrink-0 mt-1">
                <i className="fa-solid fa-shield-halved text-sm text-[rgba(169,0,232,1)]"></i>
              </div>
              <div>
                <h3 className="font-medium">Multi-Network Support</h3>
                <p className="text-sm text-gray-600">Support for Mainnet, Devnet, and Testnet</p>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
