"use client"
import type React from "react"
import { useEffect, useRef, useState } from "react"
// Wallet support removed
import { TerminalMessage } from "@/components/terminal-message"
// Removed TerminalInput; we use Promptline omnibar instead
import { TerminalLoading } from "@/components/terminal-loading"
import { Pane } from "@/components/pane"
import { useCommandRegister } from "@/components/command-context"
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}
// No wallet gating
// No wallet error handling
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  // input state removed; Promptline handles command entry
  const [isLoading, setIsLoading] = useState(false)
  // Initialization removed; show session immediately
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // Session is in-memory only (no persistence)
  
  const formatTimestamp = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }
  // no initialization flow
  // wallet status omitted in session pane
  // Wallet connect/disconnect removed
  // removed legacy handleInputChange; no longer needed
  const handleSubmit = async (_e: React.FormEvent) => {
    // legacy no-op; input form removed in favor of Promptline omnibar
    return
    // Local command handler: allow without wallet connection
    const handleLocalCommand = async (command: string) => {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: command,
      }
      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)
      setError(null)
      const finish = (html: string) => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: html,
        }
        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)
      }
      const fail = (err: unknown) => {
        const msg = err instanceof Error ? err.message : "Unknown error"
        finish(`<div class="font-mono text-red-400">[!] Error: ${msg}</div>`)
      }
      try {
        // clear session output
        if (/^(!?clear|reset)\s*$/i.test(command)) {
          try { localStorage.removeItem("lero:session") } catch {}
          setMessages([])
          setIsLoading(false)
          setError(null)
          return true
        }
        // navigation: go/open/cd <view>
        if (/^(?:go|open|cd)\s+\/?(markets?|pulse|about)\/?\s*$/i.test(command)) {
          const m = command.match(/^(?:go|open|cd)\s+\/?(markets?|pulse|about)\/?\s*$/i)
          const view = (m?.[1] || "").toLowerCase()
          const dest = view.startsWith("market") ? "/market" : view === "pulse" ? "/pulse" : "/about"
          window.location.href = dest
          finish(`<pre class="font-mono text-green-300">Navigating to ${view}…</pre>`)
          return true
        }
        // watchlist commands
        if (/^watch\s+(add|rm|list)\b/i.test(command)) {
          const [, action, arg] = command.match(/^watch\s+(add|rm|list)\s*(.*)$/i) || []
          const load = () => {
            try { return JSON.parse(localStorage.getItem("lero:watchlist") || "[]") as string[] } catch { return [] }
          }
          const save = (arr: string[]) => { localStorage.setItem("lero:watchlist", JSON.stringify(arr)); window.dispatchEvent(new Event("watchlist:changed")) }
          const list = load()
          if (action?.toLowerCase() === "list") {
            const rows = list.map((x, i) => `${String(i+1).padStart(2,'0')}  ${x}`).join("\n") || "(empty)"
            finish(`<pre class="font-mono text-green-300">WATCHLIST\n${rows}</pre>`)
            return true
          }
          if (action?.toLowerCase() === "add") {
            if (!arg) { finish('<pre class="font-mono text-red-400">usage: watch add &lt;mint|symbol&gt;</pre>'); return true }
            if (!list.includes(arg)) list.push(arg)
            save(list)
            finish(`<pre class="font-mono text-green-300">Added: ${arg}</pre>`)
            return true
          }
          if (action?.toLowerCase() === "rm") {
            if (!arg) { finish('<pre class="font-mono text-red-400">usage: watch rm &lt;mint|symbol&gt;</pre>'); return true }
            const next = list.filter((x) => x !== arg)
            save(next)
            finish(`<pre class="font-mono text-green-300">Removed: ${arg}</pre>`)
            return true
          }
        }
        if (/^cat\s+solana\.prc\s*$/i.test(command)) {
          const res = await fetch("/api/solPrice", { method: "POST", headers: { "Content-Type": "application/json" } })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = await res.json()
          const price = typeof data?.price === "number" ? data.price : null
          const change = data?.priceChanges?.["24h"]?.priceChangePercentage
          const liquidity = data?.liquidity
          const marketCap = data?.marketCap
          const updated = data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : "N/A"
          const sign = typeof change === "number" && change >= 0 ? "+" : ""
          const changeColor = typeof change === "number" && change < 0 ? "text-red-400" : "text-green-400"
          const html = `
            <div class="font-mono">
              <div class="text-green-400 text-xs mb-1">SOL/USD PRICE</div>
              <div class="bg-green-900/30 p-3 rounded border border-green-400/30 text-green-300">
                <div>Price: <span class="text-white">$${price != null ? price.toFixed(4) : "N/A"}</span>
                  <span class="${changeColor} ml-2">${typeof change === "number" ? `${sign}${change.toFixed(2)}% (24h)` : ""}</span>
                </div>
                <div>Liquidity: <span class="text-white">${typeof liquidity === "number" ? `$${liquidity.toLocaleString()}` : "N/A"}</span></div>
                <div>Market Cap: <span class="text-white">${typeof marketCap === "number" ? `$${marketCap.toLocaleString()}` : "N/A"}</span></div>
                <div class="text-green-500/70 text-xs mt-1">Last Updated: ${updated}</div>
              </div>
            </div>`
          finish(html)
          return true
        }
        if (/^cat\s+trendings\.log(\s+.*)?$/i.test(command)) {
          const res = await fetch(`/api/trending`, { method: "POST", headers: { "Content-Type": "application/json" } })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const list = await res.json()
          const rows = (Array.isArray(list) ? list.slice(0, 20) : []).map((item: any, idx: number) => {
            const sym = (item?.token?.symbol || "").replace("$", "")
            const name = item?.token?.name || sym || "Unknown"
            const addr = item?.token?.mint || ""
            const price = item?.pools?.[0]?.price?.usd
            const ch = item?.events?.["24h"]?.priceChangePercentage
            const mc = item?.pools?.[0]?.marketCap?.usd
            const short = addr ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : ""
            const chSign = typeof ch === "number" && ch >= 0 ? "+" : ""
            const chColor = typeof ch === "number" && ch < 0 ? "text-red-400" : "text-green-400"
            return `
              <div class="grid grid-cols-12 gap-2 py-1 border-b border-green-400/10">
                <div class="col-span-1 text-green-500/80">${String(idx + 1).padStart(2, "0")}</div>
                <div class="col-span-3 text-white truncate" title="${name}">${sym || "-"}</div>
                <div class="col-span-2">$${typeof price === "number" ? (price < 1 ? price.toFixed(6) : price.toFixed(3)) : "N/A"}</div>
                <div class="col-span-2 ${chColor}">${typeof ch === "number" ? `${chSign}${ch.toFixed(2)}%` : "--"}</div>
                <div class="col-span-3 text-green-300" title="${addr}">${short}</div>
              </div>`
          }).join("")
          const html = `
            <div class="font-mono">
              <div class="text-green-400 text-xs mb-1">TRENDING TOKENS (24h)</div>
              <div class="bg-green-900/30 p-2 rounded border border-green-400/30 text-green-300">
                <div class="grid grid-cols-12 gap-2 pb-1 text-green-500/70 border-b border-green-400/20">
                  <div class="col-span-1">#</div>
                  <div class="col-span-3">Symbol</div>
                  <div class="col-span-2">Price</div>
                  <div class="col-span-2">Change</div>
                  <div class="col-span-3">Address</div>
                </div>
                ${rows || "<div class=\"text-green-500/70\">No data</div>"}
              </div>
            </div>`
          finish(html)
          return true
        }
        if (/^cat\s+markets\.log\s*$/i.test(cmd)) {
          const res = await fetch(`/api/trending?timeframe=24h`, { method: "POST", headers: { "Content-Type": "application/json" } })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const list = await res.json()
          const header = ["#", "SYMBOL", "PRICE", "CHANGE", "MCAP", "MINT"].map((h) => h.padEnd(8, " ")).join("  ")
          const lines = [header, "".padEnd(header.length, "-")]
          ;(Array.isArray(list) ? list.slice(0, 50) : []).forEach((item, i) => {
            const index = String(i + 1).padStart(2, "0").padEnd(8, " ")
            const sym = ((item?.token?.symbol || "").replace("$", "") || "-").padEnd(8, " ")
            const price = item?.pools?.[0]?.price?.usd
            const priceStr = typeof price === "number" ? (price < 1 ? price.toFixed(6) : price.toFixed(3)) : "N/A"
            const priceCell = (`$${priceStr}`).padEnd(8, " ")
            const ch = item?.events?.["24h"]?.priceChangePercentage
            const chSign = typeof ch === "number" && ch >= 0 ? "+" : ""
            const chStr = typeof ch === "number" ? `${chSign}${ch.toFixed(2)}%` : "--"
            const chCell = chStr.padEnd(8, " ")
            const mcap = item?.pools?.[0]?.marketCap?.usd
            let mcapStr
            if (typeof mcap === "number") {
              if (mcap >= 1e9) mcapStr = `${(mcap / 1e9).toFixed(1)}B`
              else if (mcap >= 1e6) mcapStr = `${(mcap / 1e6).toFixed(1)}M`
              else if (mcap >= 1e3) mcapStr = `${(mcap / 1e3).toFixed(1)}K`
              else mcapStr = `${mcap.toFixed(0)}`
            } else {
              mcapStr = "N/A"
            }
            const mcapCell = mcapStr.padEnd(8, " ")
            const mint = (item?.token?.mint || "")
            const short = mint ? mint.slice(0, 4) + "…" + mint.slice(-4) : ""
            const mintCell = short.padEnd(8, " ")
            lines.push([index, sym, priceCell, chCell, mcapCell, mintCell].join("  "))
          })
          const html = `<pre class=\"font-mono text-green-300 text-sm whitespace-pre-wrap\">${lines.join("\n")}<\/pre>`
          finish(html)
          return true
        }
        return false
      } catch (err) {
        fail(err)
        return true
      }
    }
    // Intercept local commands
    const handled = await handleLocalCommand(trimmedInput)
    if (handled) return
    // Wallet connection is optional; allow sending commands regardless
    const userMessage: Message = { id: Date.now().toString(), role: "user", content: "" }
    setMessages((prev) => [...prev, userMessage])
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      }
      setMessages((prev) => [...prev, assistantMessage])
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            console.log("Stream reading completed")
            break
          }
          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") {
                break
              }
              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  assistantContent += parsed.content
                  setMessages((prev) =>
                    prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: assistantContent } : msg)),
                  )
                }
              } catch (parseError) {
                console.warn("Failed to parse chunk:", data, parseError)
              }
            }
          }
        }
      }
    } catch (requestError) {
      console.error("Error:", requestError)
      const errorMessage = requestError instanceof Error ? requestError.message : "Unknown error occurred"
      setError(errorMessage)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `[!] Error: ${errorMessage}\n\nPlease check:\n\n- Your internet connection\n- Try refreshing the page`,
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }
  // New: centralized command submission for Promptline
  const submitCommand = async (command: string) => {
    const trimmedInput = command.trim()
    if (!trimmedInput) return
    // Local command handler: allow without wallet connection
    const handleLocalCommand = async (cmd: string) => {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: cmd,
      }
      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)
      setError(null)
      const finish = (html: string) => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: html,
        }
        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)
      }
      const fail = (err: unknown) => {
        const msg = err instanceof Error ? err.message : "Unknown error"
        finish(`<div class="font-mono text-red-400">[!] Error: ${msg}</div>`)
      }
      try {
        // navigation: go/open/cd <view>
        if (/^(?:go|open|cd)\s+\/?(markets?|about|home|session)\/?\s*$/i.test(cmd)) {
          const m = cmd.match(/^(?:go|open|cd)\s+\/?(markets?|about|home|session)\/?\s*$/i)
          const view = (m?.[1] || "").toLowerCase()
          const dest = view.startsWith("market")
            ? "/market"
            : view === "about"
            ? "/about"
            : "/"
          window.location.href = dest
          finish(`<pre class=\"font-mono text-green-300\">Navigating to ${view}…</pre>`)
          return true
        }
        
                // cat init.sh — init banner (fast typewriter)
        if (/^cat\s+init\.sh\s*$/i.test(cmd)) {
          const ascii = [
            " __       _______ .______        ______   ",
            "|  |     |   ____||   _  \      /  __  \  ",
            "|  |     |  |__   |  |_)  |    |  |  |  | ",
            "|  |     |   __|  |      /     |  |  |  | ",
            "|  `----.|  |____ |  |\  \----.|  `--'  | ",
            "|_______||_______|| _| `._____| \______/  ",
            "                                          ",
          ]
          const lines = [
            "#!/bin/sh",
            "# Lero Terminal — init",
            "VERSION=2.1",
            "NETWORK=Solana Mainnet",
            "MINT=Aj8RFqzq25DFTZvgM8UJQZA7wZLXHGwpRg2HiFMjpump",
            "SOCIALS=https://x.com/lero_run",
            "",
            ...ascii,
            "",
            "echo Welcome to Lero Terminal",
            "echo Type 'help' for commands",
            "",
            "# quick tips:",
            "#  - go markets | go about",
            "#  - cat solana.prc | cat trendings.log | cat markets.log",
            "#  - watch add <mint|symbol> | watch list",
          ]
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "",
          }
          setMessages((prev) => [...prev, assistantMessage])
          const open = '<pre class="font-mono text-green-300 text-sm whitespace-pre-wrap">'
          const close = '</pre>'
          const full = lines.join('\n') + '\n'
          const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
          let acc = ''
          for (let i = 0; i < full.length; i++) {
            acc += full[i]
            const cursor = i < full.length - 1 ? '<span class="opacity-80">▋</span>' : ''
            const html = open + acc + cursor + close
            setMessages((prev) => prev.map((m) => (m.id == assistantMessage.id ? { ...m, content: html } : m)))
            await delay(8)
          }
          setIsLoading(false)
          return true
        }
        // cat about.txt — project overview
        if (/^cat\s+about\.txt\s*$/i.test(cmd)) {
          const overview = `Lero Terminal is a cutting-edge AI-powered analysis platform specifically designed for the Solana blockchain ecosystem. Combining the nostalgic aesthetics of classic terminal interfaces with state-of-the-art artificial intelligence, Lero provides comprehensive token analysis, wallet tracking, portfolio monitoring, and real-time market insights. Built for traders, developers, and DeFi enthusiasts who demand professional-grade tools with an intuitive command-line experience.`
          const lines: string[] = ["FILE: about.txt", ""]
          let line = ""
          for (const word of overview.split(" ")) {
            const next = line ? line + " " + word : word
            if (next.length > 88) { lines.push(line); line = word } else { line = next }
          }
          if (line) lines.push(line)
          finish(`<pre class=\"font-mono text-green-300 text-sm whitespace-pre-wrap\">${lines.join("\\n")}<\\/pre>`)
          return true
        }
// help / commands (aliases)
        if (/^(help|!help|commands|!commands|command|--help|\?)(\s*)$/i.test(cmd)) {
          const html = `
<pre class="font-mono text-green-300 text-sm whitespace-pre-wrap">
LERO TERMINAL — COMMAND REFERENCE
USAGE
  help | !help | commands         Show this help
  cat solana.prc                  Print SOL price snapshot
  cat trendings.log               Print trending tokens (24h)
  go &lt;view&gt;                      Navigate to a view
  wallet &lt;address&gt;                Analyze a wallet portfolio
  &lt;token-mint-address&gt;            Analyze a token by mint
VIEWS
  home      Session (this pane)
  markets   Market tables
  about     About pane
COMMANDS
  help, !help, ?, commands        Show help
  cat solana.prc                  SOL price • 24h change • liq • mcap
  cat trendings.log               Top trending tokens (24h)
  cat markets.log                Markets list (24h)
  go home|session|markets|about Navigate between panes
  wallet &lt;address&gt;                Wallet analysis
  &lt;mint-address&gt;                  Token analysis
EXAMPLES
  cat solana.prc
  cat trendings.log
  cat markets.log
  go markets
  wallet 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
  7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
</pre>`
          finish(html)
          return true
        }
        if (/^cat\s+solana\.prc\s*$/i.test(cmd)) {
          const res = await fetch("/api/solPrice", { method: "POST", headers: { "Content-Type": "application/json" } })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = await res.json()
          const price = typeof data?.price === "number" ? data.price : null
          const change = data?.priceChanges?.["24h"]?.priceChangePercentage
          const liquidity = data?.liquidity
          const marketCap = data?.marketCap
          const updated = data?.lastUpdated ? new Date(data.lastUpdated).toISOString() : "N/A"
          const sign = typeof change === "number" && change >= 0 ? "+" : ""
          const changeStr = typeof change === "number" ? `${sign}${change.toFixed(2)}%` : "N/A"
          const pad = (k: string) => (k + ":").padEnd(15, " ")
          const lines = [
            `${pad("FILE")} solana.prc`,
            `${pad("SYMBOL")} SOL`,
            `${pad("PRICE")} $${price != null ? price.toFixed(4) : "N/A"}`,
            `${pad("CHANGE_24H")} ${changeStr}`,
            `${pad("LIQUIDITY")} ${typeof liquidity === "number" ? `$${liquidity.toLocaleString()}` : "N/A"}`,
            `${pad("MARKET_CAP")} ${typeof marketCap === "number" ? `$${marketCap.toLocaleString()}` : "N/A"}`,
            `${pad("UPDATED")} ${updated}`,
          ].join("\n")
          const html = `<pre class="font-mono text-green-300 text-sm whitespace-pre-wrap">${lines}</pre>`
          finish(html)
          return true
        }
        if (/^cat\s+trendings\.log(\s+.*)?$/i.test(cmd)) {
          const res = await fetch(`/api/trending`, { method: "POST", headers: { "Content-Type": "application/json" } })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const list = await res.json()
          const header = ["#", "SYMBOL", "PRICE", "CHANGE", "MINT"].map((h) => h.padEnd(8, " ")).join("  ")
          const lines = [header, "".padEnd(header.length, "-")]
          ;(Array.isArray(list) ? list.slice(0, 25) : []).forEach((item: any, i: number) => {
            const index = String(i + 1).padStart(2, "0").padEnd(8, " ")
            const sym = ((item?.token?.symbol || "").replace("$", "") || "-").padEnd(8, " ")
            const price = item?.pools?.[0]?.price?.usd
            const priceStr = typeof price === "number" ? (price < 1 ? price.toFixed(6) : price.toFixed(3)) : "N/A"
            const priceCell = (`$${priceStr}`).padEnd(8, " ")
            const ch = item?.events?.["24h"]?.priceChangePercentage
            const chSign = typeof ch === "number" && ch >= 0 ? "+" : ""
            const chStr = typeof ch === "number" ? `${chSign}${ch.toFixed(2)}%` : "--"
            const chCell = chStr.padEnd(8, " ")
            const mint = (item?.token?.mint || "")
            const short = mint ? mint.slice(0, 4) + "…" + mint.slice(-4) : ""
            const mintCell = short.padEnd(8, " ")
            lines.push([index, sym, priceCell, chCell, mintCell].join("  "))
          })
          const html = `<pre class="font-mono text-green-300 text-sm whitespace-pre-wrap">${lines.join("\n")}<\/pre>`
          finish(html)
          return true
        }
        return false
      } catch (err) {
        fail(err)
        return true
      }
    }
    const handled = await handleLocalCommand(trimmedInput)
    if (handled) return
    // Wallet connection is optional; allow sending commands regardless
    // Fallback to chat API
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmedInput,
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({ role: msg.role, content: msg.content })),
        }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: "" }
      setMessages((prev) => [...prev, assistantMessage])
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") break
              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  assistantContent += parsed.content
                  setMessages((prev) => prev.map((m) => (m.id === assistantMessage.id ? { ...m, content: assistantContent } : m)))
                }
              } catch (parseError) {
                console.warn("Failed to parse chunk:", data, parseError)
              }
            }
          }
        }
      }
    } catch (requestError) {
      const errorMessage = requestError instanceof Error ? requestError.message : "Unknown error occurred"
      setError(errorMessage)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `[!] Error: ${errorMessage}\n\nPlease check:\n\n- Your internet connection\n- Try refreshing the page`,
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }
  // Register submit handler for the global Promptline
  // This ensures there's only one input field (Promptline) handling commands
  useCommandRegister(submitCommand)
  // Auto-run init on first load in this session
  const didInitRef = useRef(false)
  useEffect(() => {
    if (!didInitRef.current && messages.length === 0) {
      didInitRef.current = true
      submitCommand("cat init.sh")
    }
  }, [])
  return (
    <div className="h-full">
      <Pane title="Session" statusRight={<span>{messages.length} messages</span>}>
        {error && (
          <div className="mb-3 p-3 border border-red-500/50 bg-red-500/10 text-red-400 font-mono text-sm">
            [!] Error: {error}
          </div>
        )}
        <div className="space-y-3">
          {messages.map((message) => (
            <TerminalMessage key={message.id} role={message.role} content={message.content} />
          ))}
          {isLoading && <TerminalLoading />}
          {!isLoading && messages.length === 0 && (
            <div className="font-mono text-green-500/80 text-sm">Type a command in the Promptline (e.g., cat solana.prc)</div>
          )}
        </div>
      </Pane>
    </div>
  )
}