interface TerminalWelcomeProps {
  title: string
  sessionTime: string
}

export function TerminalWelcome({ title, sessionTime }: TerminalWelcomeProps) {
  return (
    <div className="mb-4">
      <div className="text-green-300 font-mono">
        {">"} {title}
      </div>
      <div className="text-green-500/70 text-xs font-mono">Session started at {sessionTime}</div>
      <div className="mt-2 text-green-400">{"─".repeat(60)}</div>
    </div>
  )
}
