// Function to extract Solana address from text
export function extractSolanaAddress(text: string): string | null {
  // Solana addresses can be 32-44 characters, but some platforms like pump.fun use extended formats
  // Allow 32-50 characters to accommodate various address formats
  const solanaAddressRegex = /\b[1-9A-HJ-NP-Za-km-z]{32,50}\b/g
  const matches = text.match(solanaAddressRegex)

  if (matches) {
    // Return the first valid address found
    for (const match of matches) {
      // Check if it's a valid length and valid base58 characters
      if (match.length >= 32 && match.length <= 50 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(match)) {
        return match
      }
    }
  }

  return null
}

// Function to check if message contains a Solana address
export function containsSolanaAddress(text: string): boolean {
  const address = extractSolanaAddress(text)
  return address !== null && address.length >= 32 && address.length <= 50
}

// Function to detect search queries
export function isSearchQuery(text: string): string | null {
  const searchPatterns = [/^search\s+(.+)$/i, /^find\s+(.+)$/i, /^look\s+for\s+(.+)$/i, /^!search\s+(.+)$/i]

  for (const pattern of searchPatterns) {
    const match = text.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  return null
}

// Function to detect wallet analysis queries
export function isWalletQuery(text: string): string | null {
  const walletPatterns = [
    /^wallet\s+([1-9A-HJ-NP-Za-km-z]{32,50})$/i,
    /^analyze\s+wallet\s+([1-9A-HJ-NP-Za-km-z]{32,50})$/i,
    /^check\s+wallet\s+([1-9A-HJ-NP-Za-km-z]{32,50})$/i,
    /^!wallet\s+([1-9A-HJ-NP-Za-km-z]{32,50})$/i,
    /^pnl\s+([1-9A-HJ-NP-Za-km-z]{32,50})$/i,
  ]

  for (const pattern of walletPatterns) {
    const match = text.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  return null
}
