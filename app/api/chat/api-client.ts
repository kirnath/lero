import type { TokenData, ATHData, SearchResponse, WalletData } from "./types"

// Function to fetch token data from your custom API
export async function fetchTokenData(mintAddress: string): Promise<TokenData | null> {
  try {
    if (!process.env.BACKEND_API_URL) {
      console.log("No BACKEND_API_URL configured, skipping token data fetch")
      return null
    }

    const response = await fetch(`${process.env.BACKEND_API_URL}/tokens/${mintAddress}`, {
      headers: {
        ...(process.env.BACKEND_API_KEY && { "x-api-key": `${process.env.BACKEND_API_KEY}` }),
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching token data:", error)
    return null
  }
}

// Function to fetch token ATH data
export async function fetchTokenATH(mintAddress: string): Promise<ATHData | null> {
  try {
    if (!process.env.BACKEND_API_URL) {
      console.log("No BACKEND_API_URL configured, skipping ATH data fetch")
      return null
    }

    const response = await fetch(`${process.env.BACKEND_API_URL}/tokens/${mintAddress}/ath`, {
      headers: {
        ...(process.env.BACKEND_API_KEY && { "x-api-key": `${process.env.BACKEND_API_KEY}` }),
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`ATH API responded with status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching ATH data:", error)
    return null
  }
}

// Function to search tokens
export async function searchTokens(query: string): Promise<SearchResponse | null> {
  try {
    if (!process.env.BACKEND_API_URL) {
      console.log("No BACKEND_API_URL configured, skipping token search")
      return null
    }

    const response = await fetch(`${process.env.BACKEND_API_URL}/search?query=${encodeURIComponent(query)}`, {
      headers: {
        ...(process.env.BACKEND_API_KEY && { "x-api-key": `${process.env.BACKEND_API_KEY}` }),
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Search API responded with status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error searching tokens:", error)
    return null
  }
}

// Function to fetch wallet data and PnL chart
export async function fetchWalletData(walletAddress: string): Promise<WalletData | null> {
  try {
    if (!process.env.BACKEND_API_URL) {
      console.log("No BACKEND_API_URL configured, skipping wallet data fetch")
      return null
    }

    const response = await fetch(`${process.env.BACKEND_API_URL}/wallet/${walletAddress}/chart`, {
      headers: {
        ...(process.env.BACKEND_API_KEY && { "x-api-key": `${process.env.BACKEND_API_KEY}` }),
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.log(response)
      throw new Error(`Wallet API responded with status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching wallet data:", error)
    return null
  }
}
