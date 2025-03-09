'use client';

import React, { useState } from 'react';
import { Portfolio, db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import CreatePortfolioModal from '@/components/portfolio/CreatePortfolioModal';

interface PortfolioSidebarProps {
  activePortfolioId?: number | null;
  onCreateClick?: () => void;
  onPortfolioSelect?: (portfolioId: number) => void;
}

const PortfolioSidebar: React.FC<PortfolioSidebarProps> = ({ 
  activePortfolioId,
  onCreateClick,
  onPortfolioSelect
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const portfolios = useLiveQuery<Portfolio[]>(() => db.portfolios.toArray(), []);

  const handleCreateClick = () => {
    if (onCreateClick) {
      onCreateClick();
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const handlePortfolioClick = (portfolioId: number) => {
    if (onPortfolioSelect) {
      onPortfolioSelect(portfolioId);
    }
  };

  return (
    <div className="w-full md:w-64 bg-white dark:bg-gray-900 p-4 border-r border-gray-200 dark:border-gray-800 h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Portfolios</h2>
        <button
          onClick={handleCreateClick}
          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          aria-label="Create new portfolio"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-1">
        {portfolios && portfolios.length > 0 ? (
          portfolios.map((portfolio) => (
            <button 
              key={portfolio.id} 
              onClick={() => handlePortfolioClick(portfolio.id!)}
              className={`flex items-center px-3 py-2 rounded-lg w-full text-left ${
                activePortfolioId === portfolio.id 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'
              }`}
            >
              <span className="mr-2" role="img" aria-label={portfolio.name}>{portfolio.emoji}</span>
              <span className="truncate">{portfolio.name}</span>
            </button>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <p>No portfolios yet</p>
            <button 
              onClick={handleCreateClick}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Create your first portfolio
            </button>
          </div>
        )}
      </div>

      <CreatePortfolioModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default PortfolioSidebar; 