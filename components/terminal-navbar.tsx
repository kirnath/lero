"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Coins, MessageSquare, Activity, Info, AlignHorizontalDistributeCenter } from "lucide-react"

const navItems = [
  { href: "/", label: "Analyze", icon: MessageSquare },
  { href: "/market", label: "Markets", icon: AlignHorizontalDistributeCenter },
  { href: "/about", label: "About", icon: Info },
]

export function TerminalNavbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-black border-b border-green-400/30 p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-green-300 font-mono text-lg font-bold">Lero Terminal</span>
          <span className="text-green-500/70 font-mono text-sm">v1.0.0</span>
        </div>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 font-mono text-sm transition-colors ${
                  isActive
                    ? "text-green-400 bg-green-400/10 border border-green-400/30"
                    : "text-green-500/70 hover:text-green-400 hover:bg-green-400/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
