"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface TrendingToken {
  address: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  icon: string;
  uri: string;
}
interface solPrice {
  price: number;
  priceQuote: number;
  liquidity: number;
  marketCap: number;
  lastUpdated: number;
  priceChanges: {
    ["24h"]: {
      priceChangePercentage: number;
    };
  };
}

export function TerminalHeader() {
  const [currentTime, setCurrentTime] = useState("");
  const [solPrice, setSolPrice] = useState<solPrice | null>(null);
  const [LeroPrice, setLeroPrice] = useState<solPrice | null>(null);

  // Mock trending tokens data (in a real app, you'd fetch from an API)
  const [trendingTokens, setTrendingTokens] = useState<TrendingToken[]>([
    // { symbol: "BRETT", name: "BRETT", price: 0.098, change: 11.5, icon: "🐸" },
    // { symbol: "GRIME", name: "GRIME", price: 55.7, change: 8.2, icon: "🎭" },
    // { symbol: "PACA", name: "PACA", price: 0.18, change: -3.4, icon: "🦙" },
    // { symbol: "MANYU", name: "MANYU", price: 317.7, change: 15.8, icon: "🐱" },
    // { symbol: "KTR", name: "KTR", price: 324.9, change: 12.2, icon: "⚡" },
    // { symbol: "BNNG", name: "BNNG", price: 41.5, change: -7.1, icon: "🍌" },
    // { symbol: "VIRTUAL", name: "VIRTUAL", price: 1.18, change: 9.7, icon: "🤖" },
    // { symbol: "AERO", name: "AERO", price: 630.7, change: -4.3, icon: "✈️" },
    // { symbol: "DEGEN", name: "DEGEN", price: 0.019, change: 6.8, icon: "🎲" },
    // { symbol: "BRETT", name: "BRETT", price: 0.098, change: 11.5, icon: "🐸" },
    // { symbol: "GRIME", name: "GRIME", price: 55.7, change: 8.2, icon: "🎭" },
    // { symbol: "PACA", name: "PACA", price: 0.18, change: -3.4, icon: "🦙" },
  ]);

  useEffect(() => {
    const getTrending = async () => {
      const response = await fetch("/api/trending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setTrendingTokens(
        data.map((item: any) => ({
          address: item.token.mint,
          symbol: item.token.symbol.replace("$", ""),
          name: item.token.name,
          price: item.pools[0].price.usd,
          change: item.events["24h"].priceChangePercentage,
          icon: item.token.image,
          uri: item.token.uri,
        }))
      );
    };
    getTrending();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updatePrice = async () => {
      const response = await fetch("/api/solPrice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      setSolPrice(result);
    };
    updatePrice();
    const interval = setInterval(updatePrice, 300000);
    return () => clearInterval(interval);
  }, []);
    useEffect(() => {
    const updatePrice = async () => {
      const response = await fetch("/api/LeroPrice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      setLeroPrice(result);
    };
    updatePrice();
    const interval = setInterval(updatePrice, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black text-green-400">
      {/* Main header with SOL price and time */}
      <div className="border-b border-green-400/30 p-4 flex items-center justify-between bg-gradient-to-r from-green-900/20 to-black">
        <div className="flex items-center gap-4 text-xs font-mono">
          {solPrice && (
            <div className="text-green-400">
              SOL: ${solPrice.price.toFixed(2)}{" "}
              <span
  className={
    solPrice?.priceChanges?.["24h"]?.priceChangePercentage >= 0
      ? "text-green-400"
      : "text-red-400"
  }
>
  {typeof solPrice?.priceChanges?.["24h"]?.priceChangePercentage === "number"
    ? `${solPrice.priceChanges["24h"].priceChangePercentage >= 0 ? "+" : ""}${solPrice.priceChanges["24h"].priceChangePercentage.toFixed(1)}%`
    : "N/A"}
</span>

            </div>
          )}
          {LeroPrice && (
            <div className="text-green-400">
              Lero: ${LeroPrice.price.toFixed(6)}{" "}
            </div>
          )}
          <div className="text-green-300">{currentTime}</div>
        </div>
      </div>

      {/* Trending tokens marquee */}
      <div className="bg-black border-b border-green-400/30 py-1 overflow-hidden relative">
        <div className="flex items-center">
          <div className="text-green-400 font-mono text-xs px-4 py-1 bg-green-400/10 border-r border-green-400/30 flex-shrink-0">
            TRENDING
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="animate-marquee flex items-center gap-6 whitespace-nowrap">
              {/* Duplicate the tokens array to create seamless loop */}
              {[...trendingTokens, ...trendingTokens].map((token, index) => (
                <a
                    key={index}
                    href={`https://dexscreener.com/solana/${token.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0"
                >
                    <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-white">
                        {token.icon ? (
                        <Image
                            src={decodeURIComponent(
                            token.icon.replace(
                                "https://image.solanatracker.io/proxy?url=",
                                ""
                            )
                            ).replace("cf-ipfs.com", "ipfs.io")}
                            width={20}
                            height={20}
                            alt="logo"
                        />
                        ) : token.uri ? (
                        <Image src={token.uri} width={20} height={20} alt="logo" />
                        ) : null}
                    </span>
                    <span className="text-green-300">{token.symbol}</span>
                    <span className="text-white">
                        $
                        {token.price < 1
                        ? token.price.toFixed(4)
                        : token.price.toFixed(2)}
                    </span>
                    <span
                        className={
                        token.change >= 0 ? "text-green-400" : "text-red-400"
                        }
                    >
                        {token.change >= 0 ? "+" : ""}
                        {token.change != null ? `${token.change.toFixed(1)}%` : ''}
                    </span>
                    </div>
                </a>
                ))}

            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
      `}</style>
    </div>
  );
}
