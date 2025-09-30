import OpenAI from "openai"
import { extractSolanaAddress, containsSolanaAddress, isSearchQuery, isWalletQuery } from "./utils"
import { fetchTokenData, fetchTokenATH, searchTokens, fetchWalletData } from "./api-client"
import { formatTokenDataForAI, formatSearchResultsForAI, formatWalletDataForAI } from "./formatters"
import {
  BASE_SYSTEM_PROMPT,
  TOKEN_ANALYSIS_PROMPT,
  SEARCH_PROMPT,
  WALLET_ANALYSIS_PROMPT,
  HELP_RESPONSE,
} from "./prompts"
import { createTextStream, createOpenAIStream, STREAM_HEADERS } from "./stream-helpers"

export const maxDuration = 30

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  console.log("API route called")

  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured")
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { messages } = await req.json()
    console.log("Received messages:", messages)

    // Get the last user message
    const lastMessage = messages[messages.length - 1]

    // Handle help command
    if (lastMessage?.role === "user" && lastMessage.content.trim().toLowerCase() === "!help") {
      const stream = createTextStream(HELP_RESPONSE)
      return new Response(stream, { headers: STREAM_HEADERS })
    }

    // Handle wallet analysis queries
    const walletAddress = isWalletQuery(lastMessage?.content || "")
    if (walletAddress) {
      console.log("Wallet query detected:", walletAddress)
      const walletData = await fetchWalletData(walletAddress)
      const systemPrompt = WALLET_ANALYSIS_PROMPT(
        walletAddress,
        formatWalletDataForAI(
          walletData || {
            chartData: [],
            pnl: { "24h": { value: 0, percentage: 0 }, "30d": { value: 0, percentage: 0 } },
          },
        ),
      )

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
        max_tokens: 2000,
        temperature: 0.7,
      })

      const stream = await createOpenAIStream(completion)
      return new Response(stream, { headers: STREAM_HEADERS })
    }

    // Handle search queries
    const searchQuery = isSearchQuery(lastMessage?.content || "")
    if (searchQuery) {
      console.log("Search query detected:", searchQuery)
      const searchResults = await searchTokens(searchQuery)
      const systemPrompt = SEARCH_PROMPT(searchQuery, formatSearchResultsForAI(searchResults))

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
        max_tokens: 2000,
        temperature: 0.7,
      })

      const stream = await createOpenAIStream(completion)
      return new Response(stream, { headers: STREAM_HEADERS })
    }

    // Handle token address analysis
    const containsAddress = lastMessage?.role === "user" && containsSolanaAddress(lastMessage.content)
    const solanaAddress = containsAddress ? extractSolanaAddress(lastMessage.content) : null

    console.log("Message:", lastMessage?.content)
    console.log("Contains address:", containsAddress)
    console.log("Extracted address:", solanaAddress)

    let systemPrompt = BASE_SYSTEM_PROMPT

    if (containsAddress && solanaAddress) {
      console.log("Fetching token data for:", solanaAddress)

      // Fetch token data and ATH data in parallel
      const [tokenData, athData] = await Promise.all([fetchTokenData(solanaAddress), fetchTokenATH(solanaAddress)])

      if (tokenData) {
        const tokenDataText = formatTokenDataForAI(tokenData, athData)
        systemPrompt += TOKEN_ANALYSIS_PROMPT(solanaAddress, tokenDataText)
      }
    }

    console.log("Creating OpenAI completion...")

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
      max_tokens: 2000,
      temperature: 0.7,
    })

    console.log("OpenAI completion created, starting stream...")

    const stream = await createOpenAIStream(completion)
    return new Response(stream, { headers: STREAM_HEADERS })
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
