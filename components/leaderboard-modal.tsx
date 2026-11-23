"use client"

import { useEffect, useState } from "react"
import { Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UI } from "@/lib/copy"
import { formatShekels, formatXp } from "@/lib/format"
import { genderedCopy } from "@/lib/gender"
import {
  fetchLeaderboard,
  type LeaderboardEntry,
  type LeaderboardSort,
} from "@/lib/leaderboard"
import { useGameStore } from "@/lib/store"
import { cn } from "@/lib/utils"

type LoadState =
  | { status: "loading" }
  | { status: "ready"; rows: LeaderboardEntry[] }
  | { status: "offline" }
  | { status: "error" }

export function LeaderboardModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const userId = useGameStore((state) => state.userId)
  const gender = useGameStore((state) => state.gender)
  const copy = genderedCopy(gender)
  const [sort, setSort] = useState<LeaderboardSort>("xp")
  const [load, setLoad] = useState<LoadState>({ status: "loading" })

  function chooseSort(next: LeaderboardSort) {
    setSort(next)
    setLoad({ status: "loading" })
  }

  useEffect(() => {
    if (!open) return
    let cancelled = false
    void fetchLeaderboard(sort).then((result) => {
      if (cancelled) return
      if (!result.ok) {
        setLoad({ status: result.reason === "offline" ? "offline" : "error" })
        return
      }
      setLoad({ status: "ready", rows: result.rows })
    })
    return () => {
      cancelled = true
    }
  }, [open, sort])

  return (
    <Dialog
      modal={false}
      disablePointerDismissal
      open={open}
      onOpenChange={(next) => {
        if (next) setLoad({ status: "loading" })
        onOpenChange(next)
      }}
    >
      <DialogContent className="z-70 sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-xl">
            <Trophy className="size-5 text-amber-300" />
            {UI.leaderboard.he}
          </DialogTitle>
          <DialogDescription>{UI.leaderboardBlurb.he}</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Button
            variant={sort === "xp" ? "default" : "outline"}
            className="flex-1"
            aria-pressed={sort === "xp"}
            onClick={() => chooseSort("xp")}
          >
            {UI.tabXp.he}
          </Button>
          <Button
            variant={sort === "shekels" ? "default" : "outline"}
            className="flex-1"
            aria-pressed={sort === "shekels"}
            onClick={() => chooseSort("shekels")}
          >
            {UI.tabShekels.he}
          </Button>
        </div>

        {load.status === "loading" ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{UI.boardLoading.he}</p>
        ) : null}

        {load.status === "offline" ? (
          <p className="py-6 text-center text-sm text-amber-200">{UI.boardOffline.he}</p>
        ) : null}

        {load.status === "error" ? (
          <p className="py-6 text-center text-sm text-destructive">{UI.boardError.he}</p>
        ) : null}

        {load.status === "ready" && load.rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{UI.boardEmpty.he}</p>
        ) : null}

        {load.status === "ready" && load.rows.length > 0 ? (
          <ol className="max-h-[min(60vh,24rem)] space-y-1 overflow-y-auto">
            {load.rows.map((row, index) => {
              const rank = index + 1
              const isYou = Boolean(userId) && row.id === userId
              const name = row.username?.trim() || copy.anonymous
              return (
                <li
                  key={row.id}
                  className={cn(
                    "grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-lg px-3 py-2 text-sm",
                    isYou
                      ? "bg-blue-100 text-blue-950"
                      : "bg-secondary/50 text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "font-heading text-base tabular-nums",
                      rank === 1 && "text-amber-500",
                      rank === 2 && "text-zinc-400",
                      rank === 3 && "text-amber-700",
                      isYou && rank > 3 && "text-blue-800"
                    )}
                  >
                    {rank}
                  </span>
                  <span className="min-w-0 truncate font-medium">
                    {name}
                    {isYou ? (
                      <span className="ms-2 text-xs font-normal opacity-80">
                        {copy.you}
                      </span>
                    ) : null}
                  </span>
                  <span className="tabular-nums">
                    {sort === "xp" ? formatXp(row.xp) : formatShekels(row.shekels)}
                  </span>
                </li>
              )
            })}
          </ol>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
