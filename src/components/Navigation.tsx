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
            ? 'text-blue-600 dark:text-blue-400 font-semibold' 
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
        }`}
      >
        Markets
      </Link>
      <Link
        href="/portfolio"
        className={`text-sm font-medium transition-colors ${
          isActive('/portfolio') 
            ? 'text-blue-600 dark:text-blue-400 font-semibold' 
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
        }`}
      >
        Portfolio
      </Link>
    </nav>
  );
};

export default Navigation; 