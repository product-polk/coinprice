import Dexie, { Table } from 'dexie';

export interface PortfolioHolding {
  id?: number;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  amount: number;
  timestamp: Date;
}

export class CoinDatabase extends Dexie {
  portfolio!: Table<PortfolioHolding>;

  constructor() {
    super('CoinDatabase');
    this.version(1).stores({
      portfolio: '++id, coinId, coinSymbol, coinName, amount, timestamp'
    });
  }
}

export const db = new CoinDatabase(); 