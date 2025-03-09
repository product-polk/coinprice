'use client';

import React from 'react';

interface ExchangeLinksProps {
  coinSymbol: string;
  coinName: string;
}

interface ExchangeInfo {
  name: string;
  url: string;
  logo: string;
  color: string;
}

const ExchangeLinks: React.FC<ExchangeLinksProps> = ({ coinSymbol, coinName }) => {
  // Prepare the coin symbol for URL construction (lowercase)
  const symbol = coinSymbol.toLowerCase();
  
  // Define exchanges with their URLs and branding colors
  const exchanges: ExchangeInfo[] = [
    {
      name: 'Coinbase',
      url: `https://www.coinbase.com/price/${symbol}`,
      logo: 'https://seeklogo.com/images/C/coinbase-coin-logo-C86F46D7B8-seeklogo.com.png',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Binance',
      url: `https://www.binance.com/en/trade/${symbol.toUpperCase()}_USDT`,
      logo: 'https://seeklogo.com/images/B/binance-coin-bnb-logo-CD94CC6D31-seeklogo.com.png',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      name: 'Bybit',
      url: `https://www.bybit.com/en-US/trade/spot/${symbol.toUpperCase()}/USDT`,
      logo: 'https://www.bybit.com/favicon.ico',
      color: 'bg-gray-800 hover:bg-gray-900'
    },
    {
      name: 'Kraken',
      url: `https://www.kraken.com/prices/${symbol}`,
      logo: 'https://www.kraken.com/favicon.ico',
      color: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      name: 'KuCoin',
      url: `https://www.kucoin.com/trade/${symbol.toUpperCase()}-USDT`,
      logo: 'https://cryptologos.cc/logos/kucoin-token-kcs-logo.png',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      name: 'OKX',
      url: `https://www.okx.com/trade-spot/${symbol}-usdt`,
      logo: 'https://cryptologos.cc/logos/okb-okb-logo.png',
      color: 'bg-blue-500 hover:bg-blue-600'
    }
  ];

  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Buy {coinName}</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        You can buy {coinName} ({coinSymbol.toUpperCase()}) from various cryptocurrency exchanges. Click any of the links below to open the exchange in a new tab.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {exchanges.map((exchange, index) => (
          <a
            key={index}
            href={exchange.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-between p-4 rounded-xl ${exchange.color} text-white transition-transform transform hover:scale-105`}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center mr-3">
                <img 
                  src={exchange.logo} 
                  alt={`${exchange.name} logo`} 
                  className="w-7 h-7 object-contain"
                />
              </div>
              <span className="font-medium">{exchange.name}</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Important Notice</h3>
        <p className="text-gray-700 dark:text-gray-300">
          We do not endorse any particular exchange. Please do your own research before choosing an exchange. Always verify the exchange's reputation, security features, fees, and available services.
        </p>
      </div>
    </div>
  );
};

export default ExchangeLinks; 