'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatPrice, formatLargeNumber } from '@/utils/formatters';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  circulating_supply: number;
  image: string;
}

type SortField = 'rank' | 'price' | 'change_1h' | 'change_24h' | 'change_7d' | 'market_cap' | 'circulating_supply';
type SortDirection = 'asc' | 'desc';

interface CoinListProps {
  coins: Coin[];
}

const PriceChange: React.FC<{ value: number | undefined }> = ({ value }) => {
  if (value === undefined) return <span className="text-gray-400 dark:text-gray-500">N/A</span>;
  
  return (
    <div className={`flex items-center ${value > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
      <span className={`mr-1 ${value > 0 ? 'rotate-0' : 'rotate-180'}`}>
        ▲
      </span>
      {Math.abs(value).toFixed(2)}%
    </div>
  );
};

const SortIcon: React.FC<{ active: boolean; direction: SortDirection }> = ({ active, direction }) => {
  if (!active) return <span className="ml-1 text-gray-400 dark:text-gray-500">↕</span>;
  return <span className="ml-1 text-gray-700 dark:text-gray-300">{direction === 'asc' ? '↑' : '↓'}</span>;
};

const CoinList: React.FC<CoinListProps> = ({ coins }) => {
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCoins = [...coins].sort((a, b) => {
    let valA, valB;
    
    switch (sortField) {
      case 'rank':
        return sortDirection === 'asc' ? 1 : -1;  // Preserve current order or reverse
      case 'price':
        valA = a.current_price;
        valB = b.current_price;
        break;
      case 'change_1h':
        valA = a.price_change_percentage_1h_in_currency || 0;
        valB = b.price_change_percentage_1h_in_currency || 0;
        break;
      case 'change_24h':
        valA = a.price_change_percentage_24h || 0;
        valB = b.price_change_percentage_24h || 0;
        break;
      case 'change_7d':
        valA = a.price_change_percentage_7d_in_currency || 0;
        valB = b.price_change_percentage_7d_in_currency || 0;
        break;
      case 'market_cap':
        valA = a.market_cap;
        valB = b.market_cap;
        break;
      case 'circulating_supply':
        valA = a.circulating_supply;
        valB = b.circulating_supply;
        break;
      default:
        return 0;
    }
    
    if (valA === valB) return 0;
    
    const result = valA < valB ? -1 : 1;
    return sortDirection === 'asc' ? result : -result;
  });

  return (
    <div className="overflow-x-auto rounded-xl shadow">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('rank')}
            >
              <div className="flex items-center">
                Rank
                <SortIcon active={sortField === 'rank'} direction={sortDirection} />
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Name
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('price')}
            >
              <div className="flex items-center justify-end">
                Price
                <SortIcon active={sortField === 'price'} direction={sortDirection} />
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('change_1h')}
            >
              <div className="flex items-center justify-end">
                1h %
                <SortIcon active={sortField === 'change_1h'} direction={sortDirection} />
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('change_24h')}
            >
              <div className="flex items-center justify-end">
                24h %
                <SortIcon active={sortField === 'change_24h'} direction={sortDirection} />
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('change_7d')}
            >
              <div className="flex items-center justify-end">
                7d %
                <SortIcon active={sortField === 'change_7d'} direction={sortDirection} />
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('market_cap')}
            >
              <div className="flex items-center justify-end">
                Market Cap
                <SortIcon active={sortField === 'market_cap'} direction={sortDirection} />
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('circulating_supply')}
            >
              <div className="flex items-center justify-end">
                Circulating Supply
                <SortIcon active={sortField === 'circulating_supply'} direction={sortDirection} />
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {sortedCoins.map((coin, index) => (
            <tr key={coin.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Link href={`/coin/${coin.id}`} className="flex items-center group">
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="w-6 h-6 mr-2 rounded-full"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {coin.name}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                      {coin.symbol.toUpperCase()}
                    </div>
                  </div>
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                ${formatPrice(coin.current_price)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <PriceChange value={coin.price_change_percentage_1h_in_currency} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <PriceChange value={coin.price_change_percentage_24h} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <PriceChange value={coin.price_change_percentage_7d_in_currency} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                ${formatLargeNumber(coin.market_cap)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                {formatLargeNumber(coin.circulating_supply)} {coin.symbol.toUpperCase()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CoinList; 