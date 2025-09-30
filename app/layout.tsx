import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { TerminalLayout } from "@/components/terminal-layout"
import "./globals.css"
import { CommandProvider } from "@/components/command-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lero",
  description: "Comprehensive Terminal UI for Solana",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CommandProvider>
          <TerminalLayout>{children}</TerminalLayout>
        </CommandProvider>
      </body>
    </html>
  )
}
