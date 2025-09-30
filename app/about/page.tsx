import { Pane } from "@/components/pane"

export default function AboutPage() {
  const overview = `Lero Terminal is a cutting-edge AI-powered analysis platform specifically designed for the Solana blockchain ecosystem. Combining the nostalgic aesthetics of classic terminal interfaces with state-of-the-art artificial intelligence, Lero provides comprehensive token analysis, wallet tracking, portfolio monitoring, and real-time market insights. Built for traders, developers, and DeFi enthusiasts who demand professional-grade tools with an intuitive command-line experience.`

  const lines: string[] = ["FILE: about.txt", ""]
  // simple word wrap at ~88 chars
  let line = ""
  for (const word of overview.split(" ")) {
    const next = line ? line + " " + word : word
    if (next.length > 88) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)

  return (
    <Pane title="About" statusRight={<span>docs · project-overview</span>}>
      <pre className="font-mono text-green-300 text-sm whitespace-pre-wrap">{lines.join("")}</pre>
    </Pane>
  )
}
