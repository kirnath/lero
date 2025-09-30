# Lero Terminal v2 — Design & Layout Proposal

A complete re-think of the terminal-themed UI: still unmistakably "terminal", but built around panes, stacks, and a command-first Promptline instead of a top navbar. Retro phosphor vibes, modern tiling behavior, keyboard-native.

---

## Design Principles

- Keep terminal DNA: monospace, prompt metaphors, cursor, phosphor glow.
- Different layout: panes/stacks/overlays replace the classic navbar.
- Keyboard-first: command palette, jump navigator, robust bindings.
- Dense yet scannable: compact tables, strong accent hierarchy.
- Subtle motion: cursor blink, gentle glow, faint scanlines.
- Responsive by intent: collapse right stack, overlays go full-bleed.

---

## Layout Overview

The shell is a tiling canvas with a persistent Promptline at the top, two central stacks for panes, and a Footerline. Overlays host commands, navigation, help, and notifications.

```
+--------------------------------------------------------------------------------+
| PROMPTLINE                                                                     |
| [user@lero] :: type to run…   Ctrl+K: Commands   Ctrl+J: Jump   F1: Help       |
+--------------------------------------------------------------------------------+
| LEFT STACK                         | RIGHT STACK                                |
| ┌───────────────────────────────┐  | ┌───────────────────────────────────────┐ |
| | ACTIVE PANE (Analyze, REPL,   |  | | CONTEXT PANE (Market/Pulse, Watch)   | |
| | Logs, Inspector, etc.)        |  | |                                       | |
| |                               |  | |                                       | |
| | ────────────────────────────  |  | | ────────────────────────────────────  | |
| | STATUS ROW: latency ▪ net ▪   |  | | STATUS ROW: feed ▪ subs ▪ filters    | |
| └───────────────────────────────┘  | └───────────────────────────────────────┘ |
| ┌───────────────┐ ┌────────────┐  |                                           |
| | STACK TABS    | | SCRATCHPAD |  |  OVERLAYS: Palette • Jump • Help • Toasts |
| | [Analyze]*    | | quick calc |  |                                           |
| | [Pulse]       | | notes      |  |                                           |
| | [+]           | | clipboard  |  |                                           |
| └───────────────┘ └────────────┘  |                                           |
+--------------------------------------------------------------------------------+
| FOOTERLINE: mode ▪ bindings ▪ hints ▪ task progress                            |
+--------------------------------------------------------------------------------+
```

Key differences from v1:
- Remove top navbar; route via Promptline, tabs, and overlays.
- Dual-stack tiling workspace; overlays for search/help/actions.

---

## Core Regions

- Promptline: omnibar for commands and navigation, with status chips.
- Panes & Stacks: tabbed panes, optional splits, focus traversal.
- Overlays: Command Palette (Ctrl+K), Jump (Ctrl+J), Help (F1), Toasts.
- Footerline: mode, key hints, background task progress.

---

## Visual Language

- Schemes: Green (default), Amber, Graphite; toggle via `data-scheme`.
- Variables: `--term-bg`, `--term-fg`, `--term-accent`, `--term-muted`, `--term-border`, `--term-glow-color`.
- Typography: monospace everywhere; tabular-nums for tables.
- Effects: subtle glow on focus, faint scanlines, cursor pulse.

Example CSS tokens:

```css
:root {
  --term-bg: #000;
  --term-fg: #D1F7C4; /* green */
  --term-accent: #4ADE80;
  --term-muted: #2A2F2A;
  --term-border: #1F3B1F;
  --term-glow-color: rgba(74, 222, 128, 0.35);
}
[data-scheme="amber"] {
  --term-fg: #FFD8A8;
  --term-accent: #F59E0B;
  --term-border: #3A2A15;
  --term-glow-color: rgba(245, 158, 11, 0.35);
}
.term-glow { text-shadow: 0 0 6px var(--term-glow-color); }
```

---

## Navigation Model

- Commands: palette groups (Actions, Layout, Watchlist, Help), inline args.
- Tabs & Focus: Ctrl+1..9 switch; Alt+Arrows move focus; Ctrl+Shift+S split.
- Jump: fuzzy across tabs, panes, symbols, addresses, saved views.

---

## Key Panes

- Analyze: address input; sections for Summary, Liquidity, Holders, Risk, Events; chips to pivot actions.
- Pulse: stream with sparklines; filter row; presets (24h, 1h, whales, new).
- Markets: dense sortable table; compact rows; quick actions via keyboard.
- About: docs in-pane with keyboard nav.

---

## Components

- New: `Promptline`, `Footerline`, `Pane`, `Stack`, `overlay/command-palette`, `overlay/jump`, `overlay/help`, `overlay/toast`.
- Refactor: `TerminalLayout` to host new structure; deprecate `TerminalNavbar`.
- Reuse: `TerminalMessage` inside panes; add optional `role="system"`.

---

## Sketch: Promptline JSX

```tsx
export function Promptline() {
  return (
    <div className="sticky top-0 z-20 border-b" style={{
      background: "color-mix(in srgb, var(--term-bg) 92%, transparent)",
      borderColor: "var(--term-border)",
      backdropFilter: "blur(4px)",
    }}>
      <div className="mx-auto max-w-6xl px-3 py-2 font-mono text-sm" style={{ color: "var(--term-fg)" }}>
        <div className="flex items-center gap-2">
          <span className="term-glow" style={{ color: "var(--term-accent)" }}>user@lero</span>
          <span>::</span>
          <input className="flex-1 bg-transparent outline-none" placeholder="type a command or paste an address…" />
          <kbd className="opacity-60">Ctrl+K</kbd>
          <span className="opacity-60">Commands</span>
        </div>
      </div>
    </div>
  )
}
```

---

## Migration Plan

1) Add tokens + scaffolding: Promptline, Footerline, Pane, Stack.
2) Replace navbar; move pages into panes within stacks.
3) Implement overlays: palette, jump, help, toasts.
4) Add splits, tab persistence, focus traversal.
5) Polish: crt toggle, empty/skeleton states, docs.

---

## Summary

Command-first, pane-and-stack workspace that keeps the terminal soul but delivers a distinct UX from v1. Faster flow, denser information, overlays instead of routes, and a consistent keyboard model.

