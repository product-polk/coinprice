'use client';

import React, { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  onPriceUpdate?: (price: number) => void;
}

let tvScriptLoadingPromise: Promise<void>;

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol, onPriceUpdate }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const loadScript = () => {
      if (!tvScriptLoadingPromise) {
        tvScriptLoadingPromise = new Promise((resolve) => {
          const script = document.createElement('script');
          script.id = 'tradingview-widget-loading-script';
          script.src = 'https://s3.tradingview.com/tv.js';
          script.type = 'text/javascript';
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      }
      return tvScriptLoadingPromise;
    };

    const createWidget = () => {
      if (document.getElementById('tradingview_' + symbol)) return;

      const config = {
        autosize: true,
        symbol: 'BINANCE:' + symbol + 'USDT',
        interval: '1',
        timezone: 'exchange',
        theme: 'dark',
        style: '1',
        locale: 'en',
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        container_id: 'tradingview_' + symbol,
        studies: ['RSI@tv-basicstudies'],
        overrides: {
          'mainSeriesProperties.candleStyle.upColor': '#26a69a',
          'mainSeriesProperties.candleStyle.downColor': '#ef5350',
        },
      };

      const widget = new (window as any).TradingView.widget(config);

      if (onPriceUpdate) {
        widget.onChartReady(() => {
          widget.subscribe('onRealTimePriceUpdate', (data: any) => {
            if (data.price) {
              onPriceUpdate(data.price);
            }
          });
        });
      }
    };

    loadScript().then(createWidget);

    return () => {
      const containerElement = container.current;
      if (containerElement) {
        while (containerElement.firstChild) {
          containerElement.removeChild(containerElement.firstChild);
        }
      }
    };
  }, [symbol, onPriceUpdate]);

  return (
    <div
      ref={container}
      className="h-full"
    >
      <div id={`tradingview_${symbol}`} className="h-full" />
    </div>
  );
};

export default TradingViewWidget; 