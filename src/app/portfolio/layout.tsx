'use client';

import { PropsWithChildren, useState } from 'react';
import Header from '@/components/Header';
import PortfolioSidebar from '@/components/portfolio/PortfolioSidebar';
import { useParams } from 'next/navigation';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import CreatePortfolioModal from '@/components/portfolio/CreatePortfolioModal';

export default function PortfolioLayout({ children }: PropsWithChildren) {
  const params = useParams();
  const portfolioId = params.id ? Number(params.id) : undefined;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Don't automatically show the modal when there are no portfolios
  const portfolioCount = useLiveQuery(() => db.portfolios.count());
  
  return (
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
            activePortfolioId={portfolioId} 
            onCreateClick={() => setIsCreateModalOpen(true)}
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
  );
} 