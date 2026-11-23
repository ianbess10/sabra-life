"use client"

import { useEffect } from "react"

import { useHint } from "@/components/hint-provider"
import type { HintLine } from "@/lib/types"

export function useHintScreen(id: string, lines: HintLine[]) {
  const { setScreen } = useHint()

  useEffect(() => {
    setScreen(id, lines)
  }, [id, lines, setScreen])
}
