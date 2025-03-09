'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db';

export function useInitializeDb() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeDb = async () => {
      try {
        // Open the database to trigger upgrades
        await db.open();
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    initializeDb();

    // Don't close the database on cleanup as it needs to remain open
    // for the lifetime of the application
    return () => {
      // We intentionally don't close the database here
      // db.close() would cause issues when components re-render
    };
  }, []);

  return { isInitialized, error };
} 