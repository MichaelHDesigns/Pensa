import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { ChevronLeft, AlertTriangle } from "lucide-react";

const Settings = () => {
  const { 
    wallet, removeWallet, disconnect, switchWallet, setCurrency, setNetwork,
    solBalance, pensacoinBalance, publicKey, walletList, activeWalletId,
    currency, networkType
  } = useWallet();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [showRemoveWalletDialog, setShowRemoveWalletDialog] = useState(false);
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [showNetworkDialog, setShowNetworkDialog] = useState(false);
  const [showWalletSelectDialog, setShowWalletSelectDialog] = useState(false);
  // No longer need custom RPC

  // Handle wallet removal
  const handleRemoveWallet = () => {
    try {
      // Remove wallet from storage and context
      removeWallet();

      toast({
        title: "Wallet Removed",
        description: "Your wallet has been successfully removed",
      });

      // Navigate back to welcome page after removing wallet
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove wallet",
        variant: "destructive",
      });
    }
  };

  // Handle wallet switching
  const handleSwitchWallet = async (walletId: string) => {
    try {
      await switchWallet(walletId);
      setShowWalletSelectDialog(false);

      toast({
        title: "Wallet Switched",
        description: "Successfully switched to the selected wallet",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to switch wallet",
        variant: "destructive",
      });
    }
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: string) => {
    try {
      setCurrency(newCurrency as "USD" | "EUR" | "GBP" | "JPY" | "CNY" | "KRW");
      setShowCurrencyDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update currency preference",
        variant: "destructive",
      });
    }
  };

  // Handle network change
  const handleNetworkChange = (networkType: "mainnet" | "devnet" | "testnet") => {
    try {
      setNetwork(networkType);
      setShowNetworkDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update network settings",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <header className="mb-6">
        <div className="flex justify-center mb-1">
          <Link href="/wallet-dashboard" className="absolute left-4">
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-[rgba(169,0,232,1)]">
              <ChevronLeft size={16} /> Back
            </Button>
          </Link>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[rgba(169,0,232,1)]">Wallet Settings</h1>
          <p className="text-gray-600 mt-1">Manage your wallet and account preferences.</p>
        </div>
      </header>

      {/* Wallet Info */}
      <Card className="mb-6 neumorphic bg-white">
        <CardHeader>
          <CardTitle className="text-[rgba(169,0,232,1)]">Wallet Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Wallet Address</span>
            <span className="font-mono text-sm truncate max-w-[200px] text-black">{publicKey}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">SOL Balance</span>
            <span className="font-medium text-black">{solBalance} SOL</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">PENSA Balance</span>
            <span className="font-medium text-black">{pensacoinBalance} PENSA</span>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Management */}
      <Card className="mb-6 neumorphic bg-white">
        <CardHeader>
          <CardTitle className="text-[rgba(169,0,232,1)]">Wallet Management</CardTitle>
          <CardDescription className="text-gray-700">Create, import, or remove wallets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Link href="/create-wallet">
              <Button variant="outline" className="w-full neumorphic bg-white text-gray-700">
                Create New Wallet
              </Button>
            </Link>

            <Link href="/import-wallet">
              <Button variant="outline" className="w-full neumorphic bg-white text-gray-700">
                Import Wallet
              </Button>
            </Link>
          </div>

          {/* Switch Wallet Dialog */}
          <Dialog open={showWalletSelectDialog} onOpenChange={setShowWalletSelectDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full mt-2 neumorphic bg-white text-gray-700">
                Switch Wallet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Wallet</DialogTitle>
                <DialogDescription>
                  Choose a wallet from your wallet list
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 my-4">
                {walletList.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No wallets found. Create or import a wallet first.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {walletList.map((walletItem) => (
                      <div 
                        key={walletItem.id} 
                        className={`p-3 rounded-lg border flex justify-between items-center cursor-pointer hover:bg-gray-50 ${
                          activeWalletId === walletItem.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                        }`}
                        onClick={() => handleSwitchWallet(walletItem.id)}
                      >
                        <div>
                          <div className="font-medium">{walletItem.name}</div>
                          <div className="text-xs text-gray-500">
                            {activeWalletId === walletItem.id ? 'Active' : ''}
                          </div>
                        </div>
                        {activeWalletId === walletItem.id && (
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowWalletSelectDialog(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Remove Wallet Dialog */}
          <Dialog open={showRemoveWalletDialog} onOpenChange={setShowRemoveWalletDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full mt-2 bg-red-50 text-red-600 hover:text-red-700 hover:bg-red-100 neumorphic border-red-200">
                Remove Wallet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove Wallet</DialogTitle>
                <DialogDescription>
                  Are you sure you want to remove this wallet? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-amber-50 text-amber-800 p-3 my-4 rounded-md text-sm">
                <div className="flex items-center">
                  <AlertTriangle className="text-amber-600 mr-2 flex-shrink-0" size={18} />
                  <p>
                    Make sure you have backed up your private key or recovery phrase before removing the wallet.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRemoveWalletDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleRemoveWallet}>
                  Remove Wallet
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="mb-6 neumorphic bg-white">
        <CardHeader>
          <CardTitle className="text-[rgba(169,0,232,1)]">Security</CardTitle>
          <CardDescription className="text-gray-700">Manage security settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full neumorphic bg-white text-gray-700">
                Verify Recovery Phrase
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Verify Recovery Phrase</DialogTitle>
                <DialogDescription>
                  Enter your 12-word recovery phrase to verify you have saved it correctly.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mnemonic">Recovery Phrase (12 words)</Label>
                  <Textarea
                    id="mnemonic"
                    placeholder="Enter your recovery phrase words separated by spaces"
                    className="mt-1 font-mono"
                    rows={3}
                  />
                </div>
                <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-sm">
                  <div className="flex items-start">
                    <AlertTriangle className="text-amber-600 mr-2 flex-shrink-0" size={18} />
                    <p>Never share your recovery phrase with anyone. Anyone with these words can access your wallet.</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {}}>Cancel</Button>
                <Button 
                  className="gradient-bg hover:opacity-90"
                  onClick={() => {
                    // Verify mnemonic logic here
                  }}
                >
                  Verify Phrase
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card className="mb-6 neumorphic bg-white">
        <CardHeader>
          <CardTitle className="text-[rgba(169,0,232,1)]">Application Settings</CardTitle>
          <CardDescription className="text-gray-700">Customize app behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Currency Dialog */}
          <Dialog open={showCurrencyDialog} onOpenChange={setShowCurrencyDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full neumorphic bg-white text-gray-700">
                Currency Preferences
                <span className="ml-auto bg-[rgba(169,0,232,0.1)] text-[rgba(169,0,232,1)] rounded px-2 py-0.5 text-xs">{currency}</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Currency Preferences</DialogTitle>
                <DialogDescription>
                  Select your preferred currency for displaying wallet values
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <RadioGroup defaultValue={currency} className="space-y-3" onValueChange={handleCurrencyChange}>
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="USD" id="USD" />
                    <Label htmlFor="USD" className="flex-1 cursor-pointer">US Dollar (USD)</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="EUR" id="EUR" />
                    <Label htmlFor="EUR" className="flex-1 cursor-pointer">Euro (EUR)</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="GBP" id="GBP" />
                    <Label htmlFor="GBP" className="flex-1 cursor-pointer">British Pound (GBP)</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="JPY" id="JPY" />
                    <Label htmlFor="JPY" className="flex-1 cursor-pointer">Japanese Yen (JPY)</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="CNY" id="CNY" />
                    <Label htmlFor="CNY" className="flex-1 cursor-pointer">Chinese Yuan (CNY)</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="KRW" id="KRW" />
                    <Label htmlFor="KRW" className="flex-1 cursor-pointer">Korean Won (KRW)</Label>
                  </div>
                </RadioGroup>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCurrencyDialog(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Network Dialog */}
          <Dialog open={showNetworkDialog} onOpenChange={setShowNetworkDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full neumorphic bg-white text-gray-700">
                Network Settings
                <span className="ml-auto bg-[rgba(169,0,232,0.1)] text-[rgba(169,0,232,1)] rounded px-2 py-0.5 text-xs">{networkType}</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Network Settings</DialogTitle>
                <DialogDescription>
                  Select which Solana network to connect to
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <RadioGroup defaultValue={networkType} className="space-y-3" onValueChange={handleNetworkChange}>
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="mainnet" id="mainnet" />
                    <Label htmlFor="mainnet" className="flex-1 cursor-pointer">
                      <div className="font-medium">Mainnet</div>
                      <div className="text-xs text-gray-500">Production Solana network</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="devnet" id="devnet" />
                    <Label htmlFor="devnet" className="flex-1 cursor-pointer">
                      <div className="font-medium">Devnet</div>
                      <div className="text-xs text-gray-500">Development Solana network</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="testnet" id="testnet" />
                    <Label htmlFor="testnet" className="flex-1 cursor-pointer">
                      <div className="font-medium">Testnet</div>
                      <div className="text-xs text-gray-500">Testing Solana network</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNetworkDialog(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;