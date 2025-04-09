import { Link } from "wouter";

interface MobileNavigationProps {
  currentPath: string;
}

const MobileNavigation = ({ currentPath }: MobileNavigationProps) => {
  // Mobile navigation items
  const navItems = [
    { icon: "home", label: "Dashboard", path: "wallet" },
    { icon: "wallet", label: "Wallet", path: "wallet" },
    { icon: "exchange-alt", label: "Swap", path: "swap" },
    { icon: "history", label: "History", path: "transactions" }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10 neumorphic-inset">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link 
            key={item.path}
            href={`/${item.path}`}
            className="flex flex-col items-center py-3 px-2"
          >
            <i className={`fas fa-${item.icon} ${
              currentPath === item.path 
                ? "text-[rgba(169,0,232,1)]" 
                : "text-gray-500"
            }`}></i>
            <span className={`text-xs mt-1 ${
              currentPath === item.path 
                ? "text-[rgba(169,0,232,1)] font-medium" 
                : "text-gray-500"
            }`}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
