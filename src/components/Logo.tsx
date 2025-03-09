import React from 'react';
import Link from 'next/link';

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg group-hover:-rotate-6 transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/40 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            CP
          </div>
        </div>
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        CoinPrice
      </span>
    </Link>
  );
};

export default Logo; 