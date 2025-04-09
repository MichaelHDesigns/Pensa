import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="inline-block p-6 rounded-full bg-gray-100 mb-4">
            <svg 
              width="64" 
              height="64" 
              viewBox="0 0 24 24" 
              fill="none"
              className="text-[#9945FF]"
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Page not found</h1>
          <p className="text-lg text-gray-600 mb-6">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <div className="space-x-4">
            <Button 
              onClick={() => window.history.back()} 
              variant="outline"
              className="border-[#9945FF] text-[#9945FF] hover:bg-[#9945FF]/10"
            >
              Go back
            </Button>
            <Button 
              onClick={() => setLocation("/")} 
              className="gradient-bg"
            >
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}