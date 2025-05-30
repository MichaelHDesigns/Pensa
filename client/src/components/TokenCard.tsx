import { useState, useEffect, useContext } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";
import { getTokenMetadata, PENSACOIN_MINT_ADDRESS } from "@/lib/solana";
import pensacoinLogo from "../assets/pensacoin-logo.png";
import { Copy, Wallet } from "lucide-react"; // Added import for Wallet icon

interface TokenCardProps {
  type: "sol" | "pensacoin";
  symbol: string;
  name: string;
  balance: string;
  value: string;
  address: string;
  pensaBalance?: string;
  pensaValue?: string;
  solPrice?: number;
  pensaPrice?: number;
}

const TokenCard = ({ 
  type, 
  symbol, 
  name, 
  balance, 
  value, 
  address, 
  pensaBalance, 
  pensaValue,
  solPrice = 70, 
  pensaPrice = 0.10,
  walletId // Added walletId
}: TokenCardProps) => {
  const { toast } = useToast();
  const { currency, setCurrency, networkType, switchWallet, walletList, activeWalletId, shortenAddress } = useWallet(); // Assuming switchWallet function exists
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showInNative, setShowInNative] = useState(false);
  const [showWalletList, setShowWalletList] = useState(false);
  const [tokenMetadata, setTokenMetadata] = useState<any>(null);

  // Fetch token metadata for Pensacoin
  useEffect(() => {
    if (type === "pensacoin") {
      const fetchMetadata = async () => {
        try {
          const metadata = await getTokenMetadata(PENSACOIN_MINT_ADDRESS.toString());
          if (metadata) {
            console.log("Fetched token metadata:", JSON.stringify(metadata, null, 2));
            setTokenMetadata(metadata);
          }
        } catch (error) {
          console.error("Error fetching token metadata:", error);
        }
      };

      fetchMetadata();
    }
  }, [type]);

  // Format network type for display
  const formattedNetworkType = networkType.charAt(0).toUpperCase() + networkType.slice(1);

  // Extract numeric values from balance strings - preserve exact values
  const solBalanceNum = parseFloat(balance);
  const pensaBalanceNum = pensaBalance ? parseFloat(pensaBalance) : 0;

  // Format currency value with commas
  const formatCurrencyValue = (value: number): string => {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Format token balance with commas
  const formatTokenBalance = (value: string): string => {
    const num = parseFloat(value);
    return num.toLocaleString('en-US', { minimumFractionDigits: 9, maximumFractionDigits: 9 });
  };

  const getCurrencySymbol = () => "$";

  // Calculate values in USD and SOL - preserve exact values
  const solValueUSD = solBalanceNum * solPrice;
  const pensaValueUSD = pensaBalanceNum * pensaPrice;
  const pensaValueInSOL = (pensaBalanceNum * pensaPrice / solPrice).toFixed(10);

  // Total portfolio value - preserve exact values
  const totalValueUSD = solBalanceNum * solPrice + pensaBalanceNum * pensaPrice;
  const totalValueSOL = (solBalanceNum + pensaBalanceNum * pensaPrice / solPrice).toFixed(10);

  // Current currency symbol
  const currencySymbol = getCurrencySymbol(currency);

  // Copy address to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedText(label);
        toast({
          title: "Copied!",
          description: `${label} copied to clipboard`,
          duration: 2000,
        });

        // Reset the copied state after 2 seconds
        setTimeout(() => setCopiedText(null), 2000);
      })
      .catch(err => {
        toast({
          title: "Failed to copy",
          description: "Could not copy to clipboard",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden neumorphic">
      <div className="bg-white text-black p-5 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {type === "sol" ? (
              <img 
                src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png" 
                alt="Solana" 
                className="h-10 w-10 mr-3 rounded-full shadow-sm"
              />
            ) : (
              <img 
                src={pensacoinLogo}
                alt="Pensacoin" 
                className="h-10 w-10 mr-3 rounded-full shadow-sm"
              />
            )}
            <div>
              <h3 className="font-medium text-[rgba(169,0,232,1)]">{name}</h3>
              <p className="text-xs text-gray-600">{symbol}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2 bg-gray-100 p-1 px-2 rounded-md">
              <Label htmlFor="currency-toggle" className="text-xs text-gray-700">
                {!showInNative ? currency : 'SOL'}
              </Label>
              <Switch 
                id="currency-toggle" 
                checked={showInNative} 
                onCheckedChange={() => setShowInNative(!showInNative)}
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowWalletList(prev => !prev)} 
                className="bg-[rgba(169,0,232,1)] hover:bg-[rgba(169,0,232,0.9)] transition-colors text-white px-3 py-1 rounded-lg text-sm flex items-center"
              >
                <Wallet className="h-4 w-4"/>
              </button>

              {showWalletList && walletList.length > 1 && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowWalletList(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-50">
                    {walletList.map((walletItem) => (
                      <button
                        key={walletItem.id}
                        onClick={() => {
                          switchWallet(walletItem.id);
                          setShowWalletList(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                          activeWalletId === walletItem.id ? 'bg-gray-50' : ''
                        }`}
                      >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-medium truncate">{walletItem.name}</span>
                        </div>
                        {activeWalletId === walletItem.id && (
                          <div className="w-2 h-2 rounded-full bg-green-500 ml-2 flex-shrink-0"></div>
                        )}
                      </div>
                    </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <Link href="/send" className="bg-[rgba(169,0,232,1)] hover:bg-[rgba(169,0,232,0.9)] transition-colors text-white px-3 py-1 rounded-lg text-sm">
              <i className="fas fa-paper-plane mr-1"></i> Send
            </Link>
          </div>
        </div>
        <div className="mt-6">
          <div className="text-3xl font-bold text-black">
            {!showInNative 
              ? `${currencySymbol}${formatCurrencyValue(solValueUSD)}` 
              : `${balance} SOL`}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {!showInNative 
              ? `Total value: ${currencySymbol}${formatCurrencyValue(totalValueUSD)}` 
              : `${currencySymbol}${formatCurrencyValue(solValueUSD)}`}
          </div>
        </div>
      </div>
      <div className="p-4">
        {/* Wallet Address */}
        <div className="flex justify-between text-sm mb-4 bg-white rounded-lg p-3 neumorphic-inset">
          <div>
            <span className="text-[rgba(169,0,232,1)] font-medium">Wallet Address</span>
            <div className="flex items-center mt-1">
              <span className="text-black font-medium truncate w-28">{shortenAddress(address)}</span>
              <button 
                className={`ml-2 ${copiedText === "Address" ? "text-green-500" : "text-gray-600"}`}
                onClick={() => copyToClipboard(address, "Address")}
              >
                <Copy className={`h-4 w-4 ${copiedText === "Address" ? "text-green-500" : "text-gray-600"}`} />
              </button>
            </div>
          </div>
          <div>
            <span className="text-[rgba(169,0,232,1)] font-medium">Network</span>
            <div className="flex items-center mt-1">
              <span className="text-black font-medium">{formattedNetworkType}</span>
              <span className="ml-2 w-2 h-2 rounded-full bg-green-500"></span>
            </div>
          </div>
        </div>

        {/* Token Balances */}
        {pensaBalance && (
          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-medium mb-3 text-[rgba(169,0,232,1)]">Tokens</h4>
            <div className="bg-white rounded-lg p-3 flex items-center justify-between neumorphic-inset">
              <div className="flex items-center">
                <img 
                  src={pensacoinLogo}
                  alt="Pensacoin" 
                  className="h-8 w-8 mr-3 rounded-full shadow-sm"
                />
                <div>
                  <div className="font-medium text-[rgba(169,0,232,1)]">{tokenMetadata?.name || "Pensacoin"}</div>
                  <div className="text-sm text-black">{formatTokenBalance(pensaBalance)} {tokenMetadata?.symbol || "PENSA"}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-black font-medium">
                  {!showInNative
                    ? `${currencySymbol}${formatCurrencyValue(pensaValueUSD)}` 
                    : `${pensaValueInSOL} SOL`}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenCard;