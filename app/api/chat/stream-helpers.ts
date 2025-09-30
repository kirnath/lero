// Helper function to create a simple text stream
export function createTextStream(content: string): ReadableStream {
  return new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      const data = `data: ${JSON.stringify({ content })}\n\n`
      controller.enqueue(encoder.encode(data))
      controller.enqueue(encoder.encode("data: [DONE]\n\n"))
      controller.close()
    },
  })
}

// Helper function to create an OpenAI completion stream
export async function createOpenAIStream(completion: any): Promise<ReadableStream> {
  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || ""
          if (content) {
            const data = `data: ${JSON.stringify({ content })}\n\n`
            controller.enqueue(encoder.encode(data))
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
      } catch (error) {
        console.error("Error in stream:", error)
        controller.error(error)
      }
    },
  })
}

// Standard response headers for streaming
export const STREAM_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
}
