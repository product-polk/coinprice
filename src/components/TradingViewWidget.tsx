'use client';

import React, { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clean up any existing widgets
    container.current.innerHTML = '';

    // Check if we're in dark mode
    const isDarkMode = document.documentElement.classList.contains('dark');

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "width": "100%",
        "height": "900",
        "autosize": false,
        "symbol": "BINANCE:${symbol}USD",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "${isDarkMode ? 'dark' : 'light'}",
        "style": "3",
        "locale": "en",
        "enable_publishing": false,
        "gridColor": "${isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}",
        "hide_top_toolbar": true,
        "hide_legend": false,
        "save_image": false,
        "calendar": false,
        "hide_volume": false,
        "support_host": "https://www.tradingview.com",
        "toolbar_bg": "rgba(0, 0, 0, 0)",
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "studies": [
          "RSI@tv-basicstudies",
          "MASimple@tv-basicstudies",
          "MACD@tv-basicstudies"
        ]
      }`;

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol]);

  return (
    <div className="tradingview-widget-container w-full h-[900px]" ref={container}>
      <div className="tradingview-widget-container__widget w-full h-full"></div>
    </div>
  );
};

export default TradingViewWidget; 