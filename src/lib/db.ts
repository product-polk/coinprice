import Dexie, { Table } from 'dexie';

export interface Portfolio {
  id?: number;
  name: string;
  emoji: string;
  createdAt: Date;
}

export interface PortfolioHolding {
  id?: number;
  portfolioId: number;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  amount: number;
  timestamp: Date;
}

export class CoinDatabase extends Dexie {
  portfolios!: Table<Portfolio>;
  portfolio!: Table<PortfolioHolding>;

  constructor() {
    super('CoinDatabase');
    
    this.version(1).stores({
      portfolio: '++id, coinId, coinSymbol, coinName, amount, timestamp'
    });
    
    this.version(2).stores({
      portfolios: '++id, name, emoji, createdAt',
      portfolio: '++id, portfolioId, coinId, coinSymbol, coinName, amount, timestamp'
    }).upgrade(tx => {
      // Create a default portfolio
      tx.table('portfolios').add({
        name: 'My Portfolio',
        emoji: '💰',
        createdAt: new Date()
      }).then(portfolioId => {
        // Migrate existing holdings to the default portfolio
        return tx.table('portfolio').toCollection().modify(holding => {
          holding.portfolioId = portfolioId;
        });
      });
    });
  }

  // Utility function to ensure database is open
  async ensureOpen() {
    if (!this.isOpen()) {
      console.log('Database was closed, reopening...');
      await this.open();
    }
    return this;
  }
}

export const db = new CoinDatabase();

// Helper function to ensure the database is open before any operation
export async function withDb<T>(operation: (db: CoinDatabase) => Promise<T>): Promise<T> {
  try {
    await db.ensureOpen();
    return await operation(db);
  } catch (error) {
    if (error instanceof Error && error.message.includes('closed')) {
      // If we get a "closed" error during the operation, try to reopen and retry once
      console.log('Encountered closed database during operation, reopening and retrying...');
      await db.open();
      return await operation(db);
    }
    throw error;
  }
} 