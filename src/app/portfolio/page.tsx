'use client';

import React, { useState, useEffect } from 'react';
import { db, Portfolio, PortfolioHolding, withDb } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { formatPrice } from '@/utils/formatters';
import AddToPortfolioDialog from '@/components/portfolio/AddToPortfolioDialog';
import CreatePortfolioModal from '@/components/portfolio/CreatePortfolioModal';
import { usePortfolioContext } from './layout';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  image: string;
}

// Extended holding with additional calculated fields
interface HoldingWithValue extends PortfolioHolding {
  currentPrice?: number;
  value?: number;
  percentage?: number;
}

// Create a helper function for formatting currency values
const formatCurrency = (value: number, fractionDigits: { min?: number; max?: number } = {}) => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits.min ?? 0,
    maximumFractionDigits: fractionDigits.max ?? 2
  });
};

// Simpler cache implementation
type PriceData = Record<string, { usd: number }>;

// Cache variables with module scope
let cachedPriceData: PriceData = {};
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// Function to get coin prices with caching
const getCoinPrices = async (coinIds: string[]): Promise<PriceData> => {
  const now = Date.now();
  const isCacheValid = now - cacheTimestamp < CACHE_DURATION_MS;
  const areAllCoinsInCache = coinIds.every(id => id in cachedPriceData);
  
  // If cache is valid and has all the coins we need, use it
  if (isCacheValid && areAllCoinsInCache) {
    console.log('Using cached price data');
    return cachedPriceData;
  }
  
  // Otherwise fetch fresh data
  console.log('Fetching fresh price data from CoinGecko');
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd`
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data: PriceData = await response.json();
    
    // Update cache
    cachedPriceData = data;
    cacheTimestamp = now;
    
    return data;
  } catch (error) {
    console.error('Error fetching coin prices:', error);
    
    // Return cached data as fallback if available, otherwise empty object
    return isCacheValid ? cachedPriceData : {};
  }
};

export default function PortfolioHome() {
  const portfolios = useLiveQuery<Portfolio[]>(() => db.portfolios.toArray(), []);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { activePortfolioId, setActivePortfolioId } = usePortfolioContext();
  const [holdingsWithValues, setHoldingsWithValues] = useState<HoldingWithValue[]>([]);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Set the first portfolio as active when portfolios load
  useEffect(() => {
    if (portfolios && portfolios.length > 0 && activePortfolioId === null) {
      setActivePortfolioId(portfolios[0].id!);
    }
  }, [portfolios, activePortfolioId, setActivePortfolioId]);

  // Fetch the active portfolio and its holdings
  const activePortfolio = useLiveQuery<Portfolio | undefined>(
    () => activePortfolioId ? db.portfolios.get(activePortfolioId) : undefined,
    [activePortfolioId]
  );
  
  const holdings = useLiveQuery<PortfolioHolding[]>(
    () => activePortfolioId ? db.portfolio.where('portfolioId').equals(activePortfolioId).toArray() : [],
    [activePortfolioId]
  );

  // Fetch current prices and calculate values when holdings change
  useEffect(() => {
    const fetchPrices = async () => {
      if (!holdings || holdings.length === 0) {
        setHoldingsWithValues([]);
        setTotalPortfolioValue(0);
        setApiError(null);
        return;
      }

      setIsLoading(true);
      setApiError(null);
      
      try {
        // Get unique coin IDs
        const coinIds = [...new Set(holdings.map(h => h.coinId))];
        
        // Fetch prices using our cached function
        const priceData = await getCoinPrices(coinIds);
        
        // If an empty object is returned, likely an API error occurred
        if (Object.keys(priceData).length === 0 && coinIds.length > 0) {
          setApiError("Couldn't retrieve current prices. Showing cached data if available.");
        }
        
        // Calculate values and percentages
        let total = 0;
        const enrichedHoldings = holdings.map(holding => {
          const currentPrice = priceData[holding.coinId]?.usd || 0;
          const value = holding.amount * currentPrice;
          total += value;
          
          return {
            ...holding,
            currentPrice,
            value
          };
        });
        
        // Add percentage information
        const holdingsWithPercentage = enrichedHoldings.map(holding => ({
          ...holding,
          percentage: total > 0 ? (holding.value! / total) * 100 : 0
        }));
        
        setHoldingsWithValues(holdingsWithPercentage);
        setTotalPortfolioValue(total);
      } catch (error) {
        console.error('Error processing holdings data:', error);
        setApiError("An error occurred while calculating portfolio values.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
  }, [holdings]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const chartData = {
    labels: holdingsWithValues.map(h => `${h.coinName} (${h.percentage?.toFixed(1)}%)`),
    datasets: [
      {
        data: holdingsWithValues.map(h => h.value || 0),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#8D99AE',
          '#58B368',
          '#D81159',
          '#8F2D56',
        ],
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    ],
  };

  const handleOpenAddCoinModal = () => {
    setIsDialogOpen(true);
  };
  
  const handleDeletePortfolio = async () => {
    if (!activePortfolio || !activePortfolioId) return;
    
    if (confirm(`Are you sure you want to delete the "${activePortfolio.name}" portfolio? This will delete all holdings in this portfolio.`)) {
      try {
        await withDb(async (db) => {
          // Delete all holdings in this portfolio
          await db.portfolio.where('portfolioId').equals(activePortfolioId).delete();
          // Delete the portfolio
          await db.portfolios.delete(activePortfolioId);
        });
        // Set active portfolio to null
        setActivePortfolioId(null);
      } catch (error) {
        console.error('Error deleting portfolio:', error);
        alert('Failed to delete portfolio. Please try again.');
      }
    }
  };

  // Render empty state if no portfolios
  if (!portfolios || portfolios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Portfolio Management</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-8">
          Create your first portfolio to get started tracking your crypto investments.
        </p>
        
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

  // Show loading state while we wait for activePortfolio to be set
  if (!activePortfolio && activePortfolioId !== null) {
    return <div className="text-center p-12">Loading portfolio...</div>;
  }

  // Render portfolio detail view if there is an active portfolio
  if (activePortfolio) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <span className="text-5xl mr-3" role="img" aria-label={activePortfolio.name}>
              {activePortfolio.emoji}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {activePortfolio.name}
            </h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleOpenAddCoinModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
              </svg>
              Add to Portfolio
            </button>
            <button
              onClick={handleDeletePortfolio}
              className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg"
            >
              Delete Portfolio
            </button>
          </div>
        </div>

        {/* Portfolio Value Summary */}
        {totalPortfolioValue > 0 && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Total Value</h2>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${formatCurrency(totalPortfolioValue, { min: 2, max: 2 })}
            </p>
          </div>
        )}

        {/* Display API error if it exists */}
        {apiError && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-500">
            <p className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {apiError}
            </p>
          </div>
        )}

        {/* Portfolio Allocation */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Allocation</h2>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 dark:text-gray-400">Loading allocation data...</p>
            </div>
          ) : holdingsWithValues.length > 0 ? (
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Left side - Coin list with percentages */}
              <div className="w-full md:w-1/3 space-y-2 mb-4 md:mb-0">
                {holdingsWithValues
                  .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
                  .map((holding, index) => (
                    <div 
                      key={holding.id} 
                      className="flex items-center py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    >
                      <div className="w-3 h-3 rounded-full mr-2" style={{ 
                        backgroundColor: [
                          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                          '#FF9F40', '#8D99AE', '#58B368', '#D81159', '#8F2D56'
                        ][index % 10]
                      }}></div>
                      <div className="flex-1 truncate">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">{holding.coinName}</span>
                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">({holding.coinSymbol.toUpperCase()})</span>
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {holding.percentage?.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-3"></div>
                <div className="flex justify-between items-center py-1.5 px-2">
                  <span className="font-medium text-gray-900 dark:text-white">Total</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${formatCurrency(totalPortfolioValue, { min: 2, max: 2 })}
                  </span>
                </div>
              </div>

              {/* Right side - Chart */}
              <div className="w-full md:w-2/3">
                <div className="max-w-[200px] md:max-w-[240px] mx-auto relative aspect-square">
                  <Doughnut 
                    data={chartData} 
                    options={{
                      cutout: '75%',
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const value = context.parsed;
                              const index = context.dataIndex;
                              const percentage = holdingsWithValues[index]?.percentage?.toFixed(1) || '0';
                              return `Value: $${formatCurrency(value)} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }} 
                  />
                  
                  {/* Center text - adjust font sizes */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      ${formatCurrency(totalPortfolioValue, { max: 0 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <p>No holdings yet</p>
              <p className="text-sm mt-2">Add some coins to see your portfolio allocation</p>
            </div>
          )}
        </div>

        {/* Holdings List */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Your Holdings</h2>
          {holdingsWithValues.length > 0 ? (
            <div>
              {/* Column headers - hidden on small screens */}
              <div className="hidden md:grid md:grid-cols-5 mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="px-2">Asset</div>
                <div className="px-2 text-right">Balance</div>
                <div className="px-2 text-right">Price</div>
                <div className="px-2 text-right">Value</div>
                <div className="px-2 text-right">Allocation</div>
              </div>
              
              {/* Divider line */}
              <div className="hidden md:block h-px bg-gray-200 dark:bg-gray-700 mb-3"></div>
              
              {/* Holdings */}
              <div className="space-y-3">
                {holdingsWithValues
                  .sort((a, b) => (b.value || 0) - (a.value || 0)) // Sort by value, highest first
                  .map((holding) => (
                    <div
                      key={holding.id}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                    >
                      {/* Mobile view - stacked layout */}
                      <div className="md:hidden">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <h3 className="text-gray-900 dark:text-white font-medium">{holding.coinName}</h3>
                            <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">({holding.coinSymbol.toUpperCase()})</span>
                          </div>
                          {holding.percentage && (
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {holding.percentage.toFixed(1)}%
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-sm">
                          <div className="text-gray-500 dark:text-gray-400">Balance:</div>
                          <div className="text-right text-gray-900 dark:text-white">{formatPrice(holding.amount)} {holding.coinSymbol.toUpperCase()}</div>
                          
                          <div className="text-gray-500 dark:text-gray-400">Price:</div>
                          <div className="text-right text-gray-900 dark:text-white">${formatCurrency(holding.currentPrice || 0)}</div>
                          
                          <div className="text-gray-500 dark:text-gray-400">Value:</div>
                          <div className="text-right text-gray-900 dark:text-white">${formatCurrency(holding.value || 0)}</div>
                        </div>
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={() => withDb(async (db) => db.portfolio.delete(holding.id!))}
                            className="text-red-500 dark:text-red-400 text-sm hover:text-red-600 dark:hover:text-red-300 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      
                      {/* Desktop view - table layout */}
                      <div className="hidden md:grid md:grid-cols-5 md:items-center">
                        <div className="px-2">
                          <div className="font-medium text-gray-900 dark:text-white">{holding.coinName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{holding.coinSymbol.toUpperCase()}</div>
                        </div>
                        <div className="px-2 text-right text-gray-900 dark:text-white">
                          {formatPrice(holding.amount)} {holding.coinSymbol.toUpperCase()}
                        </div>
                        <div className="px-2 text-right text-gray-900 dark:text-white">
                          ${formatCurrency(holding.currentPrice || 0)}
                        </div>
                        <div className="px-2 text-right text-gray-900 dark:text-white">
                          ${formatCurrency(holding.value || 0, { min: 2, max: 2 })}
                        </div>
                        <div className="px-2 flex items-center justify-end">
                          <div className="text-gray-900 dark:text-white font-medium mr-3">
                            {holding.percentage?.toFixed(1)}%
                          </div>
                          <button
                            onClick={() => withDb(async (db) => db.portfolio.delete(holding.id!))}
                            className="text-red-500 dark:text-red-400 text-sm hover:text-red-600 dark:hover:text-red-300 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p>No holdings yet</p>
              <p className="text-sm mt-2">Your portfolio is empty</p>
            </div>
          )}
        </div>

        <AddToPortfolioDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
          }}
          portfolioId={activePortfolioId || undefined}
        />
        
        <CreatePortfolioModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    );
  }

  return null;
} 