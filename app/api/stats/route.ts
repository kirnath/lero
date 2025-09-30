

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url)
    const mint = searchParams.get("token") || ""

    try{
        console.log(mint)
        const response = await fetch(`${process.env.BACKEND_API_URL}/stats/${mint}`, {
        headers: {
            ...(process.env.BACKEND_API_KEY && { "x-api-key": `${process.env.BACKEND_API_KEY}` }),
            "Content-Type": "application/json",
        },
        })
        const result = await response.json()
        return new Response(JSON.stringify(result))

    }catch{
        throw new Error("API Problem")
    }

}