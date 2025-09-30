export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const timeframe = searchParams.get("timeframe") || "24h"

    const response = await fetch(`${process.env.BACKEND_API_URL}/tokens/trending/${timeframe}`, {
      headers: {
        ...(process.env.BACKEND_API_KEY && { "x-api-key": `${process.env.BACKEND_API_KEY}` }),
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const result = await response.json()
    return Response.json(result)
  } catch (error) {
    console.error("Trending API error:", error)
    return Response.json({ error: "Failed to fetch trending tokens" }, { status: 500 })
  }
}
