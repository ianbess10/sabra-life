"use client"

import { Cloud, CloudOff, Loader2 } from "lucide-react"

import { UI } from "@/lib/copy"
import { useGameStore } from "@/lib/store"

export function CloudStatus() {
  const status = useGameStore((state) => state.syncStatus)

  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        {UI.saving.he}
      </span>
    )
  }

  if (status === "saved") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-primary">
        <Cloud className="size-3.5" />
        {UI.saved.he}
      </span>
    )
  }

  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-destructive">
        <CloudOff className="size-3.5" />
        {UI.saveError.he}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <CloudOff className="size-3.5" />
      {UI.localOnly.he}
    </span>
  )
}
