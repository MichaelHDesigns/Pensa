import { useState, useEffect, useContext } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";
import { getTokenMetadata, PENSACOIN_MINT_ADDRESS } from "@/lib/solana";
import pensacoinLogo from "../assets/pensacoin-logo.png";
import { Copy, Wallet, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";


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
  walletId 
}: TokenCardProps) => {
  const { toast } = useToast();
  const { currency, setCurrency, networkType, switchWallet, walletList, activeWalletId, shortenAddress } = useWallet(); 
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showInNative, setShowInNative] = useState(false);
  const [showWalletList, setShowWalletList] = useState(false);
  const [tokenMetadata, setTokenMetadata] = useState<any>(null);
  const { theme, toggleTheme } = useTheme(); // Added theme context

  useEffect(() => {
    if (type === "pensacoin") {
      const fetchMetadata = async () => {
        try {
          const metadata = await getTokenMetadata(PENSACOIN_MINT_ADDRESS.toString());
          if (metadata) {
            setTokenMetadata(metadata);
          }
        } catch (error) {
          console.error("Error fetching token metadata:", error);
        }
      };

      fetchMetadata();
    }
  }, [type]);

  const formattedNetworkType = networkType.charAt(0).toUpperCase() + networkType.slice(1);
  const solBalanceNum = parseFloat(balance);
  const pensaBalanceNum = pensaBalance ? parseFloat(pensaBalance) : 0;

  const formatCurrencyValue = (value: number): string => {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatTokenBalance = (value: string): string => {
    const num = parseFloat(value);
    return num.toLocaleString('en-US', { minimumFractionDigits: 9, maximumFractionDigits: 9 });
  };

  const getCurrencySymbol = () => "$";
  const solValueUSD = solBalanceNum * solPrice;
  const pensaValueUSD = pensaBalanceNum * pensaPrice;
  const pensaValueInSOL = (pensaBalanceNum * pensaPrice / solPrice).toFixed(10);
  const totalValueUSD = solBalanceNum * solPrice + pensaBalanceNum * pensaPrice;
  const totalValueSOL = (solBalanceNum + pensaBalanceNum * pensaPrice / solPrice).toFixed(10);
  const currencySymbol = getCurrencySymbol(currency);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedText(label);
        toast({
          title: "Copied!",
          description: `${label} copied to clipboard`,
          duration: 2000,
        });
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
    <div className={`bg-white ${theme === 'dark' ? 'dark:bg-gray-800' : ''} rounded-xl overflow-hidden neumorphic`}> {/* Added dark mode class */}
      <div className={`bg-white ${theme === 'dark' ? 'dark:bg-gray-800' : ''} text-black dark:text-white p-5 border-b border-gray-100 dark:border-gray-700`}> {/* Added dark mode class */}
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
              <h3 className={`font-medium text-[rgba(169,0,232,1)] ${theme === 'dark' ? 'dark:text-white' : ''}`}>{name}</h3> {/* Added dark mode class */}
              <p className={`text-xs text-gray-600 ${theme === 'dark' ? 'dark:text-gray-400' : ''}`}>{symbol}</p> {/* Added dark mode class */}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-1 px-2 rounded-md ${theme === 'dark' ? 'dark:text-white' : ''}`}> {/* Added dark mode class */}
              <Label htmlFor="currency-toggle" className={`text-xs text-gray-700 ${theme === 'dark' ? 'dark:text-white' : ''}`}> {/* Added dark mode class */}
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
                className={`bg-[rgba(169,0,232,1)] hover:bg-[rgba(169,0,232,0.9)] transition-colors text-white px-3 py-1 rounded-lg text-sm flex items-center ${theme === 'dark' ? 'dark:bg-purple-700 dark:text-white' : ''}`}
              > {/* Added dark mode class */}
                <Wallet className="h-4 w-4"/>
              </button>

              {showWalletList && walletList.length > 1 && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowWalletList(false)}
                  />
                  <div className={`absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50`}> {/* Added dark mode class */}
                    {walletList.map((walletItem) => (
                      <button
                        key={walletItem.id}
                        onClick={() => {
                          switchWallet(walletItem.id);
                          setShowWalletList(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between ${
                          activeWalletId === walletItem.id ? 'bg-gray-50 dark:bg-gray-700' : ''
                        }`}
                      >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col overflow-hidden">
                          <span className={`text-sm font-medium truncate ${theme === 'dark' ? 'dark:text-white' : ''}`}>{walletItem.name}</span> {/* Added dark mode class */}
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
            <div className="flex gap-2">
              <ThemeToggleButton />
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className={`text-3xl font-bold text-black dark:text-white`}> {/* Added dark mode class */}
            {!showInNative 
              ? `${currencySymbol}${formatCurrencyValue(solValueUSD)}` 
              : `${balance} SOL`}
          </div>
          <div className={`text-sm text-gray-600 mt-1 dark:text-gray-400`}> {/* Added dark mode class */}
            {!showInNative 
              ? `Total value: ${currencySymbol}${formatCurrencyValue(totalValueUSD)}` 
              : `${currencySymbol}${formatCurrencyValue(solValueUSD)}`}
          </div>
        </div>
      </div>
      <div className={`p-4 ${theme === 'dark' ? 'dark:bg-gray-800' : ''}`}> {/* Added dark mode class */}
        <div className={`flex justify-between text-sm mb-4 bg-white dark:bg-gray-700 rounded-lg p-3 neumorphic-inset`}> {/* Added dark mode class */}
          <div>
            <span className={`text-[rgba(169,0,232,1)] font-medium ${theme === 'dark' ? 'dark:text-white' : ''}`}>Wallet Address</span> {/* Added dark mode class */}
            <div className={`flex items-center mt-1 ${theme === 'dark' ? 'dark:text-white' : ''}`}> {/* Added dark mode class */}
              <span className={`text-black dark:text-white font-medium truncate w-28`}>{shortenAddress(address)}</span>
              <button 
                className={`ml-2 ${copiedText === "Address" ? "text-green-500" : "text-gray-600"} ${theme === 'dark' ? 'dark:text-white' : ''}`}
                onClick={() => copyToClipboard(address, "Address")}
              >
                <Copy className={`h-4 w-4 ${copiedText === "Address" ? "text-green-500" : "text-gray-600"} ${theme === 'dark' ? 'dark:text-white' : ''}`} />
              </button>
            </div>
          </div>
          <div>
            <span className={`text-[rgba(169,0,232,1)] font-medium ${theme === 'dark' ? 'dark:text-white' : ''}`}>Network</span> {/* Added dark mode class */}
            <div className={`flex items-center mt-1 ${theme === 'dark' ? 'dark:text-white' : ''}`}> {/* Added dark mode class */}
              <span className={`text-black dark:text-white font-medium`}>{formattedNetworkType}</span>
              <span className="ml-2 w-2 h-2 rounded-full bg-green-500"></span>
            </div>
          </div>
        </div>

        {pensaBalance && (
          <div className={`border-t border-gray-100 dark:border-gray-700 pt-4`}> {/* Added dark mode class */}
            <h4 className={`text-sm font-medium mb-3 text-[rgba(169,0,232,1)] ${theme === 'dark' ? 'dark:text-white' : ''}`}>Tokens</h4> {/* Added dark mode class */}
            <div className={`bg-white dark:bg-gray-700 rounded-lg p-3 flex items-center justify-between neumorphic-inset`}> {/* Added dark mode class */}
              <div className="flex items-center">
                <img 
                  src={pensacoinLogo}
                  alt="Pensacoin" 
                  className="h-8 w-8 mr-3 rounded-full shadow-sm"
                />
                <div>
                  <div className={`font-medium text-[rgba(169,0,232,1)] ${theme === 'dark' ? 'dark:text-white' : ''}`}>{tokenMetadata?.name || "Pensacoin"}</div> {/* Added dark mode class */}
                  <div className={`text-sm text-black dark:text-white`}>{formatTokenBalance(pensaBalance)} {tokenMetadata?.symbol || "PENSA"}</div> {/* Added dark mode class */}
                </div>
              </div>
              <div className={`text-right ${theme === 'dark' ? 'dark:text-white' : ''}`}> {/* Added dark mode class */}
                <div className={`text-sm text-black dark:text-white font-medium`}> {/* Added dark mode class */}
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

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button variant="ghost" size="sm" onClick={toggleTheme}>
      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
    </Button>
  );
};

export default TokenCard;