"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { toast } from "sonner"

import { UI } from "@/lib/copy"
import { HINT_COST } from "@/lib/levels"
import { useGameStore } from "@/lib/store"
import type { HintLine } from "@/lib/types"

type HintContextValue = {
  revealed: boolean
  lines: HintLine[]
  setScreen: (id: string, lines: HintLine[]) => void
  setOverlay: (id: string | null, lines: HintLine[] | null) => void
  requestHint: () => boolean
}

const HintContext = createContext<HintContextValue | null>(null)

export function HintProvider({ children }: { children: ReactNode }) {
  const [screenId, setScreenId] = useState("home")
  const [screenLines, setScreenLines] = useState<HintLine[]>([])
  const [overlayId, setOverlayId] = useState<string | null>(null)
  const [overlayLines, setOverlayLines] = useState<HintLine[] | null>(null)
  const [revealedFor, setRevealedFor] = useState<string | null>(null)
  const buyHint = useGameStore((state) => state.buyHint)
  const shekels = useGameStore((state) => state.shekels)

  const activeId = overlayId ?? screenId
  const revealed = revealedFor === activeId
  const lines = overlayLines ?? screenLines

  const setScreen = useCallback((id: string, nextLines: HintLine[]) => {
    setScreenId(id)
    setScreenLines(nextLines)
  }, [])

  const setOverlay = useCallback((id: string | null, nextLines: HintLine[] | null) => {
    setOverlayId(id)
    setOverlayLines(nextLines)
  }, [])

  const requestHint = useCallback(() => {
    if (revealed) return true
    if (shekels < HINT_COST) {
      toast.error(UI.noMoney.he)
      return false
    }
    const ok = buyHint()
    if (!ok) {
      toast.error(UI.noMoney.he)
      return false
    }
    setRevealedFor(activeId)
    toast.success(`שילמת ₪${HINT_COST} על תרגום`)
    return true
  }, [activeId, buyHint, revealed, shekels])

  const value = useMemo(
    () => ({ revealed, lines, setScreen, setOverlay, requestHint }),
    [lines, revealed, requestHint, setOverlay, setScreen]
  )

  return <HintContext.Provider value={value}>{children}</HintContext.Provider>
}

export function useHint() {
  const context = useContext(HintContext)
  if (!context) {
    throw new Error("useHint must be used within HintProvider")
  }
  return context
}
