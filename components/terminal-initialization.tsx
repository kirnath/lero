"use client"

import { useState, useEffect } from "react"
import { Bot } from "lucide-react"

interface InitializationStep {
  message: string
  delay: number
  completed: boolean
}

interface TerminalInitializationProps {
  onComplete: () => void
}

const SPINNER_FRAMES = ["|", "/", "-", "\\"]

export function TerminalInitialization({ onComplete }: TerminalInitializationProps) {
  const [steps, setSteps] = useState<InitializationStep[]>([
    { message: "Initializing Lero terminal...", delay: 800, completed: false },
    { message: "Loading AI models...", delay: 1200, completed: false },
    { message: "Connecting to Solana network...", delay: 1000, completed: false },
    { message: "Preparing analysis tools...", delay: 900, completed: false },
    { message: "System ready.", delay: 600, completed: false },
  ])

  const [currentStep, setCurrentStep] = useState(0)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1)
    }, 120)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setSteps((prev) => prev.map((step, index) => (index === currentStep ? { ...step, completed: true } : step)))

        if (currentStep === steps.length - 1) {
          setTimeout(() => {
            onComplete()
          }, 1000)
        } else {
          setCurrentStep((prev) => prev + 1)
        }
      }, steps[currentStep].delay)

      return () => clearTimeout(timer)
    }
  }, [currentStep, steps, onComplete])

  const spinner = SPINNER_FRAMES[tick % SPINNER_FRAMES.length]
  const completedCount = steps.filter((step) => step.completed).length
  const activeIndex = steps.findIndex((step) => !step.completed)
  const partialProgress = activeIndex === -1 ? 1 : (completedCount + (tick % 12) / 12) / steps.length
  const clampedProgress = activeIndex === -1 ? 1 : Math.min(partialProgress, 0.96)
  const progressPercent = Math.round((activeIndex === -1 ? 1 : clampedProgress) * 100)

  return (
    <div className="w-full max-w-sm rounded-md border border-emerald-400/40 bg-black/70 px-4 py-4 font-mono text-xs text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.25)]">
      <div className="flex items-center justify-between text-emerald-300">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4" />
          <span>cloud@lero-init</span>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-emerald-400">Boot Sequence</span>
      </div>

      <div className="mt-3 flex items-center gap-2 text-emerald-200">
        <span className="text-sm">{spinner}</span>
        <span className="uppercase tracking-[0.2em] text-[10px] text-emerald-500">
          {activeIndex === -1 ? "Ready" : "Initializing"}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-[11px]">
        {steps.map((step, index) => {
          const isComplete = step.completed
          const isActive = !step.completed && index === activeIndex

          return (
            <div
              key={step.message}
              className={`flex items-center gap-2 transition-colors ${
                isComplete ? "text-emerald-100" : isActive ? "text-emerald-300" : "text-emerald-700"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isComplete ? "bg-emerald-400" : isActive ? "bg-emerald-300 animate-pulse" : "bg-emerald-800"
                }`}
              />
              <span className="truncate">{step.message}</span>
            </div>
          )
        })}
      </div>

      <div className="mt-4">
        <div className="h-1 w-full overflow-hidden rounded-sm bg-emerald-900/40">
          <div
            className="h-full bg-emerald-400 transition-[width] duration-200 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-emerald-500">
          <span>{activeIndex === -1 ? "System ready" : steps[Math.max(activeIndex, 0)].message}</span>
          <span>{progressPercent}%</span>
        </div>
      </div>
    </div>
  )
}
