export interface TokenData {
  token: {
    name: string
    symbol: string
    mint: string
    decimals: number
    description: string
    createdOn: string
    website?: string
    twitter?: string
    telegram?: string
    creation?: {
      creator: string
      created_time: number
    },
    image?: string
  }
  pools: Array<{
    poolId: string
    market: string
    price?: {
      usd: number
    }
    marketCap?: {
      usd: number
    }
    tokenSupply: number
    liquidity?: {
      usd: number
    }
    lpBurn: number
    txns?: {
      volume24h: number
      volume: number
      buys: number
      sells: number
      volume5m?: number
      volume1h?: number
      volume6h?: number
    }
    security?: {
      freezeAuthority: string | null
      mintAuthority: string | null
    }
  }>
  events: {
    [key: string]: {
      priceChangePercentage: number
    }
  }
  risk: {
    score: number
    rugged: boolean
    top10: number
    snipers?: {
      count: number
      totalPercentage: number
    }
    insiders?: {
      count: number
      totalPercentage: number
    }
  }
  holders: number
  buys: number
  sells: number
  txns: number
}

export interface ATHData {
  highest_price: number
  highest_market_cap: number
  timestamp: number
  pool_id: string
}

export interface SearchResult {
  id: string
  name: string
  symbol: string
  mint: string
  image: string
  decimals: number
  hasSocials: boolean
  poolAddress: string
  liquidityUsd: number
  marketCapUsd: number
  priceUsd: number
  lpBurn: number
  market: string
  quoteToken: string
  freezeAuthority: string | null
  mintAuthority: string | null
  deployer: string
  status: string
  createdAt: number
  lastUpdated: number
  holders: number
  buys: number
  sells: number
  totalTransactions: number
  volume: number
  volume_5m: number
  volume_15m: number
  volume_30m: number
  volume_1h: number
  volume_6h: number
  volume_12h: number
  volume_24h: number
  tokenDetails: {
    creator: string
    tx: string
    time: number
  }
}

export interface SearchResponse {
  status: string
  data: SearchResult[]
  total: number
  pages: number
  page: number
}

export interface WalletChartData {
  date: string
  value: number
  timestamp: number
  pnlPercentage: number
}

export interface WalletPnL {
  "24h": {
    value: number
    percentage: number
  }
  "30d": {
    value: number
    percentage: number
  }
}

export interface WalletData {
  chartData: WalletChartData[]
  pnl: WalletPnL
}
export interface TimeframeStats {
  buyers: number
  sellers: number
  volume: {
    buys: number
    sells: number
    total: number
  }
  transactions: number
  buys: number
  sells: number
  wallets: number
  price: number
  priceChangePercentage: number
}
export interface TokenStatsResponse {
  "15m"?: TimeframeStats
  "30m"?: TimeframeStats
  "1h"?: TimeframeStats
  "2h"?: TimeframeStats
  "3h"?: TimeframeStats
  "4h"?: TimeframeStats
  "5h"?: TimeframeStats
  "6h"?: TimeframeStats
  "12h"?: TimeframeStats
  "24h"?: TimeframeStats
}