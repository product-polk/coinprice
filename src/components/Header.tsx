import React from 'react';
import Logo from './Logo';
import Navigation from './Navigation';

const Header = () => {
  return (
    <div className="border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Logo />
            <Navigation />
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Cryptocurrency Prices
            </h1>
            <p className="text-sm text-gray-400">
              Real-time market cap rankings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header; 