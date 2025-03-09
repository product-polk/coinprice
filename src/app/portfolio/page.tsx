'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/navigation';
import CreatePortfolioModal from '@/components/portfolio/CreatePortfolioModal';

export default function PortfolioHome() {
  const router = useRouter();
  const portfolios = useLiveQuery(() => db.portfolios.toArray(), []);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Redirect to first portfolio if any exist
  useEffect(() => {
    if (portfolios && portfolios.length > 0) {
      const firstPortfolio = portfolios[0];
      if (firstPortfolio && firstPortfolio.id !== undefined) {
        router.push(`/portfolio/${firstPortfolio.id}`);
      }
    }
  }, [portfolios, router]);
  
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Portfolio Management</h1>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-8">
        {portfolios?.length === 0 
          ? "Create your first portfolio to get started tracking your crypto investments."
          : "Loading your portfolio..."}
      </p>
      
      {/* Always show the create portfolio button */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
          <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
        </svg>
        Create New Portfolio
      </button>
      
      <CreatePortfolioModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
} 