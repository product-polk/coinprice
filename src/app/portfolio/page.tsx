'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { db, PortfolioHolding } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { formatPrice } from '@/utils/formatters';
import CoinSearch from '@/components/CoinSearch';
import AddToPortfolioDialog from '@/components/AddToPortfolioDialog';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  image: string;
}

export default function Portfolio() {
  const holdings = useLiveQuery<PortfolioHolding[]>(
    () => db.portfolio.toArray(),
    []
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);

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

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <div className="relative">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Add New Coin Section */}
          <div className="mb-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold mb-4 text-white">Add New Coin</h2>
            <CoinSearch onSelect={handleCoinSelect} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Portfolio Distribution */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold mb-4 text-white">Portfolio Distribution</h2>
              {holdings && holdings.length > 0 ? (
                <div className="aspect-square">
                  <Pie 
                    data={chartData} 
                    options={{
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            color: 'white'
                          }
                        }
                      }
                    }} 
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <p>No holdings yet</p>
                  <p className="text-sm mt-2">Add some coins to see your portfolio distribution</p>
                </div>
              )}
            </div>

            {/* Holdings List */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold mb-4 text-white">Your Holdings</h2>
              {holdings && holdings.length > 0 ? (
                <div className="space-y-4">
                  {holdings.map((holding: PortfolioHolding) => (
                    <div
                      key={holding.id}
                      className="p-4 rounded-xl border border-white/10 bg-white/5"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-white font-medium">{holding.coinName}</h3>
                          <p className="text-gray-400 text-sm">{holding.coinSymbol.toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white">{formatPrice(holding.amount)} {holding.coinSymbol.toUpperCase()}</p>
                          <button
                            onClick={() => db.portfolio.delete(holding.id!)}
                            className="text-red-400 text-sm hover:text-red-300 transition-colors mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <p>No holdings yet</p>
                  <p className="text-sm mt-2">Your portfolio is empty</p>
                </div>
              )}
            </div>
          </div>
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
    </main>
  );
} 