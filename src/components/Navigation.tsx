'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="flex space-x-6">
      <Link
        href="/"
        className={`text-sm font-medium transition-colors ${
          isActive('/') 
            ? 'text-white' 
            : 'text-gray-400 hover:text-white'
        }`}
      >
        Markets
      </Link>
      <Link
        href="/portfolio"
        className={`text-sm font-medium transition-colors ${
          isActive('/portfolio') 
            ? 'text-white' 
            : 'text-gray-400 hover:text-white'
        }`}
      >
        Portfolio
      </Link>
    </nav>
  );
};

export default Navigation; 