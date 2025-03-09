'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';

interface AddToPortfolioDialogProps {
  isOpen: boolean;
  onClose: () => void;
  coin: {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
  };
}

const AddToPortfolioDialog: React.FC<AddToPortfolioDialogProps> = ({
  isOpen,
  onClose,
  coin,
}) => {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await db.portfolio.add({
        coinId: coin.id,
        coinSymbol: coin.symbol,
        coinName: coin.name,
        amount: parseFloat(amount),
        timestamp: new Date(),
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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 rounded-2xl border border-white/10 p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">
          Add {coin.name} to Portfolio
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Amount ({coin.symbol.toUpperCase()})
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                placeholder="0.00"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                ≈ ${amount ? (parseFloat(amount) * coin.current_price).toFixed(2) : '0.00'}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
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