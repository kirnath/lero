import { User, Bot } from "lucide-react"

interface TerminalMessageProps {
  role: "user" | "assistant"
  content: string
}

export function TerminalMessage({ role, content }: TerminalMessageProps) {
  const isUser = role === "user"
  const Icon = isUser ? User : Bot
  const username = isUser ? "guest" : "lero"
  const textColor = isUser ? "text-white" : "text-green-300"
  const promptColor = isUser ? "text-cyan-400" : "text-green-400"

  // Check if user message is a Solana address
  const isSolanaAddress = isUser && /^[1-9A-HJ-NP-Za-km-z]{44}$/.test(content.trim())

  // Function to render content with HTML support for assistant messages
  const renderContent = () => {
    if (isUser) {
      if (isSolanaAddress) {
        return (
          <div>
            <div className="text-green-400 text-xs mb-1">🔍 ANALYZING TOKEN ADDRESS:</div>
            <div className="bg-green-900/30 p-2 rounded border border-green-400/30 font-mono text-sm">{content}</div>
          </div>
        )
      }
      return content
    } else {
      // For assistant messages, render HTML content
      return <div dangerouslySetInnerHTML={{ __html: content }} />
    }
  }

  return (
    <div className="mb-2">
      <div className="flex items-start gap-2">
        <div className={`flex items-center gap-1 ${promptColor} flex-shrink-0`}>
          <Icon className="w-4 h-4" />
          <span className="text-xs font-mono">{username}@us-1:</span>
        </div>
        <div className={`${textColor} break-words whitespace-pre-wrap font-mono flex-1`}>{renderContent()}</div>
      </div>
    </div>
  )
}
