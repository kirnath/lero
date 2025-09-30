"use client"

import { useState, useEffect } from "react"
import { CheckCircle } from "lucide-react"

interface SolanaAddressDetectorProps {
  input: string
}

export function SolanaAddressDetector({ input }: SolanaAddressDetectorProps) {
  const [hasValidAddress, setHasValidAddress] = useState(false)

  useEffect(() => {
    // Check if input contains a valid Solana address (exactly 44 characters)
    const solanaAddressRegex = /\b[1-9A-HJ-NP-Za-km-z]{44}\b/g
    const matches = input.match(solanaAddressRegex)

    if (matches) {
      // Verify it's exactly 44 characters and valid base58
      const isValid = matches.some((match) => match.length === 44 && /^[1-9A-HJ-NP-Za-km-z]{44}$/.test(match))
      setHasValidAddress(isValid)
    } else {
      setHasValidAddress(false)
    }
  }, [input])

  // Only show indicator when a valid 44-character address is detected
  if (!hasValidAddress) return null

  return (
    <div className="flex items-center gap-2 text-xs font-mono mb-1 text-green-400/70">
      <CheckCircle className="w-3 h-3" />
      <span>Token address detected - analysis will include real-time data</span>
    </div>
  )
}
