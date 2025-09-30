import type { TokenData, ATHData, SearchResponse, WalletData } from "./types"

// Function to format token data for AI analysis
export function formatTokenDataForAI(tokenData: TokenData, athData: ATHData | null = null): string {
  if (!tokenData) return "Unable to fetch token data from API."

  const { token, pools, events, risk, holders, buys, sells, txns } = tokenData

  let athSection = ""
  if (athData) {
    const athDate = athData.timestamp ? new Date(athData.timestamp * 1000).toLocaleString() : "N/A"
    const currentPrice = pools[0]?.price?.usd || 0
    const athPrice = athData.highest_price || 0
    const distanceFromATH = athPrice > 0 ? (((athPrice - currentPrice) / athPrice) * 100).toFixed(2) : "N/A"

    // Red warning if very far from ATH (>90%)
    const athWarning = Number.parseFloat(distanceFromATH) > 90 ? "🔴 EXTREME DISTANCE FROM ATH" : ""

    athSection = `
ALL-TIME HIGH DATA:
- Highest Price: $${athPrice?.toFixed(8) || "N/A"}
- Highest Market Cap: $${athData.highest_market_cap?.toLocaleString() || "N/A"}
- ATH Date: ${athDate}
- Distance from ATH: ${distanceFromATH}% below ATH ${athWarning}
- Pool ID: ${athData.pool_id || "N/A"}
`
  }

  // Calculate some additional metrics
  const currentPrice = pools[0]?.price?.usd || 0
  const marketCap = pools[0]?.marketCap?.usd || 0
  const liquidity = pools[0]?.liquidity?.usd || 0
  const volume24h = pools[0]?.txns?.volume24h || 0

  // Liquidity to market cap ratio
  const liquidityRatio = marketCap > 0 ? ((liquidity / marketCap) * 100).toFixed(2) : "N/A"
  const liquidityWarning = Number.parseFloat(liquidityRatio) < 5 ? "🔴 LOW LIQUIDITY RATIO" : ""

  // Top 10 holders warning
  const top10Warning =
    risk.top10 > 50 ? "🔴 HIGH CONCENTRATION RISK" : risk.top10 > 30 ? "🟡 MODERATE CONCENTRATION" : ""

  // Risk score warnings
  const riskWarning = risk.score > 70 ? "🔴 HIGH RISK" : risk.score > 40 ? "🟡 MEDIUM RISK" : ""

  // Sniper/Insider warnings
  const sniperWarning = (risk.snipers?.totalPercentage || 0) > 10 ? "🔴 HIGH SNIPER ACTIVITY" : ""
  const insiderWarning = (risk.insiders?.totalPercentage || 0) > 15 ? "🔴 HIGH INSIDER ACTIVITY" : ""

  // Authority warnings
  const freezeWarning =
    pools[0]?.security?.freezeAuthority && pools[0]?.security?.freezeAuthority !== "None"
      ? "🔴 FREEZE AUTHORITY ACTIVE"
      : ""
  const mintWarning =
    pools[0]?.security?.mintAuthority && pools[0]?.security?.mintAuthority !== "None" ? "🔴 MINT AUTHORITY ACTIVE" : ""

  // Liquidity health warning
  const liquidityHealthWarning = liquidity < 5000 ? "🔴 LOW LIQUIDITY" : ""

  // Volume warning
  const volumeRatio = marketCap > 0 && volume24h > 0 ? (volume24h / marketCap) * 100 : 0
  const volumeWarning = volumeRatio < 1 ? "🔴 LOW TRADING VOLUME" : ""

  return `
TOKEN ANALYSIS DATA:
==================

BASIC INFO:
- Name: ${token.name}
- Symbol: ${token.symbol}
- Mint Address: ${token.mint}
- Decimals: ${token.decimals}
- Description: ${token.description || "No description available"}
- Created On: ${token.createdOn}
- Creator: ${token.creation?.creator || "N/A"}
- Created Time: ${token.creation?.created_time ? new Date(token.creation.created_time * 1000).toLocaleString() : "N/A"}

SOCIAL LINKS:
- Website: ${token.website || "N/A"}
- Twitter: ${token.twitter || "N/A"}
- Telegram: ${token.telegram || "N/A"}

MARKET DATA:
- Current Price (USD): $${currentPrice?.toFixed(8) || "N/A"}
- Market Cap (USD): $${marketCap?.toLocaleString() || "N/A"}
- Total Supply: ${pools[0]?.tokenSupply?.toLocaleString() || "N/A"}
- Holders: ${holders?.toLocaleString() || "N/A"}
- Liquidity to Market Cap Ratio: ${liquidityRatio}% ${liquidityWarning}

${athSection}

LIQUIDITY POOLS:
${pools
  .map(
    (pool, index) => `
Pool ${index + 1} (${pool.market}):
- Pool ID: ${pool.poolId}
- Liquidity (USD): $${pool.liquidity?.usd?.toLocaleString() || "N/A"} ${pool.liquidity?.usd && pool.liquidity.usd < 5000 ? "🔴 LOW" : ""}
- LP Burn: ${pool.lpBurn}% ${pool.lpBurn < 50 ? "🔴 LOW LP BURN" : pool.lpBurn < 80 ? "🟡 MODERATE LP BURN" : "✅"}
- Volume 24h: $${pool.txns?.volume24h?.toLocaleString() || "N/A"}
- Total Volume: $${pool.txns?.volume?.toLocaleString() || "N/A"}
- Recent Buys: ${pool.txns?.buys?.toLocaleString() || "N/A"}
- Recent Sells: ${pool.txns?.sells?.toLocaleString() || "N/A"}
`,
  )
  .join("")}

PRICE CHANGES:
- 1m: ${events["1m"]?.priceChangePercentage?.toFixed(2) || "0.00"}% ${Math.abs(events["1m"]?.priceChangePercentage || 0) > 20 ? "🔴 VOLATILE" : ""}
- 5m: ${events["5m"]?.priceChangePercentage?.toFixed(2) || "0.00"}% ${Math.abs(events["5m"]?.priceChangePercentage || 0) > 30 ? "🔴 VOLATILE" : ""}
- 15m: ${events["15m"]?.priceChangePercentage?.toFixed(2) || "0.00"}% ${Math.abs(events["15m"]?.priceChangePercentage || 0) > 40 ? "🔴 VOLATILE" : ""}
- 1h: ${events["1h"]?.priceChangePercentage?.toFixed(2) || "0.00"}% ${Math.abs(events["1h"]?.priceChangePercentage || 0) > 50 ? "🔴 VOLATILE" : ""}
- 6h: ${events["6h"]?.priceChangePercentage?.toFixed(2) || "0.00"}% ${Math.abs(events["6h"]?.priceChangePercentage || 0) > 70 ? "🔴 VOLATILE" : ""}
- 24h: ${events["24h"]?.priceChangePercentage?.toFixed(2) || "0.00"}% ${Math.abs(events["24h"]?.priceChangePercentage || 0) > 80 ? "🔴 VOLATILE" : ""}

SECURITY & RISK ANALYSIS:
- Risk Score: ${risk.score}/100 ${risk.score <= 20 ? "(Low risk ✅)" : risk.score <= 50 ? "(Medium risk 🟡)" : "(High risk 🔴)"} ${riskWarning}
- Rugged: ${risk.rugged ? "YES 🔴 RUGGED" : "NO ✅"}
- Top 10 Holders: ${risk.top10}% of total supply ${top10Warning}
- Snipers: ${risk.snipers?.count || 0} wallets (${risk.snipers?.totalPercentage?.toFixed(2) || "0.00"}%) ${sniperWarning}
- Insiders: ${risk.insiders?.count || 0} wallets (${risk.insiders?.totalPercentage?.toFixed(2) || "0.00"}%) ${insiderWarning}
- Freeze Authority: ${pools[0]?.security?.freezeAuthority || "None ✅"} ${freezeWarning}
- Mint Authority: ${pools[0]?.security?.mintAuthority || "None ✅"} ${mintWarning}

RECENT ACTIVITY:
- Recent Buys: ${buys || 0}
- Recent Sells: ${sells || 0}
- Total Recent Transactions: ${txns || 0}
- Buy/Sell Ratio: ${sells > 0 ? (buys / sells).toFixed(2) : "N/A"} ${sells > 0 && buys / sells < 0.5 ? "🔴 SELL PRESSURE" : ""}

TRADING METRICS:
- Volume to Market Cap Ratio: ${marketCap > 0 && volume24h > 0 ? ((volume24h / marketCap) * 100).toFixed(2) : "N/A"}% ${volumeWarning}
- Liquidity Health: ${liquidity > 10000 ? "Good ✅" : liquidity > 5000 ? "Moderate 🟡" : "Low 🔴"} ${liquidityHealthWarning}

🔴 RED FLAGS SUMMARY:
${
  [
    athSection.includes("🔴") ? "- Extreme distance from ATH (>90%)" : "",
    liquidityWarning ? "- Low liquidity ratio (<5%)" : "",
    top10Warning.includes("🔴") ? "- High holder concentration (>50%)" : "",
    riskWarning ? "- High risk score (>70)" : "",
    sniperWarning ? "- High sniper activity (>10%)" : "",
    insiderWarning ? "- High insider activity (>15%)" : "",
    freezeWarning ? "- Freeze authority is active" : "",
    mintWarning ? "- Mint authority is active" : "",
    liquidityHealthWarning ? "- Low liquidity (<$5,000)" : "",
    volumeWarning ? "- Low trading volume (<1% of market cap)" : "",
    pools.some((pool) => pool.lpBurn < 50) ? "- Low LP burn (<50%)" : "",
  ]
    .filter((flag) => flag)
    .join("\n") || "- No major red flags detected ✅"
}
`
}

// Function to format search results for AI
export function formatSearchResultsForAI(searchData: SearchResponse | null): string {
  if (!searchData || !searchData.data || searchData.data.length === 0) {
    return "No tokens found matching the search query."
  }

  const results = searchData.data.slice(0, 5) // Limit to top 5 results

  return `
SEARCH RESULTS:
==============

Found ${searchData.total} tokens matching your query. Here are the top ${results.length} results:

${results
  .map((token, index) => {
    // Risk assessments for search results
    const liquidityWarning = token.liquidityUsd < 5000 ? "🔴 LOW LIQUIDITY" : ""
    const lpBurnWarning = token.lpBurn < 50 ? "🔴 LOW LP BURN" : ""
    const authorityWarning = token.freezeAuthority !== null || token.mintAuthority !== null ? "🔴 AUTHORITY RISK" : ""

    return `
${index + 1}. ${token.name} (${token.symbol})
   ┌─────────────────────────────────────────────────────────────
   │ Mint Address: ${token.mint}
   │ Current Price: $${token.priceUsd?.toFixed(8) || "N/A"}
   │ Market Cap: $${token.marketCapUsd?.toLocaleString() || "N/A"}
   │ Liquidity: $${token.liquidityUsd?.toLocaleString() || "N/A"} ${liquidityWarning}
   │ Holders: ${token.holders?.toLocaleString() || "N/A"}
   │ Market: ${token.market || "N/A"}
   │ LP Burn: ${token.lpBurn || 0}% ${lpBurnWarning}
   │ Volume 24h: $${token.volume_24h?.toLocaleString() || "N/A"}
   │ Created: ${token.createdAt ? new Date(token.createdAt * 1000).toLocaleDateString() : "N/A"}
   │ Security: ${token.freezeAuthority === null && token.mintAuthority === null ? "✅ Good" : "🔴 Check Authorities"} ${authorityWarning}
   └─────────────────────────────────────────────────────────────
`
  })
  .join("")}

SEARCH SUMMARY:
- Total Results: ${searchData.total}
- Current Page: ${searchData.page}/${searchData.pages}
- Results Shown: ${results.length}

🔴 SEARCH WARNINGS:
${results.some((token) => token.liquidityUsd < 5000) ? "- Some tokens have low liquidity (<$5,000)" : ""}
${results.some((token) => token.lpBurn < 50) ? "- Some tokens have low LP burn (<50%)" : ""}
${results.some((token) => token.freezeAuthority !== null || token.mintAuthority !== null) ? "- Some tokens have active authorities" : ""}
${results.every((token) => token.liquidityUsd >= 5000 && token.lpBurn >= 50 && token.freezeAuthority === null && token.mintAuthority === null) ? "- No major warnings for displayed tokens ✅" : ""}
`
}

// Function to format wallet data for AI analysis
export function formatWalletDataForAI(walletData: WalletData): string {
  if (!walletData || !walletData.chartData || walletData.chartData.length === 0) {
    return "Unable to fetch wallet data from API."
  }

  const { chartData, pnl } = walletData

  // Calculate additional metrics
  const latestValue = chartData[chartData.length - 1]?.value || 0
  const initialValue = chartData[0]?.value || 0
  const totalPnlPercentage = initialValue > 0 ? (((latestValue - initialValue) / initialValue) * 100).toFixed(2) : "N/A"

  // Find highest and lowest points
  const highestPoint = chartData.reduce((max, point) => (point.value > max.value ? point : max), chartData[0])
  const lowestPoint = chartData.reduce((min, point) => (point.value < min.value ? point : min), chartData[0])

  // Risk warnings
  const pnl24hWarning = pnl["24h"].percentage < -20 ? "🔴 SIGNIFICANT 24H LOSS" : ""
  const pnl30dWarning = pnl["30d"].percentage < -50 ? "🔴 MAJOR 30D LOSS" : ""
  const totalPnlWarning = Number.parseFloat(totalPnlPercentage) < -70 ? "🔴 SEVERE PORTFOLIO DECLINE" : ""

  return `
WALLET ANALYSIS DATA:
====================

PORTFOLIO OVERVIEW:
- Current Portfolio Value: $${latestValue.toLocaleString()}
- Initial Portfolio Value: $${initialValue.toLocaleString()}
- Total PnL: ${totalPnlPercentage}% ${totalPnlWarning}
- Data Points: ${chartData.length} entries
- Date Range: ${chartData[0]?.date} to ${chartData[chartData.length - 1]?.date}

PERFORMANCE METRICS:
- 24h PnL: $${pnl["24h"].value.toLocaleString()} (${pnl["24h"].percentage.toFixed(2)}%) ${pnl24hWarning}
- 30d PnL: $${pnl["30d"].value.toLocaleString()} (${pnl["30d"].percentage.toFixed(2)}%) ${pnl30dWarning}

PORTFOLIO EXTREMES:
- Highest Value: $${highestPoint.value.toLocaleString()} on ${highestPoint.date} (${highestPoint.pnlPercentage.toFixed(2)}%)
- Lowest Value: $${lowestPoint.value.toLocaleString()} on ${lowestPoint.date} (${lowestPoint.pnlPercentage.toFixed(2)}%)
- Max Drawdown: ${(highestPoint.value - lowestPoint.value).toLocaleString()} (${(((highestPoint.value - lowestPoint.value) / highestPoint.value) * 100).toFixed(2)}%)

RECENT PORTFOLIO HISTORY:
${chartData
  .slice(-10) // Show last 10 data points
  .map(
    (point, index) => `
${index + 1}. ${point.date}:
   - Value: $${point.value.toLocaleString()}
   - PnL: ${point.pnlPercentage.toFixed(2)}% ${Math.abs(point.pnlPercentage) > 30 ? "🔴 HIGH VOLATILITY" : ""}
   - Timestamp: ${new Date(point.timestamp).toLocaleString()}
`,
  )
  .join("")}

RISK ASSESSMENT:
- Portfolio Volatility: ${Math.abs(Number.parseFloat(totalPnlPercentage)) > 50 ? "🔴 HIGH" : Math.abs(Number.parseFloat(totalPnlPercentage)) > 20 ? "🟡 MODERATE" : "✅ LOW"}
- Recent Performance: ${pnl["24h"].percentage < -10 ? "🔴 DECLINING" : pnl["24h"].percentage > 10 ? "✅ GROWING" : "🟡 STABLE"}
- Long-term Trend: ${pnl["30d"].percentage < -30 ? "🔴 BEARISH" : pnl["30d"].percentage > 30 ? "✅ BULLISH" : "🟡 SIDEWAYS"}

🔴 WALLET WARNINGS:
${
  [
    pnl24hWarning ? "- Significant 24h loss (>20%)" : "",
    pnl30dWarning ? "- Major 30d loss (>50%)" : "",
    totalPnlWarning ? "- Severe portfolio decline (>70%)" : "",
    Math.abs(Number.parseFloat(totalPnlPercentage)) > 80 ? "- Extreme portfolio volatility" : "",
  ]
    .filter((flag) => flag)
    .join("\n") || "- No major wallet warnings detected ✅"
}
`
}
