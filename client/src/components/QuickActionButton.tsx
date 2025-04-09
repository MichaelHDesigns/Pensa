import { Link } from "wouter";
import { 
  QrCode, 
  Send, 
  ArrowLeftRight, 
  History, 
  Settings, 
  Wallet, 
  BarChart3,
  DollarSign,
  Landmark,
  PiggyBank
} from "lucide-react";
import { ReactNode } from "react";

interface QuickActionButtonProps {
  icon: string;
  label: string;
  path: string;
  color: string;
}

const QuickActionButton = ({ icon, label, path, color }: QuickActionButtonProps) => {
  // Define color classes based on the color prop
  const getColorClasses = (color: string) => {
    // Purple background with white text
    return 'bg-[rgba(169,0,232,1)] text-white';
  };
  
  // Map icon string to Lucide React components
  const getIcon = (iconName: string): ReactNode => {
    switch (iconName) {
      case 'qrcode':
        return <QrCode size={20} />;
      case 'paper-plane':
        return <Send size={20} />;
      case 'exchange-alt':
        return <ArrowLeftRight size={20} />;
      case 'history':
        return <History size={20} />;
      case 'cog':
        return <Settings size={20} />;
      case 'wallet':
        return <Wallet size={20} />;
      case 'chart':
        return <BarChart3 size={20} />;
      case 'dollar':
        return <DollarSign size={20} />;
      case 'bank':
        return <Landmark size={20} />;
      case 'savings':
        return <PiggyBank size={20} />;
      default:
        return <Wallet size={20} />;
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <Link href={path}>
      <div className="flex flex-col items-center cursor-pointer group">
        <div className={`w-12 h-12 rounded-lg ${colorClasses} flex items-center justify-center mb-2 group-hover:opacity-90 transition-opacity neumorphic`}>
          {getIcon(icon)}
        </div>
        <span className="text-sm text-black font-medium">{label}</span>
      </div>
    </Link>
  );
};

export default QuickActionButton;