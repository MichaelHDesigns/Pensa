import { Link } from "wouter";
import { useWallet } from "@/contexts/WalletContext";

interface SidebarProps {
  currentPath: string;
}

const Sidebar = ({ currentPath }: SidebarProps) => {
  const { wallet, shortenAddress, disconnect } = useWallet();

  // Menu items
  const menuItems = [
    { icon: "home", label: "Dashboard", path: "wallet" },
    { icon: "wallet", label: "Wallet", path: "wallet" },
    { icon: "exchange-alt", label: "Swap", path: "swap" },
    { icon: "history", label: "Transactions", path: "transactions" },
    { icon: "cog", label: "Settings", path: "settings" }
  ];

  return (
    <div className="hidden md:flex md:w-64 flex-shrink-0 bg-white border-r border-gray-200 flex-col shadow-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <div className="h-10 w-10 rounded-full bg-[rgba(169,0,232,1)] flex items-center justify-center text-white mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="font-semibold text-xl text-[rgba(169,0,232,1)]">PensaSwap</h1>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link 
            key={item.path}
            href={`/${item.path}`}
            className={`flex items-center p-3 rounded-lg transition-colors ${
              currentPath === item.path 
                ? "text-white font-medium bg-[rgba(169,0,232,1)] neumorphic" 
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <i className={`fas fa-${item.icon} w-6`}></i>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      
      {wallet && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-[rgba(169,0,232,1)] flex items-center justify-center mr-2">
                <i className="fas fa-user text-white"></i>
              </div>
              <div className="text-sm truncate w-36 text-gray-700">
                {shortenAddress(wallet.publicKey.toString())}
              </div>
            </div>
            <button 
              className="text-gray-600 hover:text-[rgba(169,0,232,1)]"
              onClick={disconnect}
              title="Disconnect wallet"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
