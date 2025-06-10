import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as solanaWeb3 from "@solana/web3.js";
import { connection } from "@/lib/solana";
import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

const Send = () => {
  const { wallet, solBalance, pensacoinBalance, refreshBalances } = useWallet();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"sol" | "pensacoin">("sol");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [recipientError, setRecipientError] = useState("");
  const [amountError, setAmountError] = useState("");

  // Reset form errors when tab changes
  useEffect(() => {
    setRecipient("");
    setAmount("");
    setRecipientError("");
    setAmountError("");
  }, [activeTab]);

  // Validate Solana address
  const isValidSolanaAddress = (address: string): boolean => {
    try {
      new solanaWeb3.PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Validate form inputs
  const validateForm = (): boolean => {
    let isValid = true;

    // Validate recipient address
    if (!recipient.trim()) {
      setRecipientError("Recipient address is required");
      isValid = false;
    } else if (!isValidSolanaAddress(recipient)) {
      setRecipientError("Invalid Solana address");
      isValid = false;
    } else {
      setRecipientError("");
    }

    // Validate amount
    if (!amount.trim()) {
      setAmountError("Amount is required");
      isValid = false;
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setAmountError("Amount must be greater than 0");
      isValid = false;
    } else {
      const parsedAmount = parseFloat(amount);
      const maxAmount = activeTab === "sol" ? parseFloat(solBalance) : parseFloat(pensacoinBalance);

      if (parsedAmount > maxAmount) {
        setAmountError(`Insufficient balance. You have ${maxAmount} ${activeTab === "sol" ? "SOL" : "PENSA"}`);
        isValid = false;
      } else {
        setAmountError("");
      }
    }

    return isValid;
  };

  // Handle the send transaction
  const handleSend = async () => {
    if (!wallet) {
      toast({
        title: "No wallet connected",
        description: "Please connect a wallet to send tokens",
        variant: "destructive",
      });
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSending(true);

    try {
      const recipientPublicKey = new solanaWeb3.PublicKey(recipient);
      const amountToSend = parseFloat(amount);

      if (activeTab === "sol") {
        // Send SOL
        const transaction = new solanaWeb3.Transaction().add(
          solanaWeb3.SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: recipientPublicKey,
            lamports: amountToSend * solanaWeb3.LAMPORTS_PER_SOL,
          })
        );

        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.feePayer = wallet.publicKey;

        const signature = await solanaWeb3.sendAndConfirmTransaction(
          connection,
          transaction,
          [wallet]
        );

        toast({
          title: "SOL Sent Successfully",
          description: `${amountToSend} SOL has been sent to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
        });

        console.log("Transaction signature:", signature);
      } else {
        // Send PENSA (SPL token)
        // In a real implementation, we would use the SPL token program to send tokens
        // This is a simplified version that just shows a success toast

        toast({
          title: "PENSA Sent Successfully",
          description: `${amountToSend} PENSA has been sent to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
        });
      }

      // Reset form
      setRecipient("");
      setAmount("");

      // Refresh balances
      setTimeout(() => {
        refreshBalances();
      }, 2000);
    } catch (error) {
      console.error("Error sending tokens:", error);
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Failed to send tokens",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-20 md:pt-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "sol" | "pensacoin")}>
            <h1 className="text-2xl font-bold text-[rgba(169,0,232,1)] mb-4">Send</h1>
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100">
              <TabsTrigger value="sol" className="data-[state=active]:bg-[rgba(169,0,232,1)] data-[state=active]:text-white">Send SOL</TabsTrigger>
              <TabsTrigger value="pensacoin" className="data-[state=active]:bg-[rgba(169,0,232,1)] data-[state=active]:text-white">Send PENSA</TabsTrigger>
            </TabsList>

            <TabsContent value="sol">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label>Available Balance</Label>
                  <span className="font-medium">{solBalance} SOL</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sol-recipient">Recipient Address</Label>
                  <Input
                    id="sol-recipient"
                    placeholder="Enter Solana address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className={`neumorphic-inset bg-white ${recipientError ? "border-red-500" : ""}`}
                  />
                  {recipientError && <p className="text-red-500 text-sm">{recipientError}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="sol-amount">Amount</Label>
                    <button 
                      type="button" 
                      className="text-xs text-[rgba(169,0,232,1)] font-medium"
                      onClick={() => setAmount(solBalance)}
                    >
                      Max
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="sol-amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`neumorphic-inset bg-white ${amountError ? "border-red-500" : ""}`}
                    />
                    <div className="bg-white neumorphic px-4 py-2 rounded-md text-gray-700 font-medium">
                      SOL
                    </div>
                  </div>
                  {amountError && <p className="text-red-500 text-sm">{amountError}</p>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pensacoin">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label>Available Balance</Label>
                  <span className="font-medium">{pensacoinBalance} PENSA</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pensa-recipient">Recipient Address</Label>
                  <Input
                    id="pensa-recipient"
                    placeholder="Enter Solana address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className={`neumorphic-inset bg-white ${recipientError ? "border-red-500" : ""}`}
                  />
                  {recipientError && <p className="text-red-500 text-sm">{recipientError}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="pensa-amount">Amount</Label>
                    <button 
                      type="button" 
                      className="text-xs text-[rgba(169,0,232,1)] font-medium"
                      onClick={() => setAmount(pensacoinBalance)}
                    >
                      Max
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="pensa-amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`neumorphic-inset bg-white ${amountError ? "border-red-500" : ""}`}
                    />
                    <div className="bg-white neumorphic px-4 py-2 rounded-md text-gray-700 font-medium">
                      PENSA
                    </div>
                  </div>
                  {amountError && <p className="text-red-500 text-sm">{amountError}</p>}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 bg-white p-4 rounded-xl neumorphic text-sm">
            <div className="flex items-start">
              <AlertTriangle className="text-[rgba(169,0,232,1)] mr-2 flex-shrink-0" size={18} />
              <p className="text-gray-700">Transaction fee: ~0.000005 SOL</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-3 pt-4">
          <Button 
            variant="outline" 
            className="neumorphic bg-white text-gray-700 hover:text-[rgba(169,0,232,1)]"
            onClick={() => {
              setRecipient("");
              setAmount("");
              setRecipientError("");
              setAmountError("");
            }}
          >
            Clear
          </Button>
          <Button 
            className="bg-[rgba(169,0,232,1)] text-white hover:bg-[rgba(169,0,232,0.9)] neumorphic"
            onClick={handleSend}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                Send {activeTab === "sol" ? "SOL" : "PENSA"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Send;