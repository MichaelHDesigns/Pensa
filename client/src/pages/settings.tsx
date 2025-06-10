import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { ChevronLeft, AlertTriangle } from "lucide-react";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const {
    wallet,
    removeWallet,
    disconnect,
    switchWallet,
    setNetwork,
    solBalance,
    pensacoinBalance,
    publicKey,
    walletList,
    activeWalletId,
    networkType,
  } = useWallet();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [showRemoveWalletDialog, setShowRemoveWalletDialog] = useState(false);
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

  // Handle network change
  const handleNetworkChange = (
    networkType: "mainnet" | "devnet" | "testnet",
  ) => {
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
    <div className="max-w-md mx-auto mt-6">
      {/* Wallet Info */}
      <Card className="mb-6 neumorphic-inset bg-white">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-[rgba(169,0,232,1)]">
              Wallet Settings
            </CardTitle>
            <Link href="/wallet-dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-[rgba(169,0,232,1)]"
              >
                <i className="fas fa-chevron-left"></i> Back
              </Button>
            </Link>
          </div>
          <p className="text-gray-600 text-sm">
            Manage Wallet and Account Preferences.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold text-[rgba(169,0,232,1)] mb-3">
            Wallet Information
          </h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Wallet Address</span>
            <span className="font-mono text-sm truncate max-w-[200px] text-black">
              {publicKey}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">SOL Balance</span>
            <span className="font-medium text-black">{solBalance} SOL</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">PENSA Balance</span>
            <span className="font-medium text-black">
              {pensacoinBalance} PENSA
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Management */}
      <Card className="mb-6 neumorphic-inset bg-white">
        <CardHeader>
          <CardTitle className="text-[rgba(169,0,232,1)]">
            Wallet Management
          </CardTitle>
          <CardDescription className="text-gray-700">
            Create, Import, Switch or Remove Wallets
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Link href="/create-wallet">
              <Button
                variant="outline"
                className="w-full neumorphic bg-white text-gray-700"
              >
                Create New Wallet
              </Button>
            </Link>

            <Link href="/import-wallet">
              <Button
                variant="outline"
                className="w-full neumorphic bg-white text-gray-700"
              >
                Import Wallet
              </Button>
            </Link>
          </div>

          {/* Switch Wallet Dialog */}
          <Dialog
            open={showWalletSelectDialog}
            onOpenChange={setShowWalletSelectDialog}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full mt-2 neumorphic bg-white text-gray-700"
              >
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
                          activeWalletId === walletItem.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200"
                        }`}
                        onClick={() => handleSwitchWallet(walletItem.id)}
                      >
                        <div>
                          <div className="font-medium">{walletItem.name}</div>
                          <div className="text-xs text-gray-500">
                            {activeWalletId === walletItem.id ? "Active" : ""}
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
                <Button
                  variant="outline"
                  onClick={() => setShowWalletSelectDialog(false)}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Remove Wallet Dialog */}
          <Dialog
            open={showRemoveWalletDialog}
            onOpenChange={setShowRemoveWalletDialog}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full mt-2 bg-red-50 text-red-600 hover:text-red-700 hover:bg-red-100 neumorphic border-red-200"
              >
                Remove Wallet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove Wallet</DialogTitle>
                <DialogDescription>
                  Are you sure you want to remove this wallet? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-amber-50 text-amber-800 p-3 my-4 rounded-md text-sm">
                <div className="flex items-center">
                  <AlertTriangle
                    className="text-amber-600 mr-2 flex-shrink-0"
                    size={18}
                  />
                  <p>
                    Make sure you have backed up your private key or recovery
                    phrase before removing the wallet.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowRemoveWalletDialog(false)}
                >
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

      {/* App Settings */}
      <Card className="mb-6 neumorphic-inset bg-white">
        <CardHeader>
          <CardTitle className="text-[rgba(169,0,232,1)]">
            Application Settings
          </CardTitle>
          <CardDescription className="text-gray-700">
            Customize App Behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg neumorphic bg-white">
            <div className="flex items-center gap-3">
              {theme === "light" ? (
                <Sun className="text-[rgba(169,0,232,1)]" />
              ) : (
                <Moon className="text-[rgba(169,0,232,1)]" />
              )}
              <span>Theme Mode</span>
            </div>
            <Button variant="ghost" onClick={toggleTheme}>
              {theme === "light" ? "Dark" : "Light"}
            </Button>
          </div>

          {/* Network Dialog */}
          <Dialog open={showNetworkDialog} onOpenChange={setShowNetworkDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full neumorphic bg-white text-gray-700"
              >
                Network Settings
                <span className="ml-auto bg-[rgba(169,0,232,0.1)] text-[rgba(169,0,232,1)] rounded px-2 py-0.5 text-xs">
                  {networkType}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Network Settings</DialogTitle>
                <DialogDescription>
                  Select which Solana Network to Connect to
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <RadioGroup
                  defaultValue={networkType}
                  className="space-y-3"
                  onValueChange={handleNetworkChange}
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="mainnet" id="mainnet" />
                    <Label htmlFor="mainnet" className="flex-1 cursor-pointer">
                      <div className="font-medium">Mainnet</div>
                      <div className="text-xs text-gray-500">
                        Production Solana Network
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="devnet" id="devnet" />
                    <Label htmlFor="devnet" className="flex-1 cursor-pointer">
                      <div className="font-medium">Devnet</div>
                      <div className="text-xs text-gray-500">
                        Development Solana Network
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="testnet" id="testnet" />
                    <Label htmlFor="testnet" className="flex-1 cursor-pointer">
                      <div className="font-medium">Testnet</div>
                      <div className="text-xs text-gray-500">
                        Testing Solana Network
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowNetworkDialog(false)}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card className="mb-6 neumorphic-inset bg-white">
        <CardHeader>
          <CardTitle className="text-[rgba(169,0,232,1)]">FAQ</CardTitle>
        </CardHeader>
        <CardContent>
          <a
            href="https://www.pensacolacrypto.com/faq#gsc.tab=0"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg neumorphic bg-white text-gray-700 hover:bg-[rgba(169,0,232,0.1)] group"
          >
            <i className="fa-solid fa-circle-question text-xl text-[rgba(169,0,232,1)]"></i>
            <span className="group-hover:text-[rgba(169,0,232,1)]">FAQ</span>
          </a>
        </CardContent>
      </Card>

      {/* Socials Section */}
      <Card className="mb-6 neumorphic-inset bg-white">
        <CardHeader>
          <CardTitle className="text-[rgba(169,0,232,1)]">Socials</CardTitle>
          <CardDescription className="text-gray-700">
            Connect With Us on Social Media
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <a
            href="https://t.me/+VMaUYNUdirY4MmM5"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg neumorphic bg-white text-gray-700 hover:bg-[rgba(169,0,232,0.1)] group"
          >
            <i className="fa-brands fa-telegram text-xl text-[rgba(169,0,232,1)]"></i>
            <span className="group-hover:text-[rgba(169,0,232,1)]">
              Telegram
            </span>
          </a>
          <a
            href="https://www.x.com/pensacoin"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg neumorphic bg-white text-gray-700 hover:bg-[rgba(169,0,232,0.1)] group"
          >
            <i className="fa-brands fa-x-twitter text-xl text-[rgba(169,0,232,1)]"></i>
            <span className="group-hover:text-[rgba(169,0,232,1)]">X</span>
          </a>
          <a
            href="https://facebook.com/pensacolacrypto"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg neumorphic bg-white text-gray-700 hover:bg-[rgba(169,0,232,0.1)] group"
          >
            <i className="fa-brands fa-facebook text-xl text-[rgba(169,0,232,1)]"></i>
            <span>Facebook</span>
          </a>
        </CardContent>
      </Card>

      {/* Feedback Section */}
      <Card className="mb-6 neumorphic-inset bg-white">
        <CardHeader>
          <CardTitle className="text-[rgba(169,0,232,1)]">Feedback</CardTitle>
          <CardDescription className="text-gray-700">
            Help Us Improve Pensacola Crypto Wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link
            href="/about"
            className="flex items-center gap-3 p-3 rounded-lg neumorphic bg-white text-gray-700 hover:bg-[rgba(169,0,232,0.1)] group"
          >
            <i className="fa-solid fa-circle-info text-xl text-[rgba(169,0,232,1)]"></i>
            <span className="group-hover:text-[rgba(169,0,232,1)]">
              About App
            </span>
          </Link>
          <a
            href="https://play.google.com/store/apps/details?id=com.pensawallet.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg neumorphic bg-white text-gray-700 hover:bg-[rgba(169,0,232,0.1)] group"
          >
            <i className="fa-solid fa-star text-xl text-[rgba(169,0,232,1)]"></i>
            <span className="group-hover:text-[rgba(169,0,232,1)]">
              Rate Us
            </span>
          </a>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: "Pensacola Crypto Wallet",
                  text: "Check out Pensacola Crypto Wallet - Your Solana Wallet",
                  url: "https://www.pensacolacrypto.com",
                });
              }
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg neumorphic bg-white text-gray-700 hover:bg-[rgba(169,0,232,0.1)] group"
          >
            <i className="fa-solid fa-share text-xl text-[rgba(169,0,232,1)]"></i>
            <span className="group-hover:text-[rgba(169,0,232,1)]">
              Tell Friends
            </span>
          </button>
          <a
            href="mailto:pensacolacrypto@gmail.com?subject=Pensacola Crypto Wallet Feedback"
            className="flex items-center gap-3 p-3 rounded-lg neumorphic bg-white text-gray-700 hover:bg-[rgba(169,0,232,0.1)] group"
          >
            <i className="fa-solid fa-envelope text-xl text-[rgba(169,0,232,1)]"></i>
            <span className="group-hover:text-[rgba(169,0,232,1)]">
              Contact Us
            </span>
          </a>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
