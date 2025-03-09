This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

[![Build Status](https://github.com/product-polk/coinprice/actions/workflows/deploy.yml/badge.svg)](https://github.com/product-polk/coinprice/actions/workflows/deploy.yml)

# CoinPrice - Cryptocurrency Portfolio Tracker

CoinPrice is a web application that allows users to track cryptocurrency prices and manage their crypto portfolios. The application provides real-time price data from the CoinGecko API and allows users to create and manage multiple portfolios of cryptocurrency holdings.

## Features

- **Real-time Cryptocurrency Data**: View up-to-date prices, market caps, and price changes for top cryptocurrencies.
- **Portfolio Management**: Create and manage multiple cryptocurrency portfolios.
- **Portfolio Holdings**: Track your holdings across different cryptocurrencies.
- **Performance Tracking**: Monitor the value and performance of your cryptocurrency investments.
- **Offline Support**: Built with client-side database storage for offline access to your portfolio data.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Technologies

- **Frontend**: React 19, Next.js 15
- **Styling**: TailwindCSS
- **Data Visualization**: Chart.js, react-chartjs-2
- **Local Database**: Dexie.js (IndexedDB wrapper)
- **Data Fetching**: CoinGecko API
- **TypeScript**: For type safety and better developer experience

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Usage

1. **Browse Cryptocurrencies**: View the list of top cryptocurrencies on the homepage.
2. **Create a Portfolio**: Navigate to the Portfolio section and create a new portfolio with a name and emoji.
3. **Add Holdings**: Add your cryptocurrency holdings to your portfolios by specifying the coin and amount.
4. **Track Performance**: Monitor the value and performance of your portfolios over time.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
