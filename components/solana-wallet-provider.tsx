"use client"

import "@solana/wallet-adapter-react-ui/styles.css"

import type { ReactNode } from "react"
import { useCallback, useMemo } from "react"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { clusterApiUrl } from "@solana/web3.js"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import type { WalletError } from "@solana/wallet-adapter-base"

interface SolanaWalletProviderProps {
  children: ReactNode
}

export function SolanaWalletProvider({ children }: SolanaWalletProviderProps) {
  const endpoint = useMemo(() => {
    const customEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC?.trim()
    return customEndpoint && customEndpoint.length > 0 ? customEndpoint : clusterApiUrl("mainnet-beta")
  }, [])

  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], [])

  const handleError = useCallback((error: WalletError) => {
    console.error("Solana wallet error:", error)
  }, [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect onError={handleError}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
