'use client';

import React, { ReactNode, useEffect } from 'react';
import { useInitializeDb } from '@/hooks/useInitializeDb';
import { db } from '@/lib/db';

interface DbInitializerProps {
  children: ReactNode;
}

export function DbInitializer({ children }: DbInitializerProps) {
  const { isInitialized, error } = useInitializeDb();

  // If we get a "database closed" error, try to reopen it
  useEffect(() => {
    if (error && error.message.includes('closed')) {
      // Try to reopen the database
      const reopenDb = async () => {
        try {
          console.log('Attempting to reopen the database...');
          if (!db.isOpen()) {
            await db.open();
            console.log('Database reopened successfully');
            // Force a reload of the page to reinitialize all data connections
            window.location.reload();
          }
        } catch (err) {
          console.error('Failed to reopen database:', err);
        }
      };
      
      reopenDb();
    }
  }, [error]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg max-w-md">
          <h1 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Database Error</h1>
          <p className="text-red-600 dark:text-red-300">{error.message}</p>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Please try refreshing the page or clearing your browser data if the problem persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400 dark:border-blue-600 border-t-transparent dark:border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Initializing database...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 