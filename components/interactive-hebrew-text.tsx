"use client"

import { useEffect, useId, useRef, useState } from "react"
import { toast } from "sonner"

import { UI } from "@/lib/copy"
import { WORD_HINT_COST } from "@/lib/levels"
import { useGameStore } from "@/lib/store"
import type { WordBank } from "@/lib/types"
import { cn } from "@/lib/utils"

export function stripWordPunctuation(token: string) {
  return token.replace(/^[^\p{L}\p{N}]+/u, "").replace(/[^\p{L}\p{N}]+$/u, "")
}

export function splitHebrewWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean)
}

function lookupGloss(wordBank: WordBank, token: string) {
  const cleaned = stripWordPunctuation(token)
  if (!cleaned) return null
  return wordBank[cleaned] ?? wordBank[token] ?? null
}

type FloatPop = { id: number; index: number }

export function InteractiveHebrewText({
  text,
  wordBank = {},
}: {
  text: string
  wordBank?: WordBank
}) {
  const spend = useGameStore((state) => state.spend)
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(null)
  const [pops, setPops] = useState<FloatPop[]>([])
  const tooltipId = useId()
  const timers = useRef<number[]>([])
  const popSeq = useRef(0)

  const words = splitHebrewWords(text)

  useEffect(() => {
    const pending = timers
    return () => {
      pending.current.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  function handleWordClick(index: number) {
    if (activeTooltipIndex === index) {
      setActiveTooltipIndex(null)
      return
    }
    if (!spend(WORD_HINT_COST)) {
      toast.error(UI.noMoney.he)
      return
    }
    const popId = ++popSeq.current
    setActiveTooltipIndex(index)
    setPops((current) => [...current, { id: popId, index }])
    const timer = window.setTimeout(() => {
      setPops((current) => current.filter((pop) => pop.id !== popId))
    }, 700)
    timers.current.push(timer)
  }

  return (
    <span className="inline">
      {words.map((word, index) => {
        const gloss = lookupGloss(wordBank, word)
        const interactive = Boolean(gloss)
        const open = activeTooltipIndex === index
        return (
          <span key={`${word}-${index}`}>
            <span className="relative inline-block">
              <span
                className={cn(
                  interactive &&
                    "cursor-pointer rounded-sm border-b-2 border-dashed border-blue-300 px-0.5 transition-colors hover:bg-blue-50 hover:text-blue-950",
                  open && "bg-blue-50 text-blue-950"
                )}
                onClick={interactive ? () => handleWordClick(index) : undefined}
                role={interactive ? "button" : undefined}
                tabIndex={interactive ? 0 : undefined}
                onKeyDown={
                  interactive
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault()
                          handleWordClick(index)
                        }
                      }
                    : undefined
                }
                aria-expanded={interactive ? open : undefined}
                aria-describedby={open ? `${tooltipId}-${index}` : undefined}
              >
                {word}
              </span>
              {pops
                .filter((pop) => pop.index === index)
                .map((pop) => (
                  <span
                    key={pop.id}
                    dir="ltr"
                    className="animate-word-hint-float pointer-events-none absolute left-1/2 top-0 z-40 whitespace-nowrap leading-none text-[0.7rem] font-semibold text-red-400"
                  >
                    -₪{WORD_HINT_COST}
                  </span>
                ))}
              {open && gloss ? (
                <span
                  id={`${tooltipId}-${index}`}
                  role="tooltip"
                  dir="ltr"
                  className="absolute bottom-full left-1/2 z-30 mb-2.5 -translate-x-1/2 rounded-md bg-blue-100 px-2 py-1 text-xs font-normal whitespace-nowrap text-blue-950 shadow-sm"
                >
                  {gloss}
                </span>
              ) : null}
            </span>
            {index < words.length - 1 ? " " : null}
          </span>
        )
      })}
    </span>
  )
}
