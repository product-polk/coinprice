'use client';

import React, { useState, useEffect } from 'react';
import { db, Portfolio, withDb } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useDebounce } from '@/hooks/useDebounce';

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  image: string;
}

interface SearchCoin {
  id: string;
  symbol: string;
  name: string;
  large: string;
}

interface PriceData {
  [key: string]: {
    usd: number;
  };
}

interface AddToPortfolioDialogProps {
  isOpen: boolean;
  onClose: () => void;
  coin?: CoinData;
  portfolioId?: number; // Optional prop to preselect a portfolio
}

const AddToPortfolioDialog: React.FC<AddToPortfolioDialogProps> = ({
  isOpen,
  onClose,
  coin: initialCoin,
  portfolioId
}) => {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(portfolioId || null);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCoinSearch, setShowCoinSearch] = useState(!initialCoin);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(initialCoin || null);

  // Coin search states
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<CoinData[]>([]);
  const [searching, setSearching] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const portfolios = useLiveQuery<Portfolio[]>(() => db.portfolios.toArray(), []);

  useEffect(() => {
    // If portfolioId prop changes, update the selected portfolio
    if (portfolioId) {
      setSelectedPortfolioId(portfolioId);
    }
    // Otherwise set first portfolio as default when portfolios are loaded and no selection
    else if (portfolios && portfolios.length > 0 && !selectedPortfolioId) {
      const firstPortfolio = portfolios[0];
      if (firstPortfolio && firstPortfolio.id !== undefined) {
        setSelectedPortfolioId(firstPortfolio.id);
      }
    }
  }, [portfolios, selectedPortfolioId, portfolioId]);

  // Handle coin search
  useEffect(() => {
    const fetchCoins = async () => {
      if (!debouncedSearch) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/search?query=${debouncedSearch}`
        );
        const data = await response.json();
        
        if (data.coins.length > 0) {
          const ids = data.coins.slice(0, 10).map((c: SearchCoin) => c.id).join(',');
          const priceResponse = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
          );
          const priceData: PriceData = await priceResponse.json();

          const coinsWithPrices = data.coins.slice(0, 10).map((coin: SearchCoin) => ({
            id: coin.id,
            symbol: coin.symbol,
            name: coin.name,
            image: coin.large,
            current_price: priceData[coin.id]?.usd || 0
          }));

          setSearchResults(coinsWithPrices);
        }
      } catch (error) {
        console.error('Error fetching coins:', error);
      } finally {
        setSearching(false);
      }
    };

    fetchCoins();
  }, [debouncedSearch]);

  // Coin selection handler
  const handleCoinSelect = (coin: CoinData) => {
    setSelectedCoin(coin);
    setShowCoinSearch(false);
    setSearch('');
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPortfolioId || !selectedCoin) {
      alert('Please select a portfolio and a coin');
      return;
    }
    
    setIsSubmitting(true);

    try {
      await withDb(async (db) => {
        await db.portfolio.add({
          portfolioId: selectedPortfolioId,
          coinId: selectedCoin.id,
          coinSymbol: selectedCoin.symbol,
          coinName: selectedCoin.name,
          amount: parseFloat(amount),
          timestamp: new Date(),
        });
      });
      onClose();
      setAmount('');
      setSelectedCoin(null);
      setShowCoinSearch(true);
    } catch (error) {
      console.error('Error adding to portfolio:', error);
      alert('Failed to add to portfolio. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!portfolios || portfolios.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            No Portfolios Available
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You need to create a portfolio before adding coins.
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {showCoinSearch ? 'Select a Coin' : `Add ${selectedCoin?.name} to Portfolio`}
        </h2>

        {showCoinSearch ? (
          <div>
            <div className="mb-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for a coin..."
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              {searching ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                <div>
                  {searchResults.map((coin) => (
                    <button
                      key={coin.id}
                      onClick={() => handleCoinSelect(coin)}
                      className="w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3 text-left border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    >
                      <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                      <div>
                        <div className="text-gray-900 dark:text-white font-medium">{coin.name}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-sm">{coin.symbol.toUpperCase()}</div>
                      </div>
                      {coin.current_price > 0 && (
                        <div className="ml-auto text-gray-500 dark:text-gray-400">
                          ${coin.current_price.toLocaleString()}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : search ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No results found
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Search for a cryptocurrency
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Portfolio
              </label>
              <select
                value={selectedPortfolioId || ''}
                onChange={(e) => setSelectedPortfolioId(Number(e.target.value))}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
                required
              >
                <option value="" disabled>Select a portfolio</option>
                {portfolios.map((portfolio) => (
                  <option key={portfolio.id} value={portfolio.id}>
                    {portfolio.emoji} {portfolio.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-3 py-2">
              <div className="flex-shrink-0">
                {selectedCoin && <img src={selectedCoin.image} alt={selectedCoin.name} className="w-10 h-10 rounded-full" />}
              </div>
              <div>
                <div className="text-gray-900 dark:text-white font-medium">{selectedCoin?.name}</div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">{selectedCoin?.symbol.toUpperCase()}</div>
              </div>
              <button
                type="button"
                onClick={() => setShowCoinSearch(true)}
                className="ml-auto text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Change
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount ({selectedCoin?.symbol.toUpperCase()})
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
                  placeholder="0.00"
                  required
                />
                {selectedCoin?.current_price && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    ≈ ${amount ? (parseFloat(amount) * selectedCoin.current_price).toFixed(2) : '0.00'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !amount || !selectedPortfolioId || !selectedCoin}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? 'Adding...' : 'Add to Portfolio'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddToPortfolioDialog; 