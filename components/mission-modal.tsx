"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { CheckCircle2, UserRound } from "lucide-react"

import { Hinted } from "@/components/hinted"
import { useHint } from "@/components/hint-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UI } from "@/lib/copy"
import { formatShekels, formatXp } from "@/lib/format"
import { MISTAKE_PENALTY } from "@/lib/levels"
import { STREAK_BONUS_SHEKELS } from "@/lib/streak"
import { useGameStore } from "@/lib/store"
import type { HintLine, Mission, MissionOption } from "@/lib/types"

export function MissionModal({
  mission,
  open,
  onOpenChange,
}: {
  mission: Mission | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && mission ? (
        <MissionSession
          key={mission.id}
          mission={mission}
          onClose={() => onOpenChange(false)}
        />
      ) : null}
    </Dialog>
  )
}

function MissionSession({
  mission,
  onClose,
}: {
  mission: Mission
  onClose: () => void
}) {
  const [currentNodeId, setCurrentNodeId] = useState("node_1")
  const [celebrating, setCelebrating] = useState(false)
  const [payout, setPayout] = useState<{
    shekels: number
    xp: number
    paid: boolean
    bonus: boolean
    streak: number
  } | null>(null)
  const completeMission = useGameStore((state) => state.completeMission)
  const penalizeMistake = useGameStore((state) => state.penalizeMistake)
  const completed = useGameStore((state) => state.completedMissions)
  const { setOverlay } = useHint()

  const node = mission.nodes.find((item) => item.id === currentNodeId)
  const overlayId = `${mission.id}:${celebrating ? "success" : currentNodeId}`
  const overlayLines = useMemo<HintLine[]>(() => {
    if (celebrating) {
      return [
        { he: UI.missionComplete.he, en: UI.missionComplete.en },
        { he: mission.title, en: mission.englishTitle },
      ]
    }
    if (!node) return []
    return [
      { he: node.speaker, en: node.speaker },
      { he: node.hebrewText, en: node.englishTranslation },
      ...node.options.map((option) => ({
        he: option.text,
        en: option.englishTranslation,
      })),
    ]
  }, [celebrating, mission.englishTitle, mission.title, node])

  useEffect(() => {
    setOverlay(overlayId, overlayLines)
    return () => setOverlay(null, null)
  }, [overlayId, overlayLines, setOverlay])

  const alreadyDone = completed.includes(mission.id)

  function pickOption(option: MissionOption) {
    if (celebrating) return
    if (!option.isCorrect) {
      const deducted = penalizeMistake()
      toast.error(
        <span dir="ltr" className="block text-start">
          {option.feedback ?? UI.wrong.en}
        </span>,
        {
          description: deducted > 0 ? `−${formatShekels(deducted)}` : undefined,
        }
      )
      return
    }
    if (option.nextNode === "success") {
      const result = completeMission(mission.id)
      setPayout(result)
      setCelebrating(true)
      if (result.paid) {
        toast.success(
          `${UI.missionComplete.he} · +${formatShekels(result.shekels)} · +${formatXp(result.xp)}`
        )
      } else {
        toast.success(UI.practiceDone.he)
      }
      if (result.bonus) {
        toast.success(
          <span dir="ltr" className="block text-start">
            Streak Bonus Applied
          </span>,
          {
            description: `${UI.streakBonus.he} · ${result.streak} · +${formatShekels(STREAK_BONUS_SHEKELS)}`,
          }
        )
      }
      window.setTimeout(() => onClose(), 1400)
      return
    }
    if (option.nextNode) setCurrentNodeId(option.nextNode)
  }

  return (
    <DialogContent
      className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
      dir="rtl"
      showCloseButton={!celebrating}
    >
      <DialogHeader>
        <DialogTitle className="font-heading text-xl">
          <Hinted he={mission.title} en={mission.englishTitle} />
        </DialogTitle>
        <DialogDescription>
          <Hinted he={mission.setupHebrew} en={mission.setupText} />
        </DialogDescription>
      </DialogHeader>

      {celebrating ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-primary/15 p-6 text-center animate-in zoom-in-95 fade-in duration-300">
          <CheckCircle2 className="size-14 text-primary animate-in zoom-in-50 duration-500" />
          <p className="font-heading text-2xl">{UI.missionComplete.he}</p>
          {payout?.paid ? (
            <p className="text-sm text-muted-foreground">
              +{formatShekels(payout.shekels)} · +{formatXp(payout.xp)}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">{UI.practiceDone.he}</p>
          )}
          {payout?.bonus ? (
            <p className="text-sm text-orange-500">
              {UI.streakBonus.he} · {payout.streak} · +{formatShekels(STREAK_BONUS_SHEKELS)}
            </p>
          ) : null}
        </div>
      ) : node ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-secondary/60 p-4">
            <UserRound className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">{node.speaker}</div>
              <p className="mt-2 font-heading text-2xl font-medium leading-relaxed">
                <Hinted he={node.hebrewText} en={node.englishTranslation} />
              </p>
            </div>
          </div>

          <div className="grid gap-2">
            {node.options.map((option) => (
              <Button
                key={option.text}
                variant="outline"
                className="h-auto min-h-10 justify-start whitespace-normal py-2 text-start"
                onClick={() => pickOption(option)}
              >
                <Hinted he={option.text} en={option.englishTranslation} />
              </Button>
            ))}
          </div>

          {alreadyDone ? (
            <p className="text-center text-xs text-muted-foreground">{UI.practice.he}</p>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              טעות עולה {formatShekels(MISTAKE_PENALTY)}
            </p>
          )}
        </div>
      ) : null}

      <DialogFooter className="sr-only">{UI.close.he}</DialogFooter>
    </DialogContent>
  )
}
