'use client';

import React, { useState, useEffect } from 'react';
import { db, Portfolio, withDb } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  image: string;
}

interface AddToPortfolioDialogProps {
  isOpen: boolean;
  onClose: () => void;
  coin: CoinData;
}

const AddToPortfolioDialog: React.FC<AddToPortfolioDialogProps> = ({
  isOpen,
  onClose,
  coin,
}) => {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const portfolios = useLiveQuery<Portfolio[]>(() => db.portfolios.toArray(), []);

  useEffect(() => {
    // Set first portfolio as default when portfolios are loaded
    if (portfolios && portfolios.length > 0 && !selectedPortfolioId) {
      const firstPortfolio = portfolios[0];
      if (firstPortfolio && firstPortfolio.id !== undefined) {
        setSelectedPortfolioId(firstPortfolio.id);
      }
    }
  }, [portfolios, selectedPortfolioId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPortfolioId) {
      alert('Please select a portfolio');
      return;
    }
    
    setIsSubmitting(true);

    try {
      await withDb(async (db) => {
        await db.portfolio.add({
          portfolioId: selectedPortfolioId,
          coinId: coin.id,
          coinSymbol: coin.symbol,
          coinName: coin.name,
          amount: parseFloat(amount),
          timestamp: new Date(),
        });
      });
      onClose();
      setAmount('');
    } catch (error) {
      console.error('Error adding to portfolio:', error);
      alert('Failed to add to portfolio. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!portfolios || portfolios.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            No Portfolios Available
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You need to create a portfolio before adding coins.
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Add {coin.name} to Portfolio
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Portfolio
            </label>
            <select
              value={selectedPortfolioId || ''}
              onChange={(e) => setSelectedPortfolioId(Number(e.target.value))}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
              required
            >
              <option value="" disabled>Select a portfolio</option>
              {portfolios.map((portfolio) => (
                <option key={portfolio.id} value={portfolio.id}>
                  {portfolio.emoji} {portfolio.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount ({coin.symbol.toUpperCase()})
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
                placeholder="0.00"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                ≈ ${amount ? (parseFloat(amount) * coin.current_price).toFixed(2) : '0.00'}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !amount || !selectedPortfolioId}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? 'Adding...' : 'Add to Portfolio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddToPortfolioDialog; 