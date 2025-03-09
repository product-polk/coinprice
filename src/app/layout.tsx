import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/ThemeProvider";
import Script from "next/script";
import { DbInitializer } from "@/components/DbInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CoinPrice - Cryptocurrency Tracker",
  description: "Track cryptocurrency prices and manage your portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-switcher" strategy="beforeInteractive">
          {`
            try {
              let isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
              let savedTheme = localStorage.getItem('theme');
              
              if (savedTheme === 'dark' || (!savedTheme && isDarkMode)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {
              console.error('Dark mode initialization failed:', e);
            }
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100`}>
        <ThemeProvider>
          <DbInitializer>
            {children}
          </DbInitializer>
        </ThemeProvider>
      </body>
    </html>
  );
}
