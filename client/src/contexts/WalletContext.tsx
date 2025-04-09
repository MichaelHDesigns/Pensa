import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as solanaWeb3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import { useToast } from "@/hooks/use-toast";
import { 
  createNewWallet, 
  importWalletFromMnemonic, 
  importWalletFromPrivateKey,
  getBalance,
  getTokenBalance,
  PENSACOIN_MINT_ADDRESS,
  updateNetwork,
  SOLANA_MAINNET,
  SOLANA_DEVNET,
  SOLANA_TESTNET
} from "@/lib/solana";

// Type for stored wallet information
interface StoredWallet {
  privateKey: string; // Stringified JSON of Uint8Array
  name: string;
  id: string;
}

// Type for currency support
type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY" | "CNY" | "KRW";

interface WalletContextType {
  wallet: solanaWeb3.Keypair | null;
  isInitializing: boolean;
  publicKey: string | null;
  solBalance: string;
  pensacoinBalance: string;
  solValueUsd: string;
  pensacoinValueUsd: string;
  solPrice: number;
  pensaPrice: number;
  walletList: StoredWallet[];
  activeWalletId: string | null;
  currency: CurrencyCode;
  networkType: "mainnet" | "devnet" | "testnet";
  createWallet: (name: string) => Promise<solanaWeb3.Keypair>;
  importFromMnemonic: (mnemonic: string, name: string) => Promise<solanaWeb3.Keypair>;
  importFromPrivateKey: (privateKey: string, name: string) => Promise<solanaWeb3.Keypair>;
  switchWallet: (walletId: string) => Promise<void>;
  setCurrency: (currency: CurrencyCode) => void;
  setNetwork: (type: "mainnet" | "devnet" | "testnet") => void;
  disconnect: () => void;
  removeWallet: () => void;
  refreshBalances: () => Promise<void>;
  shortenAddress: (address: string) => string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [wallet, setWallet] = useState<solanaWeb3.Keypair | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [solBalance, setSolBalance] = useState("0");
  const [pensacoinBalance, setPensacoinBalance] = useState("0");
  const [walletList, setWalletList] = useState<StoredWallet[]>([]);
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => 
    (localStorage.getItem("currency") as CurrencyCode) || "USD"
  );
  const [networkType, setNetworkType] = useState<"mainnet" | "devnet" | "testnet">(() => {
    const savedNetwork = localStorage.getItem("networkType");
    // Convert any custom network settings to mainnet
    return (savedNetwork === "mainnet" || savedNetwork === "devnet" || savedNetwork === "testnet") 
      ? (savedNetwork as "mainnet" | "devnet" | "testnet") 
      : "mainnet";
  });
  
  // Fetch real-time prices
  const [solPrice, setSolPrice] = useState(0);
  const [pensaPrice, setPensaPrice] = useState(0);

  // Fetch prices on component mount and every 30 seconds
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Get SOL price from CoinGecko
        const solResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const solData = await solResponse.json();
        setSolPrice(solData.solana.usd);

        // Get PENSA price from GeckoTerminal
        const pensaResponse = await fetch('https://api.geckoterminal.com/api/v2/networks/solana/pools/2fdrJjBrx2jXCqVF2zTCeFnVmy58YtnrYYhskXXgti6b');
        const pensaData = await pensaResponse.json();
        setPensaPrice(parseFloat(pensaData.data.attributes.base_token_price_usd));
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Calculate USD values - using exact values without rounding
  const solValueUsd = `$${(parseFloat(solBalance) * solPrice).toFixed(8)}`;
  const pensacoinValueUsd = `$${(parseFloat(pensacoinBalance) * pensaPrice).toFixed(8)}`;

  // Initialize wallet from localStorage if available
  useEffect(() => {
    const initializeWallets = async () => {
      try {
        // Load wallet list
        const savedWalletListStr = localStorage.getItem("walletList");
        const savedWallets: StoredWallet[] = savedWalletListStr 
          ? JSON.parse(savedWalletListStr) 
          : [];
        
        setWalletList(savedWallets);
        
        // Get the active wallet ID
        const activeId = localStorage.getItem("activeWalletId");
        
        if (activeId && savedWallets.length > 0) {
          const activeWallet = savedWallets.find(w => w.id === activeId);
          
          if (activeWallet) {
            setActiveWalletId(activeId);
            const privateKeyBytes = new Uint8Array(JSON.parse(activeWallet.privateKey));
            const importedWallet = solanaWeb3.Keypair.fromSecretKey(privateKeyBytes);
            setWallet(importedWallet);
            
            // Fetch initial balances
            await fetchBalances(importedWallet.publicKey);
          }
        }
      } catch (error) {
        console.error("Failed to initialize wallets:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeWallets();
  }, []);

  // Fetch SOL and Pensacoin balances
  const fetchBalances = async (publicKey: solanaWeb3.PublicKey) => {
    try {
      // Get SOL balance
      const solBal = await getBalance(publicKey);
      setSolBalance(solBal);
      
      // Get Pensacoin balance
      const pensaBal = await getTokenBalance(publicKey, PENSACOIN_MINT_ADDRESS);
      setPensacoinBalance(pensaBal);
    } catch (error) {
      console.error("Error fetching balances:", error);
      toast({
        title: "Failed to fetch balances",
        description: "Unable to get your latest wallet balances",
        variant: "destructive",
      });
    }
  };

  // Generate a unique ID for wallets
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Save wallet list to localStorage
  const saveWalletList = (list: StoredWallet[]) => {
    localStorage.setItem("walletList", JSON.stringify(list));
  };

  // Create a new wallet
  const createWallet = async (name: string): Promise<solanaWeb3.Keypair> => {
    try {
      const newWallet = await createNewWallet();
      
      // Create a wallet record
      const walletId = generateId();
      const walletRecord: StoredWallet = {
        privateKey: JSON.stringify(Array.from(newWallet.secretKey)),
        name: name,
        id: walletId
      };
      
      // Add to wallet list
      const updatedList = [...walletList, walletRecord];
      setWalletList(updatedList);
      saveWalletList(updatedList);
      
      // Set as active wallet
      setWallet(newWallet);
      setActiveWalletId(walletId);
      localStorage.setItem("activeWalletId", walletId);
      
      await fetchBalances(newWallet.publicKey);
      
      toast({
        title: "Wallet Created",
        description: `Created new wallet: ${name}`,
      });
      
      return newWallet;
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast({
        title: "Wallet Creation Failed",
        description: "Unable to create a new wallet",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Import wallet from mnemonic
  const importFromMnemonic = async (mnemonic: string, name: string): Promise<solanaWeb3.Keypair> => {
    try {
      const importedWallet = await importWalletFromMnemonic(mnemonic);
      
      // Check if wallet already exists
      const publicKeyStr = importedWallet.publicKey.toString();
      const existingWallet = walletList.find(w => {
        try {
          const keypair = solanaWeb3.Keypair.fromSecretKey(
            new Uint8Array(JSON.parse(w.privateKey))
          );
          return keypair.publicKey.toString() === publicKeyStr;
        } catch {
          return false;
        }
      });
      
      if (existingWallet) {
        // If wallet exists, just activate it
        setWallet(importedWallet);
        setActiveWalletId(existingWallet.id);
        localStorage.setItem("activeWalletId", existingWallet.id);
        
        toast({
          title: "Wallet Already Exists",
          description: "This wallet is already in your wallet list and has been activated.",
        });
      } else {
        // Create a new wallet record
        const walletId = generateId();
        const walletRecord: StoredWallet = {
          privateKey: JSON.stringify(Array.from(importedWallet.secretKey)),
          name: name,
          id: walletId
        };
        
        // Add to wallet list
        const updatedList = [...walletList, walletRecord];
        setWalletList(updatedList);
        saveWalletList(updatedList);
        
        // Set as active wallet
        setWallet(importedWallet);
        setActiveWalletId(walletId);
        localStorage.setItem("activeWalletId", walletId);
        
        toast({
          title: "Wallet Imported",
          description: `Imported wallet: ${name}`,
        });
      }
      
      await fetchBalances(importedWallet.publicKey);
      return importedWallet;
    } catch (error) {
      console.error("Error importing wallet from mnemonic:", error);
      toast({
        title: "Import Failed",
        description: "Invalid mnemonic phrase",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Import wallet from private key
  const importFromPrivateKey = async (privateKey: string, name: string): Promise<solanaWeb3.Keypair> => {
    try {
      const importedWallet = await importWalletFromPrivateKey(privateKey);
      
      // Check if wallet already exists
      const publicKeyStr = importedWallet.publicKey.toString();
      const existingWallet = walletList.find(w => {
        try {
          const keypair = solanaWeb3.Keypair.fromSecretKey(
            new Uint8Array(JSON.parse(w.privateKey))
          );
          return keypair.publicKey.toString() === publicKeyStr;
        } catch {
          return false;
        }
      });
      
      if (existingWallet) {
        // If wallet exists, just activate it
        setWallet(importedWallet);
        setActiveWalletId(existingWallet.id);
        localStorage.setItem("activeWalletId", existingWallet.id);
        
        toast({
          title: "Wallet Already Exists",
          description: "This wallet is already in your wallet list and has been activated.",
        });
      } else {
        // Create a new wallet record
        const walletId = generateId();
        const walletRecord: StoredWallet = {
          privateKey: JSON.stringify(Array.from(importedWallet.secretKey)),
          name: name,
          id: walletId
        };
        
        // Add to wallet list
        const updatedList = [...walletList, walletRecord];
        setWalletList(updatedList);
        saveWalletList(updatedList);
        
        // Set as active wallet
        setWallet(importedWallet);
        setActiveWalletId(walletId);
        localStorage.setItem("activeWalletId", walletId);
        
        toast({
          title: "Wallet Imported",
          description: `Imported wallet: ${name}`,
        });
      }
      
      await fetchBalances(importedWallet.publicKey);
      return importedWallet;
    } catch (error) {
      console.error("Error importing wallet from private key:", error);
      toast({
        title: "Import Failed",
        description: "Invalid private key",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Switch to a different wallet
  const switchWallet = async (walletId: string): Promise<void> => {
    try {
      const targetWallet = walletList.find(w => w.id === walletId);
      
      if (!targetWallet) {
        throw new Error("Wallet not found");
      }
      
      // Load wallet keypair
      const privateKeyBytes = new Uint8Array(JSON.parse(targetWallet.privateKey));
      const importedWallet = solanaWeb3.Keypair.fromSecretKey(privateKeyBytes);
      
      // Set as active wallet
      setWallet(importedWallet);
      setActiveWalletId(walletId);
      localStorage.setItem("activeWalletId", walletId);
      
      // Fetch balances for the new wallet
      await fetchBalances(importedWallet.publicKey);
      
      toast({
        title: "Wallet Switched",
        description: `Switched to wallet: ${targetWallet.name}`,
      });
    } catch (error) {
      console.error("Error switching wallet:", error);
      toast({
        title: "Switch Failed",
        description: "Failed to switch to the selected wallet",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Set preferred currency
  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("currency", newCurrency);
    
    toast({
      title: "Currency Updated",
      description: `Currency preference set to ${newCurrency}`,
    });
  };

  // Set network type
  const setNetwork = (type: "mainnet" | "devnet" | "testnet") => {
    setNetworkType(type);
    localStorage.setItem("networkType", type);
    
    let rpcUrl = "";
    
    switch (type) {
      case "mainnet":
        rpcUrl = SOLANA_MAINNET;
        break;
      case "devnet":
        rpcUrl = SOLANA_DEVNET;
        break;
      case "testnet":
        rpcUrl = SOLANA_TESTNET;
        break;
    }
    
    // Update network connection
    updateNetwork(rpcUrl);
    
    toast({
      title: "Network Updated",
      description: `Switched to ${type}`,
    });
    
    // Refresh balances if a wallet is connected
    if (wallet) {
      refreshBalances();
    }
  };

  // Disconnect wallet (temporarily log out)
  const disconnect = () => {
    setWallet(null);
    setSolBalance("0");
    setPensacoinBalance("0");
    // Don't remove from storage - just log out for the session
    localStorage.removeItem("activeWalletId");
    setActiveWalletId(null);
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been temporarily disconnected for this session",
    });
  };
  
  // Remove wallet completely
  const removeWallet = () => {
    if (!activeWalletId) return;
    
    // Remove from wallet list
    const updatedList = walletList.filter(w => w.id !== activeWalletId);
    setWalletList(updatedList);
    saveWalletList(updatedList);
    
    // Clear active wallet
    setWallet(null);
    setActiveWalletId(null);
    setSolBalance("0");
    setPensacoinBalance("0");
    localStorage.removeItem("activeWalletId");
    
    toast({
      title: "Wallet Removed",
      description: "The wallet has been permanently removed from this device",
      variant: "destructive"
    });
  };

  // Refresh balances with better error handling and retries
  const refreshBalances = async () => {
    if (!wallet) return;
    
    console.log("Starting balance refresh...");
    
    // Try up to 3 times with increasing delay
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        // Add a small delay to allow blockchain state to propagate
        if (attempt > 0) {
          const delay = attempt * 1000; // 1s, 2s delay for retries
          console.log(`Retry ${attempt}: waiting ${delay}ms before refresh`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        // Get SOL balance
        const solBalanceResult = await getBalance(wallet.publicKey);
        console.log(`SOL balance (attempt ${attempt+1}): ${solBalanceResult}`);
        setSolBalance(solBalanceResult);
        
        try {
          // Get Pensacoin balance (in separate try/catch to not fail everything)
          const pensaBalanceResult = await getTokenBalance(
            wallet.publicKey,
            PENSACOIN_MINT_ADDRESS
          );
          console.log(`PENSA balance (attempt ${attempt+1}): ${pensaBalanceResult}`);
          setPensacoinBalance(pensaBalanceResult);
        } catch (pensaError) {
          console.warn("Failed to fetch PENSA balance:", pensaError);
          if (attempt === 2) { // Last attempt
            console.error("All PENSA balance fetch attempts failed");
          } else {
            continue; // Try again
          }
        }
        
        // Calculate USD values and update state
        const solValueInUsd = parseFloat(solBalanceResult) * solPrice;
        setSolBalance(solBalanceResult);
        setSolValueUsd(solValueInUsd.toFixed(2));
        
        // Only update PENSA USD value if we have a balance
        if (pensaBalanceResult !== "0") {
          const pensaValueInUsd = parseFloat(pensaBalanceResult) * pensaPrice;
          setPensacoinBalance(pensaBalanceResult);
          setPensacoinValueUsd(pensaValueInUsd.toFixed(2));
        }
        
        console.log("Balance refresh successful");
        return; // Success, exit the retry loop
      } catch (error) {
        console.warn(`Balance fetch attempt ${attempt+1} failed:`, error);
        if (attempt === 2) { // Last attempt
          console.error("All balance refresh attempts failed");
        }
      }
    }
  };

  // Utility to shorten addresses for display
  const shortenAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-5)}`;
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        isInitializing,
        publicKey: wallet ? wallet.publicKey.toString() : null,
        solBalance,
        pensacoinBalance,
        solValueUsd,
        pensacoinValueUsd,
        solPrice,
        pensaPrice,
        walletList,
        activeWalletId,
        currency,
        networkType,
        createWallet,
        importFromMnemonic,
        importFromPrivateKey,
        switchWallet,
        setCurrency,
        setNetwork,
        disconnect,
        removeWallet,
        refreshBalances,
        shortenAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
