import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Welcome from "@/pages/welcome";
import CreateWallet from "@/pages/create-wallet";
import ImportWallet from "@/pages/import-wallet";
import WalletDashboard from "@/pages/wallet-dashboard";
import Send from "@/pages/send";
import Receive from "@/pages/receive";
import Swap from "@/pages/swap";
import Transactions from "@/pages/transactions";
import Settings from "@/pages/settings";
import { WalletProvider } from "@/contexts/WalletContext";
import { SwapProvider } from "@/contexts/SwapContext";

function App() {
  return (
    <>
      <WalletProvider>
        <SwapProvider>
          <Switch>
            <Route path="/" component={Welcome} />
            <Route path="/welcome" component={Welcome} />
            <Route path="/create-wallet" component={CreateWallet} />
            <Route path="/import-wallet" component={ImportWallet} />
            <Route path="/wallet" component={WalletDashboard} />
            <Route path="/wallet-dashboard" component={WalletDashboard} />
            <Route path="/send" component={Send} />
            <Route path="/receive" component={Receive} />
            <Route path="/swap" component={Swap} />
            <Route path="/transactions" component={Transactions} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </SwapProvider>
      </WalletProvider>
      <Toaster />
    </>
  );
}

export default App;
