'use client';

import React, { useEffect, useRef } from 'react';

interface TechnicalAnalysisProps {
  symbol: string;
}

const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({ symbol }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = '';

    const isDarkMode = document.documentElement.classList.contains('dark');

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "interval": "1D",
        "width": "100%",
        "isTransparent": true,
        "height": "400",
        "symbol": "BINANCE:${symbol}USD",
        "showIntervalTabs": true,
        "locale": "en",
        "colorTheme": "${isDarkMode ? 'dark' : 'light'}"
      }`;

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol]);

  return (
    <div className="tradingview-widget-container h-[400px]" ref={container}>
      <div className="tradingview-widget-container__widget h-full"></div>
    </div>
  );
};

export default TechnicalAnalysis; 