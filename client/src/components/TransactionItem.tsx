import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";

export type TransactionType = 'receive' | 'send' | 'swap';

interface TransactionItemProps {
  type: TransactionType;
  title: string;
  date: string;
  amount: string;
  value?: string;
  fromAddress?: string;
  toAddress?: string;
  signature: string;
  confirmations?: number;
  swapDetails?: {
    fromToken: string;
    fromAmount: string;
    toToken: string;
    toAmount: string;
    rate: string;
  };
  compact?: boolean;
}

const TransactionItem = ({
  type,
  title,
  date,
  amount,
  value,
  fromAddress,
  toAddress,
  signature,
  confirmations,
  swapDetails,
  compact = false
}: TransactionItemProps) => {
  const { toast } = useToast();
  const { currency } = useWallet();
  const [expanded, setExpanded] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Helper functions for currency formatting
  // Currency conversion rates relative to USD
  const exchangeRates: Record<string, number> = {
    USD: 1,
    EUR: 0.92, // Euro
    GBP: 0.78, // British Pound
    JPY: 153.5, // Japanese Yen
    CNY: 7.22, // Chinese Yuan
    KRW: 1370.0, // Korean Won
  };
  
  // Get the currency symbol
  const getCurrencySymbol = (curr: string): string => {
    switch (curr) {
      case "USD": return "$";
      case "EUR": return "€";
      case "GBP": return "£";
      case "JPY": return "¥";
      case "CNY": return "¥";
      case "KRW": return "₩";
      default: return "$";
    }
  };
  
  // Format value based on selected currency
  const formatValueInCurrency = (valueUsd: string | undefined): string | undefined => {
    if (!valueUsd) return undefined;
    
    // Remove $ if present
    const numericValue = parseFloat(valueUsd.replace('$', ''));
    
    // Apply exchange rate
    const convertedValue = numericValue * (exchangeRates[currency] || 1);
    
    // Format based on currency
    let formattedValue = convertedValue.toFixed(2);
    if (currency === "JPY" || currency === "KRW") {
      formattedValue = Math.round(convertedValue).toString();
    }
    
    return `${getCurrencySymbol(currency)}${formattedValue}`;
  };
  
  // Format the transaction value in the selected currency
  const formattedValue = formatValueInCurrency(value);

  // Copy text to clipboard
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

  // Get icon and color classes based on transaction type
  const getTypeData = (type: TransactionType) => {
    // Updated to use black and white for all transaction types without circular indicators
    switch (type) {
      case 'receive':
        return {
          icon: 'arrow-down',
          bgColor: 'bg-white',
          textColor: 'text-black',
          borderColor: 'border-white'
        };
      case 'send':
        return {
          icon: 'arrow-up',
          bgColor: 'bg-white',
          textColor: 'text-black',
          borderColor: 'border-white'
        };
      case 'swap':
        return {
          icon: 'exchange-alt',
          bgColor: 'bg-white',
          textColor: 'text-black',
          borderColor: 'border-white'
        };
      default:
        return {
          icon: 'circle',
          bgColor: 'bg-white',
          textColor: 'text-black',
          borderColor: 'border-white'
        };
    }
  };

  const typeData = getTypeData(type);

  return (
    <div className={`py-4 ${compact ? 'px-2' : 'px-4'}`}>
      <div 
        className="flex items-center cursor-pointer" 
        onClick={() => {
          if (compact) {
            // Open Solscan for compact view on click
            window.open(`https://solscan.io/tx/${signature}`, '_blank');
          } else {
            setExpanded(!expanded);
          }
        }}
      >
        {/* Transaction info */}
        <div className="flex-grow min-w-0">
          <div className="flex justify-between">
            <h4 className="font-medium text-black truncate">{title}</h4>
            <span className="font-medium text-black">
              {amount}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <div className="flex flex-col">
              <span className="text-gray-600">{date}</span>
              <span className="text-xs text-gray-500 font-mono truncate">{signature.slice(0, 12)}...</span>
            </div>
            {formattedValue && <span className="text-gray-600 self-start">{formattedValue}</span>}
          </div>
        </div>
        
        {compact ? (
          <button className="ml-2 flex-shrink-0 text-[rgba(169,0,232,1)] flex items-center opacity-75 hover:opacity-100 transition-opacity">
            <i className="fas fa-external-link-alt text-xs"></i>
          </button>
        ) : (
          <div className="ml-3 flex-shrink-0">
            <i className={`fas fa-chevron-${expanded ? 'up' : 'down'} text-gray-500`}></i>
          </div>
        )}
      </div>
      
      {(!compact && expanded) && (
        <div className={`mt-4 pt-4 border-t border-gray-200 text-sm text-black space-y-2 neumorphic-inset p-4 rounded-lg`}>
          {/* Transaction details */}
          {fromAddress && (
            <div className="flex justify-between">
              <span className="text-[rgba(169,0,232,1)] font-medium">From:</span>
              <div className="flex items-center">
                <span className="text-black">{fromAddress}</span>
                <button 
                  className={`ml-2 ${copiedText === 'From Address' ? 'text-green-500' : 'text-gray-500'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(fromAddress, 'From Address');
                  }}
                >
                  <i className={`fas ${copiedText === 'From Address' ? 'fa-check' : 'fa-copy'}`}></i>
                </button>
              </div>
            </div>
          )}
          
          {toAddress && (
            <div className="flex justify-between">
              <span className="text-[rgba(169,0,232,1)] font-medium">To:</span>
              <div className="flex items-center">
                <span className="text-black">{toAddress}</span>
                <button 
                  className={`ml-2 ${copiedText === 'To Address' ? 'text-green-500' : 'text-gray-500'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(toAddress, 'To Address');
                  }}
                >
                  <i className={`fas ${copiedText === 'To Address' ? 'fa-check' : 'fa-copy'}`}></i>
                </button>
              </div>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-[rgba(169,0,232,1)] font-medium">Transaction ID:</span>
            <div className="flex items-center">
              <span className="font-mono text-xs text-black">{signature}</span>
              <button 
                className={`ml-2 ${copiedText === 'Transaction ID' ? 'text-green-500' : 'text-gray-500'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(signature, 'Transaction ID');
                }}
              >
                <i className={`fas ${copiedText === 'Transaction ID' ? 'fa-check' : 'fa-copy'}`}></i>
              </button>
            </div>
          </div>
          
          {confirmations !== undefined && (
            <div className="flex justify-between">
              <span className="text-[rgba(169,0,232,1)] font-medium">Confirmations:</span>
              <span className="text-black">{confirmations}</span>
            </div>
          )}
          
          {/* Swap details */}
          {type === 'swap' && swapDetails && (
            <div className="mt-4 pt-3 border-t border-dashed border-gray-200">
              <div className="text-[rgba(169,0,232,1)] font-medium mb-2">Swap Details</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-700">From:</span>
                  <span className="text-black">{swapDetails.fromAmount} {swapDetails.fromToken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">To:</span>
                  <span className="text-black">{swapDetails.toAmount} {swapDetails.toToken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Rate:</span>
                  <span className="text-black">{swapDetails.rate}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-2 mt-3">
            <Button 
              variant="outline"
              size="sm"
              className="text-sm bg-[rgba(169,0,232,1)] hover:bg-[rgba(169,0,232,0.9)] text-white border-none"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://solscan.io/tx/${signature}`, '_blank');
              }}
            >
              View in Solscan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionItem;