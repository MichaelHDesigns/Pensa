import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";

const ImportWallet = () => {
  const { importFromMnemonic, importFromPrivateKey } = useWallet();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [importType, setImportType] = useState<"mnemonic" | "privateKey">("mnemonic");
  const [mnemonic, setMnemonic] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [walletName, setWalletName] = useState("My Imported Wallet");
  const [isImporting, setIsImporting] = useState(false);
  
  // Handle import wallet
  const handleImport = async () => {
    if (!walletName.trim()) {
      toast({
        title: "Wallet Name Required",
        description: "Please enter a name for your wallet",
        variant: "destructive",
      });
      return;
    }
    
    if (importType === "mnemonic" && !mnemonic.trim()) {
      toast({
        title: "Missing Recovery Phrase",
        description: "Please enter your recovery phrase",
        variant: "destructive",
      });
      return;
    }
    
    if (importType === "privateKey" && !privateKey.trim()) {
      toast({
        title: "Missing Private Key",
        description: "Please enter your private key",
        variant: "destructive",
      });
      return;
    }
    
    setIsImporting(true);
    
    try {
      if (importType === "mnemonic") {
        await importFromMnemonic(mnemonic.trim(), walletName.trim());
      } else {
        await importFromPrivateKey(privateKey.trim(), walletName.trim());
      }
      
      toast({
        title: "Wallet Imported",
        description: `Wallet "${walletName}" has been imported successfully`,
      });
      
      // Navigate to wallet dashboard
      setLocation("/wallet");
    } catch (error) {
      console.error("Error importing wallet:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to import wallet";
      
      // More helpful message for private key errors
      let errorDescription = errorMessage;
      if (importType === "privateKey" && errorMessage.includes("Invalid private key")) {
        errorDescription = "The private key format could not be recognized. Please check your key and try again. Supported formats include Base58, Base64, and JSON.";
      }
      
      toast({
        title: "Import Failed",
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };
  
  // Go back to Welcome page
  const goBack = () => {
    setLocation("/welcome");
  };
  
  return (
    <div className="max-w-md mx-auto py-12 px-4 relative">
      <Button 
        variant="ghost" 
        size="sm" 
        className="absolute -left-2 top-16 flex items-center gap-1 text-[rgba(169,0,232,1)] z-10"
        onClick={goBack}
      >
        <i className="fas fa-chevron-left"></i> Back
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Import Wallet</CardTitle>
          <CardDescription>
            Import your existing Solana wallet using a recovery phrase or private key.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="wallet-name">Wallet Name</Label>
              <Input
                id="wallet-name"
                placeholder="My Imported Wallet"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
              />
            </div>
          </div>
        
          <Tabs value={importType} onValueChange={(v) => setImportType(v as "mnemonic" | "privateKey")}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="mnemonic">Recovery Phrase</TabsTrigger>
              <TabsTrigger value="privateKey">Private Key</TabsTrigger>
            </TabsList>
            
            <TabsContent value="mnemonic">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mnemonic">Recovery Phrase (12 or 24 words)</Label>
                  <Textarea
                    id="mnemonic"
                    placeholder="Enter your recovery phrase words separated by spaces"
                    className="mt-1 h-32"
                    value={mnemonic}
                    onChange={(e) => setMnemonic(e.target.value)}
                  />
                </div>
                <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-sm">
                  <div className="flex items-start">
                    <i className="fas fa-exclamation-triangle mr-2 mt-1"></i>
                    <p>Never share your recovery phrase with anyone. Anyone with this phrase can access your wallet.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="privateKey">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="privateKey">Private Key</Label>
                  <Input
                    id="privateKey"
                    placeholder="Enter your private key"
                    className="mt-1 font-mono"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supports Base58, Base64, and JSON formats
                  </p>
                </div>
                <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-sm">
                  <div className="flex items-start">
                    <i className="fas fa-exclamation-triangle mr-2 mt-1"></i>
                    <p>Never share your private key with anyone. Anyone with this key can access your wallet.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button 
            className="w-full gradient-bg hover:opacity-90"
            onClick={handleImport}
            disabled={isImporting}
          >
            {isImporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Importing...
              </>
            ) : (
              "Import Wallet"
            )}
          </Button>
          </CardFooter>
      </Card>
    </div>
  );
};

export default ImportWallet;
