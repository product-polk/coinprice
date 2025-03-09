'use client';

import React, { useState } from 'react';
import { db, Portfolio, PortfolioHolding, withDb } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { formatPrice } from '@/utils/formatters';
import CoinSearch from '@/components/CoinSearch';
import AddToPortfolioDialog from '@/components/portfolio/AddToPortfolioDialog';
import { useParams, useRouter } from 'next/navigation';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  image: string;
}

export default function PortfolioDetail() {
  const params = useParams();
  const router = useRouter();
  const portfolioId = Number(params.id);
  
  // Fetch the portfolio and its holdings
  const portfolio = useLiveQuery<Portfolio | undefined>(
    () => db.portfolios.get(portfolioId),
    [portfolioId]
  );
  
  const holdings = useLiveQuery<PortfolioHolding[]>(
    () => db.portfolio.where('portfolioId').equals(portfolioId).toArray(),
    [portfolioId]
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);

  // Redirect if portfolio doesn't exist
  React.useEffect(() => {
    if (portfolio === undefined && typeof window !== 'undefined') {
      // Only redirect on client-side
      router.push('/portfolio');
    }
  }, [portfolio, router]);

  const chartData = {
    labels: holdings?.map((h: PortfolioHolding) => h.coinName) || [],
    datasets: [
      {
        data: holdings?.map((h: PortfolioHolding) => h.amount) || [],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    ],
  };

  const handleCoinSelect = (coin: CoinData) => {
    setSelectedCoin(coin);
    setIsDialogOpen(true);
  };
  
  const handleDeletePortfolio = async () => {
    if (!portfolio) return;
    
    if (confirm(`Are you sure you want to delete the "${portfolio.name}" portfolio? This will delete all holdings in this portfolio.`)) {
      try {
        await withDb(async (db) => {
          // Delete all holdings in this portfolio
          await db.portfolio.where('portfolioId').equals(portfolioId).delete();
          // Delete the portfolio
          await db.portfolios.delete(portfolioId);
        });
        // Navigate back to main portfolio page
        router.push('/portfolio');
      } catch (error) {
        console.error('Error deleting portfolio:', error);
        alert('Failed to delete portfolio. Please try again.');
      }
    }
  };

  if (!portfolio) {
    return <div className="text-center p-12">Loading portfolio...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <span className="text-5xl mr-3" role="img" aria-label={portfolio.name}>
            {portfolio.emoji}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {portfolio.name}
          </h1>
        </div>
        <button
          onClick={handleDeletePortfolio}
          className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg"
        >
          Delete Portfolio
        </button>
      </div>

      {/* Add New Coin Section */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Coin</h2>
        <CoinSearch onSelect={handleCoinSelect} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Portfolio Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Portfolio Distribution</h2>
          {holdings && holdings.length > 0 ? (
            <div className="aspect-square">
              <Pie 
                data={chartData} 
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                      }
                    }
                  }
                }} 
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <p>No holdings yet</p>
              <p className="text-sm mt-2">Add some coins to see your portfolio distribution</p>
            </div>
          )}
        </div>

        {/* Holdings List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Your Holdings</h2>
          {holdings && holdings.length > 0 ? (
            <div className="space-y-4">
              {holdings.map((holding: PortfolioHolding) => (
                <div
                  key={holding.id}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-gray-900 dark:text-white font-medium">{holding.coinName}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{holding.coinSymbol.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 dark:text-white">{formatPrice(holding.amount)} {holding.coinSymbol.toUpperCase()}</p>
                      <button
                        onClick={() => withDb(async (db) => db.portfolio.delete(holding.id!))}
                        className="text-red-500 dark:text-red-400 text-sm hover:text-red-600 dark:hover:text-red-300 transition-colors mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p>No holdings yet</p>
              <p className="text-sm mt-2">Your portfolio is empty</p>
            </div>
          )}
        </div>
      </div>

      {selectedCoin && (
        <AddToPortfolioDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedCoin(null);
          }}
          coin={selectedCoin}
        />
      )}
    </div>
  );
} 