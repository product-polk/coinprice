'use client';

import CoinDetail from '@/components/CoinDetail';
import Header from '@/components/Header';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: { large: string };
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
    price_change_percentage_24h: number;
    circulating_supply: number;
  };
  market_cap_rank: number;
  description: { en: string };
  links: {
    homepage: string[];
    blockchain_site: string[];
    official_forum_url: string[];
    twitter_screen_name: string;
    telegram_channel_identifier: string;
    subreddit_url: string;
  };
}

async function getCoinData(id: string): Promise<CoinData> {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
  );

  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error('Failed to fetch coin data');
  }

  return response.json();
}

export async function generateStaticParams() {
  // Pre-render the most popular coins
  const popularCoins = ['bitcoin', 'ethereum', 'binancecoin', 'ripple', 'cardano'];
  return popularCoins.map((id) => ({
    id,
  }));
}

const CoinPage = ({ params }: { params: { id: string } }) => {
  const [coinData, setCoinData] = useState<CoinData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const data = await getCoinData(params.id);
        setCoinData(data);
      } catch (err) {
        setError('Failed to fetch coin data');
        console.error('Error fetching coin data:', err);
      }
    };

    fetchInitialData();

    // Set up periodic updates
    const updateInterval = setInterval(async () => {
      try {
        const data = await getCoinData(params.id);
        setCoinData(data);
      } catch (err) {
        console.error('Error updating coin data:', err);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(updateInterval);
  }, [params.id]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!coinData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  const formattedCoin = {
    id: coinData.id,
    symbol: coinData.symbol,
    name: coinData.name,
    image: coinData.image.large,
    current_price: coinData.market_data.current_price.usd,
    market_cap: coinData.market_data.market_cap.usd,
    total_volume: coinData.market_data.total_volume.usd,
    high_24h: coinData.market_data.high_24h.usd,
    low_24h: coinData.market_data.low_24h.usd,
    price_change_percentage_24h: coinData.market_data.price_change_percentage_24h,
    market_cap_rank: coinData.market_cap_rank,
    circulating_supply: coinData.market_data.circulating_supply,
    description: coinData.description,
    links: {
      homepage: coinData.links.homepage,
      blockchain_site: coinData.links.blockchain_site,
      official_forum_url: coinData.links.official_forum_url,
      twitter_screen_name: coinData.links.twitter_screen_name,
      telegram_channel_identifier: coinData.links.telegram_channel_identifier,
      subreddit_url: coinData.links.subreddit_url,
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(100,50,255,0.1),transparent_50%)]"></div>
      <div className="relative">
        <Header />
        <CoinDetail coin={formattedCoin} />
      </div>
    </main>
  );
};

export default CoinPage; 