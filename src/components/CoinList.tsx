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
  if (value === undefined) return <span className="text-gray-400">N/A</span>;
  
  return (
    <div className={`flex items-center ${value > 0 ? 'text-green-400' : 'text-red-400'}`}>
      <span className={`mr-1 ${value > 0 ? 'rotate-0' : 'rotate-180'}`}>
        ▲
      </span>
      {Math.abs(value).toFixed(2)}%
    </div>
  );
};

const SortIcon: React.FC<{ active: boolean; direction: SortDirection }> = ({ active, direction }) => {
  if (!active) return <span className="ml-1 text-gray-500">↕</span>;
  return <span className="ml-1 text-white">{direction === 'asc' ? '↑' : '↓'}</span>;
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
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'rank':
        return multiplier * 1; // Already sorted by index
      case 'price':
        return multiplier * (a.current_price - b.current_price);
      case 'change_1h':
        return multiplier * ((a.price_change_percentage_1h_in_currency || 0) - (b.price_change_percentage_1h_in_currency || 0));
      case 'change_24h':
        return multiplier * ((a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0));
      case 'change_7d':
        return multiplier * ((a.price_change_percentage_7d_in_currency || 0) - (b.price_change_percentage_7d_in_currency || 0));
      case 'market_cap':
        return multiplier * (a.market_cap - b.market_cap);
      case 'circulating_supply':
        return multiplier * (a.circulating_supply - b.circulating_supply);
      default:
        return 0;
    }
  });

  const renderSortableHeader = (label: string, field: SortField) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center text-left text-xs font-medium text-gray-300 uppercase tracking-wider hover:text-white"
    >
      {label}
      <SortIcon active={sortField === field} direction={sortDirection} />
    </button>
  );

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
      <div className="w-full overflow-x-auto">
        <table className="min-w-full table-fixed">
          <colgroup>
            <col className="w-12"/>{/* # */}
            <col className="w-48"/>{/* Name */}
            <col className="w-32"/>{/* Price */}
            <col className="w-24"/>{/* 1h % */}
            <col className="w-24"/>{/* 24h % */}
            <col className="w-24"/>{/* 7d % */}
            <col className="w-40"/>{/* Market Cap */}
            <col className="w-44"/>{/* Circulating Supply */}
          </colgroup>
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-4">{renderSortableHeader('#', 'rank')}</th>
              <th className="px-4 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-4 py-4">{renderSortableHeader('Price', 'price')}</th>
              <th className="px-4 py-4">{renderSortableHeader('1h %', 'change_1h')}</th>
              <th className="px-4 py-4">{renderSortableHeader('24h %', 'change_24h')}</th>
              <th className="px-4 py-4">{renderSortableHeader('7d %', 'change_7d')}</th>
              <th className="px-4 py-4">{renderSortableHeader('Market Cap', 'market_cap')}</th>
              <th className="px-4 py-4">{renderSortableHeader('Circ. Supply', 'circulating_supply')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {sortedCoins.map((coin, index) => (
              <tr
                key={coin.id}
                className="hover:bg-white/5 transition-colors duration-200"
              >
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{index + 1}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Link href={`/coin/${coin.id}`} className="flex items-center group">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                      <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                    </div>
                    <div className="ml-2 flex flex-col">
                      <span className="font-medium text-white text-sm">{coin.name}</span>
                      <span className="text-gray-400 text-xs uppercase group-hover:text-gray-300">{coin.symbol}</span>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                  ${formatPrice(coin.current_price)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <PriceChange value={coin.price_change_percentage_1h_in_currency} />
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <PriceChange value={coin.price_change_percentage_24h} />
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <PriceChange value={coin.price_change_percentage_7d_in_currency} />
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                  ${formatLargeNumber(coin.market_cap)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                  {formatLargeNumber(coin.circulating_supply)} <span className="text-gray-400">{coin.symbol.toUpperCase()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoinList; 