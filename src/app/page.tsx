import CoinList from '@/components/CoinList';
import Header from '@/components/Header';

async function getCoins() {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h,24h,7d',
    { next: { revalidate: 300 } }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch coins');
  }

  return response.json();
}

export default async function Home() {
  const coins = await getCoins();

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <div className="relative">
        <Header />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CoinList coins={coins} />
        </div>
      </div>
    </main>
  );
}
