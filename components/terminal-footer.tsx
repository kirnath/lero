export function TerminalFooter() {
  return (
    <div className="mt-8 pt-4 border-t border-green-400/30">
      <div className="text-green-500/70 text-xs space-y-1 font-mono">
        <div>Commands: !help</div>
        <div>Status: Connected | Model: lero-opus-4 | Network: Solana Mainnet</div>
        <div>Powered by: Helius | Solana | Pumpfun</div>
      </div>
    </div>
  )
}
