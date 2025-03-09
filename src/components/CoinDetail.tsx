'use client';

import React, { useState } from 'react';
import { formatPrice } from '@/utils/formatters';
import TradingViewWidget from './TradingViewWidget';
import TechnicalAnalysis from './TechnicalAnalysis';
import AddToPortfolioDialog from './AddToPortfolioDialog';
import TabContainer from './TabContainer';
import ExchangeLinks from './ExchangeLinks';

interface CoinDetailProps {
  coin: {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    total_volume: number;
    high_24h: number;
    low_24h: number;
    price_change_percentage_24h: number;
    market_cap_rank: number;
    circulating_supply: number;
    description: { en: string };
    links: {
      homepage: string[];
      blockchain_site: string[];
      official_forum_url: string[];
      twitter_screen_name: string;
      telegram_channel_identifier: string;
      subreddit_url: string;
    };
  };
}

const CoinDetail: React.FC<CoinDetailProps> = ({ coin }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // About section content
  const AboutSection = (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">About {coin.name}</h2>
      <div className="prose prose-lg max-w-none text-gray-700 dark:prose-invert dark:opacity-90"
        dangerouslySetInnerHTML={{ __html: coin.description.en }}
      />
    </div>
  );

  // Exchange links section
  const BuySection = (
    <ExchangeLinks coinSymbol={coin.symbol} coinName={coin.name} />
  );

  // Tab configuration
  const tabsConfig = [
    { label: 'About', content: AboutSection },
    { label: `Where to Buy`, content: BuySection }
  ];

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Coin Header */}
      <div className="flex items-center mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20"></div>
          <img src={coin.image} alt={coin.name} className="w-12 h-12 rounded-full" />
        </div>
        <div className="ml-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {coin.name} <span className="text-gray-500 dark:text-gray-400">({coin.symbol.toUpperCase()})</span>
          </h1>
          <div className="flex items-center">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Rank</span>
            <span className="ml-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-500/20 rounded-full text-purple-700 dark:text-purple-300 text-sm">
              #{coin.market_cap_rank}
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white mr-4">
            ${formatPrice(coin.current_price)}
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            coin.price_change_percentage_24h > 0 
              ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' 
              : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
          }`}>
            <span className={`mr-1 ${coin.price_change_percentage_24h > 0 ? 'rotate-0' : 'rotate-180'}`}>
              ▲
            </span>
            {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Chart Section */}
        <div className="flex-grow lg:w-3/4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 h-[900px] overflow-hidden">
            <TradingViewWidget symbol={coin.symbol.toUpperCase()} />
          </div>
          
          {/* Tabs section - replacing the old About section */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <TabContainer tabs={tabsConfig} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/4 space-y-6">
          {/* Market Stats */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Market Stats</h2>
              <button
                onClick={() => setIsDialogOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                Add to Portfolio
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm mb-1">Price</h3>
                <p className="text-gray-900 dark:text-white font-medium">${formatPrice(coin.current_price)}</p>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm mb-1">Market Cap</h3>
                <p className="text-gray-900 dark:text-white font-medium">${formatPrice(coin.market_cap)}</p>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm mb-1">24h Trading Volume</h3>
                <p className="text-gray-900 dark:text-white font-medium">${formatPrice(coin.total_volume)}</p>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm mb-1">24h High</h3>
                <p className="text-gray-900 dark:text-white font-medium">${formatPrice(coin.high_24h)}</p>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm mb-1">24h Low</h3>
                <p className="text-gray-900 dark:text-white font-medium">${formatPrice(coin.low_24h)}</p>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm mb-1">Circulating Supply</h3>
                <p className="text-gray-900 dark:text-white font-medium">
                  {formatPrice(coin.circulating_supply)} {coin.symbol.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Links Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Links</h2>
            <div className="space-y-4">
              {/* Website */}
              {coin.links.homepage[0] && (
                <a
                  href={coin.links.homepage[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span className="ml-3 text-gray-900 dark:text-white">Website</span>
                </a>
              )}

              {/* Explorer */}
              {coin.links.blockchain_site[0] && (
                <a
                  href={coin.links.blockchain_site[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="ml-3 text-gray-900 dark:text-white">Explorer</span>
                </a>
              )}

              {/* Twitter */}
              {coin.links.twitter_screen_name && (
                <a
                  href={`https://twitter.com/${coin.links.twitter_screen_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  <span className="ml-3 text-gray-900 dark:text-white">Twitter</span>
                </a>
              )}

              {/* Reddit */}
              {coin.links.subreddit_url && (
                <a
                  href={coin.links.subreddit_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                  <span className="ml-3 text-gray-900 dark:text-white">Reddit</span>
                </a>
              )}

              {/* Telegram */}
              {coin.links.telegram_channel_identifier && (
                <a
                  href={`https://t.me/${coin.links.telegram_channel_identifier}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.306.14.18c.024.024.12.12.24.096.198-.024-.024-1.584-1.32-4.752-1.44-5.04-.12.024 1.44 1.2 4.44 1.32 5.04.12.024.024.12.12.14.14zM12 15.36c-.12.024-5.28.336-7.2-6.24-1.2c-1.944.12-3.36 5.28-1.2 7.2.12.024.024 1.944-5.28 3.36-7.2.12-.024.12.12 5.28 1.944 7.2 6.24.12.024.024.12.12.12.14z"/>
                  </svg>
                  <span className="ml-3 text-gray-900 dark:text-white">Telegram</span>
                </a>
              )}
            </div>
          </div>

          {/* Technical Analysis */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-[450px] overflow-hidden shadow-sm">
            <TechnicalAnalysis symbol={coin.symbol.toUpperCase()} />
          </div>
        </div>
      </div>

      <AddToPortfolioDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        coin={coin}
      />
    </div>
  );
};

export default CoinDetail; 