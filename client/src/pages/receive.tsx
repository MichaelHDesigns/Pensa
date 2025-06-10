import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ChevronLeft, AlertTriangle, Copy } from "lucide-react";

// QR Code SVG generator (simplified version)
const generateQRCode = (text: string, size = 200): string => {
  // This is a simplified version that just creates a placeholder
  // In a real app, use a proper QR code library
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
};

const Receive = () => {
  const { wallet, shortenAddress } = useWallet();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"sol" | "pensacoin">("sol");
  
  const walletAddress = wallet ? wallet.publicKey.toString() : "";
  const shortAddress = shortenAddress(walletAddress);
  
  // Copy address to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress)
      .then(() => {
        toast({
          title: "Address Copied",
          description: "Wallet address copied to clipboard",
          duration: 2000,
        });
      })
      .catch(() => {
        toast({
          title: "Copy Failed",
          description: "Failed to copy address",
          variant: "destructive",
        });
      });
  };
  
  return (
    <div className="max-w-md mx-auto">
      <header className="mb-6">
        <div className="flex items-center mb-4">
          <Link href="/wallet-dashboard">
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-[rgba(169,0,232,1)]">
              <i className="fas fa-chevron-left"></i> Back
            </Button>
          </Link>
        </div>
      </header>
      
      <Card className="neumorphic bg-white">
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "sol" | "pensacoin")}>
            <h1 className="text-2xl font-bold text-[rgba(169,0,232,1)] mb-4">Receive</h1>
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100">
              <TabsTrigger value="sol" className="data-[state=active]:bg-[rgba(169,0,232,1)] data-[state=active]:text-white">Receive SOL</TabsTrigger>
              <TabsTrigger value="pensacoin" className="data-[state=active]:bg-[rgba(169,0,232,1)] data-[state=active]:text-white">Receive PENSA</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sol" className="flex flex-col items-center">
              <div className="neumorphic-inset p-6 rounded-xl bg-white mb-6">
                {walletAddress && (
                  <img 
                    src={generateQRCode(walletAddress)} 
                    alt="QR Code" 
                    width={200} 
                    height={200}
                    className="mx-auto"
                  />
                )}
              </div>
              
              <div className="w-full p-4 bg-white rounded-xl neumorphic-inset mb-5 flex items-center justify-between">
                <div className="truncate font-mono text-sm mr-2 text-black">
                  {walletAddress}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={copyToClipboard}
                  className="text-[rgba(169,0,232,1)] hover:text-[rgba(169,0,232,0.8)]"
                >
                  <Copy size={16} />
                </Button>
              </div>
              
              <div className="text-center text-sm text-gray-700 bg-white p-4 rounded-xl neumorphic w-full">
                <p className="mb-1">Send only <span className="font-medium text-[rgba(169,0,232,1)]">SOL</span> to this address.</p>
                <p>Your SOL will appear in your wallet after network confirmation.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="pensacoin" className="flex flex-col items-center">
              <div className="neumorphic-inset p-6 rounded-xl bg-white mb-6">
                {walletAddress && (
                  <img 
                    src={generateQRCode(walletAddress)} 
                    alt="QR Code" 
                    width={200} 
                    height={200}
                    className="mx-auto"
                  />
                )}
              </div>
              
              <div className="w-full p-4 bg-white rounded-xl neumorphic-inset mb-5 flex items-center justify-between">
                <div className="truncate font-mono text-sm mr-2 text-black">
                  {walletAddress}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={copyToClipboard}
                  className="text-[rgba(169,0,232,1)] hover:text-[rgba(169,0,232,0.8)]"
                >
                  <Copy size={16} />
                </Button>
              </div>
              
              <div className="text-center text-sm text-gray-700 bg-white p-4 rounded-xl neumorphic w-full">
                <p className="mb-1">Send only <span className="font-medium text-[rgba(169,0,232,1)]">PENSA</span> to this address.</p>
                <p className="mb-1">Make sure the sender supports SPL tokens.</p>
                <p>Your PENSA will appear in your wallet after network confirmation.</p>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 bg-white p-4 rounded-xl neumorphic text-sm">
            <div className="flex items-start">
              <AlertTriangle className="text-[rgba(169,0,232,1)] mr-2 flex-shrink-0" size={18} />
              <p className="text-gray-700">Always verify your address before sharing. Only share with trusted sources.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Receive;
