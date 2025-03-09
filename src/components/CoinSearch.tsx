'use client';

import React, { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  image: string;
}

interface CoinSearchProps {
  onSelect: (coin: Coin) => void;
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

const CoinSearch: React.FC<CoinSearchProps> = ({ onSelect }) => {
  const [search, setSearch] = useState('');
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const fetchCoins = async () => {
      if (!debouncedSearch) {
        setCoins([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/search?query=${debouncedSearch}`
        );
        const data = await response.json();
        
        // Get prices for the top 10 results
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

          setCoins(coinsWithPrices);
        }
      } catch (error) {
        console.error('Error fetching coins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, [debouncedSearch]);

  return (
    <div className="relative">
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search for a coin..."
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
      />
      
      {isOpen && (search || loading) && (
        <div className="absolute z-50 w-full mt-2 bg-gray-900 rounded-lg border border-white/10 shadow-xl max-h-96 overflow-auto">
          {loading ? (
            <div className="p-4 text-gray-400 text-center">Loading...</div>
          ) : coins.length > 0 ? (
            <div className="py-2">
              {coins.map((coin) => (
                <button
                  key={coin.id}
                  onClick={() => {
                    onSelect(coin);
                    setSearch('');
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 hover:bg-white/5 flex items-center gap-3 text-left"
                >
                  <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                  <div>
                    <div className="text-white font-medium">{coin.name}</div>
                    <div className="text-gray-400 text-sm">{coin.symbol.toUpperCase()}</div>
                  </div>
                  {coin.current_price > 0 && (
                    <div className="ml-auto text-gray-400">
                      ${coin.current_price.toLocaleString()}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-gray-400 text-center">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoinSearch; 