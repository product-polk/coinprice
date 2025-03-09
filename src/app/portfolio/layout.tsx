'use client';

import { PropsWithChildren, useState, createContext, useContext } from 'react';
import Header from '@/components/Header';
import PortfolioSidebar from '@/components/portfolio/PortfolioSidebar';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import CreatePortfolioModal from '@/components/portfolio/CreatePortfolioModal';

// Create a simpler context for portfolio state
interface PortfolioContextType {
  activePortfolioId: number | null;
  setActivePortfolioId: (id: number | null) => void;
}

export const PortfolioContext = createContext<PortfolioContextType | null>(null);

// Custom hook to use the portfolio context
export const usePortfolioContext = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolioContext must be used within a PortfolioProvider');
  }
  return context;
};

export default function PortfolioLayout({ children }: PropsWithChildren) {
  const [activePortfolioId, setActivePortfolioId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Don't automatically show the modal when there are no portfolios
  const portfolioCount = useLiveQuery(() => db.portfolios.count());
  
  return (
    <PortfolioContext.Provider value={{ activePortfolioId, setActivePortfolioId }}>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
        {/* Header - fixed height */}
        <div className="flex-none">
          <Header />
        </div>
        
        {/* Main content - takes remaining height */}
        <div className="flex-grow flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-64 md:sticky md:top-0 md:h-screen overflow-y-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
            <PortfolioSidebar 
              activePortfolioId={activePortfolioId} 
              onCreateClick={() => setIsCreateModalOpen(true)}
              onPortfolioSelect={(id) => setActivePortfolioId(id)}
            />
          </div>
          
          {/* Content area */}
          <div className="flex-grow p-4 overflow-y-auto">
            {children}
          </div>
        </div>
        
        <CreatePortfolioModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    </PortfolioContext.Provider>
  );
} 