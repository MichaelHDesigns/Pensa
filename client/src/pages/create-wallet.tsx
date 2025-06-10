import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/contexts/WalletContext";

const CreateWallet = () => {
  const { createWallet } = useWallet();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [mnemonic, setMnemonic] = useState<string>("");
  const [walletName, setWalletName] = useState<string>("My Wallet");
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState<"creating" | "backup" | "verify">("creating");
  const [confirmed, setConfirmed] = useState(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);

  // Generate a new wallet
  const handleCreateWallet = async () => {
    if (!walletName.trim()) {
      toast({
        title: "Wallet Name Required",
        description: "Please enter a name for your wallet",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create wallet with name
      await createWallet(walletName);
      const savedMnemonic = localStorage.getItem("walletMnemonic");

      if (savedMnemonic) {
        setMnemonic(savedMnemonic);
        // Move to backup step
        setStep("backup");
      } else {
        throw new Error("Failed to retrieve mnemonic");
      }
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast({
        title: "Wallet Creation Failed",
        description: "Unable to create a new wallet",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Prepare verification step
  const goToVerify = () => {
    const words = mnemonic.split(" ");
    const shuffled = [...words].sort(() => Math.random() - 0.5);

    setShuffledWords(shuffled);
    setSelectedWords([]);
    setStep("verify");
  };

  // Select/deselect a word during verification
  const toggleWord = (word: string) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  // Verify the mnemonic phrase
  const verifyMnemonic = () => {
    const originalWords = mnemonic.split(" ");
    const isCorrectOrder = selectedWords.every((word, index) => word === originalWords[index]);

    if (isCorrectOrder && selectedWords.length === originalWords.length) {
      // Successfully verified
      finalizeWalletCreation();
    } else {
      toast({
        title: "Verification Failed",
        description: "The order of words doesn't match your recovery phrase. Please try again.",
        variant: "destructive",
      });

      // Reset selection
      setSelectedWords([]);
    }
  };

  // Finalize wallet creation after verification
  const finalizeWalletCreation = async () => {
    setIsCreating(true);

    try {
      toast({
        title: "Wallet Verified!",
        description: "Your wallet has been created and verified successfully.",
      });

      // Navigate to wallet dashboard
      setLocation("/wallet");
    } catch (error) {
      console.error("Error finalizing wallet:", error);
      toast({
        title: "Wallet Creation Failed",
        description: "Unable to finalize the wallet creation",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Skip verification (not recommended in production)
  const skipVerification = async () => {
    if (!confirmed) {
      toast({
        title: "Confirmation Required",
        description: "Please confirm that you have saved your recovery phrase",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {      
      toast({
        title: "Wallet Created!",
        description: "Your new wallet has been created successfully.",
      });

      // Navigate to wallet dashboard
      setLocation("/wallet");
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast({
        title: "Wallet Creation Failed",
        description: "Unable to create a new wallet",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Go back to Welcome page
  const goBack = () => {
    setLocation("/welcome");
  };

  // Creating step - initial screen
  if (step === "creating") {
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
            <CardTitle className="text-2xl">Create New Wallet</CardTitle>
            <CardDescription>
              We'll generate a secure wallet with a recovery phrase you should keep safe.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col">
            <div className="flex flex-col items-center">
              <div className="my-6 w-24 h-24 gradient-bg rounded-full flex items-center justify-center">
                <i className="fas fa-wallet text-4xl text-white"></i>
              </div>
              <p className="text-sm text-gray-600 text-center mb-6">
                Your wallet will come with a 12-word recovery phrase. Write it down and keep it somewhere safe. 
                Never share it with anyone!
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet-name">Wallet Name</Label>
                <Input
                  id="wallet-name"
                  placeholder="My Wallet"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button 
              className="w-full gradient-bg hover:opacity-90"
              onClick={handleCreateWallet}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Wallet"
              )}
            </Button>
</CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Backup step - show recovery phrase
  if (step === "backup") {
    const words = mnemonic.split(" ");

    return (
      <div className="max-w-md mx-auto py-12 px-4 relative">
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute -left-2 top-16 flex items-center gap-1 text-[rgba(169,0,232,1)] z-10"
          onClick={() => setStep("creating")}
        >
          <i className="fas fa-chevron-left"></i> Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Backup Recovery Phrase</CardTitle>
            <CardDescription>
              Write down these 12 words in order and keep them safe. They're the only way to recover your wallet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex flex-wrap gap-2">
                {words.map((word, index) => (
                  <div key={index} className="bg-white rounded border border-amber-300 px-3 py-2 flex items-center">
                    <span className="text-amber-800 font-mono mr-2">{index + 1}.</span>
                    <span className="font-medium">{word}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start space-x-3 my-4">
              <Checkbox 
                id="confirm-backup" 
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked === true)}
              />
              <Label htmlFor="confirm-backup" className="text-sm text-gray-600">
                I have written down my recovery phrase and stored it in a safe place
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button 
              className="w-full gradient-bg hover:opacity-90"
              onClick={goToVerify}
              disabled={!confirmed}
            >
              Continue
            </Button>
            <Button 
              variant="outline" 
              className="w-full text-sm"
              onClick={skipVerification}
              disabled={!confirmed}
            >
              Skip Verification (Not Recommended)
            </Button>
</CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Verify step - verify recovery phrase
  if (step === "verify") {
    const mnemonicWords = mnemonic.split(" ");

    return (
      <div className="max-w-md mx-auto py-12 px-4 relative">
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute -left-2 top-16 flex items-center gap-1 text-[rgba(169,0,232,1)] z-10"
          onClick={() => setStep("backup")}
        >
          <i className="fas fa-chevron-left"></i> Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Verify Recovery Phrase</CardTitle>
            <CardDescription>
              Select the words in the correct order to verify that you've saved your recovery phrase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Selected words */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 min-h-[100px]">
              <div className="flex flex-wrap gap-2">
                {selectedWords.map((word, index) => (
                  <div 
                    key={index} 
                    className="bg-white rounded border border-gray-300 px-3 py-2 flex items-center cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleWord(word)}
                  >
                    <span className="text-gray-800 font-mono mr-2">{index + 1}.</span>
                    <span className="font-medium">{word}</span>
                  </div>
                ))}
                {selectedWords.length < mnemonicWords.length && (
                  <div className="border border-dashed border-gray-300 rounded px-3 py-2 text-gray-400">
                    Select word {selectedWords.length + 1}
                  </div>
                )}
              </div>
            </div>

            {/* Word options */}
            <div className="flex flex-wrap gap-2">
              {shuffledWords.map((word, index) => (
                <button
                  key={index}
                  className={`rounded px-3 py-2 text-sm font-medium ${
                    selectedWords.includes(word)
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  }`}
                  onClick={() => !selectedWords.includes(word) && toggleWord(word)}
                  disabled={selectedWords.includes(word)}
                >
                  {word}
                </button>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button 
              className="w-full gradient-bg hover:opacity-90"
              onClick={verifyMnemonic}
              disabled={selectedWords.length < mnemonicWords.length}
            >
              Verify & Create Wallet
            </Button>
</CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return null; // Should never reach here
};

export default CreateWallet;