"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { CheckCircle2, Volume2, XIcon } from "lucide-react"

import { CinematicScene, sceneMeta } from "@/components/cinematic-scene"
import { InteractiveHebrewText } from "@/components/interactive-hebrew-text"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useHint } from "@/components/hint-provider"
import { useHebrewTTS } from "@/hooks/useHebrewTTS"
import { UI } from "@/lib/copy"
import { formatShekels, formatXp } from "@/lib/format"
import { g } from "@/lib/gender"
import { MISTAKE_PENALTY } from "@/lib/levels"
import { STREAK_BONUS_SHEKELS } from "@/lib/streak"
import { useGameStore } from "@/lib/store"
import type { HintLine, Mission, MissionOption } from "@/lib/types"
import { cn } from "@/lib/utils"

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
  const gender = useGameStore((state) => state.gender)
  const { speak, isPlaying, stop } = useHebrewTTS()
  const { setOverlay } = useHint()

  const nodeIndex = mission.nodes.findIndex((item) => item.id === currentNodeId)
  const node = nodeIndex >= 0 ? mission.nodes[nodeIndex] : undefined
  const phraseTotal = mission.nodes.length
  const phraseNumber = Math.max(1, nodeIndex + 1)
  const scene = sceneMeta(mission.scene)
  const hebrew = node ? g(node.hebrewText, gender) : ""
  const english = node ? g(node.englishTranslation, gender) : ""
  const speaker = node ? g(node.speaker, gender) : ""
  const setupHe = g(mission.setupHebrew, gender)

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
      { he: speaker, en: speaker },
      { he: hebrew, en: english },
      ...node.options.map((option) => ({
        he: g(option.text, gender),
        en: g(option.englishTranslation, gender),
      })),
    ]
  }, [celebrating, english, gender, hebrew, mission.englishTitle, mission.title, node, speaker])

  useEffect(() => {
    setOverlay(overlayId, overlayLines)
    return () => setOverlay(null, null)
  }, [overlayId, overlayLines, setOverlay])

  useEffect(() => {
    if (celebrating || !hebrew) return
    void speak(hebrew)
    // Auto-play each phrase like the driving trainer video.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNodeId, celebrating])

  const alreadyDone = completed.includes(mission.id)

  function pickOption(option: MissionOption) {
    if (celebrating) return
    if (!option.isCorrect) {
      const deducted = penalizeMistake()
      toast.error(
        <span dir="ltr" className="block text-start">
          {g(option.feedback, gender) || UI.wrong.en}
        </span>,
        {
          description: deducted > 0 ? `−${formatShekels(deducted)}` : undefined,
        }
      )
      return
    }
    if (option.nextNode === "success") {
      stop()
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
    if (option.nextNode) {
      stop()
      setCurrentNodeId(option.nextNode)
    }
  }

  return (
    <DialogContent variant="cinematic" dir="rtl" showCloseButton={false}>
      <DialogHeader className="sr-only">
        <DialogTitle>{mission.title}</DialogTitle>
        <DialogDescription>{setupHe}</DialogDescription>
      </DialogHeader>

      <CinematicScene scene={mission.scene} showChrome={false} className="h-full min-h-0 flex-1">
        <div className="relative z-10 flex h-full min-h-0 flex-col">
          <div className="flex items-start justify-between gap-3 px-5 pt-5 md:px-8 md:pt-7">
            <div className="min-w-0 flex-1 pe-2">
              <p className="text-[0.7rem] tracking-[0.28em] text-white/55 uppercase">
                {scene.labelHe} · {mission.npcName ?? speaker}
              </p>
              <h2 className="mt-1 font-heading text-xl text-white md:text-2xl">
                {mission.title}
              </h2>
              <p className="mt-1 max-w-xl text-xs text-white/65">{setupHe}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <p className="whitespace-nowrap rounded-full border border-white/20 bg-black/30 px-3 py-1 text-sm tabular-nums text-white/80">
                {UI.phrase.he} {phraseNumber}/{phraseTotal}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-white hover:bg-white/15 hover:text-white"
                onClick={onClose}
                aria-label={UI.close.he}
              >
                <XIcon />
              </Button>
            </div>
          </div>

          {celebrating ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
              <CheckCircle2 className="size-16 text-emerald-300 animate-in zoom-in-50 duration-500" />
              <p className="font-heading text-4xl text-white md:text-5xl" data-testid="mission-success">
                {UI.missionComplete.he}
              </p>
              {payout?.paid ? (
                <p className="text-white/80">
                  +{formatShekels(payout.shekels)} · +{formatXp(payout.xp)}
                </p>
              ) : (
                <p className="text-white/70">{UI.practiceDone.he}</p>
              )}
              {payout?.bonus ? (
                <p className="text-orange-500">
                  {UI.streakBonus.he} · {payout.streak} · +{formatShekels(STREAK_BONUS_SHEKELS)}
                </p>
              ) : null}
            </div>
          ) : node ? (
            <>
              <div className="flex min-h-0 flex-1 flex-col justify-center px-5 py-6 md:px-12">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-white/60">{speaker}</p>
                  <button
                    type="button"
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:ring-3 focus-visible:ring-white/40"
                    onClick={() => void speak(hebrew)}
                    aria-label={UI.listen.he}
                    aria-pressed={isPlaying}
                    title={UI.listen.he}
                    data-testid="mission-tts"
                  >
                    <Volume2 className={cn("size-5", isPlaying && "text-amber-300")} />
                  </button>
                </div>
                <p className="mt-6 font-heading text-3xl font-medium leading-relaxed text-white md:text-5xl">
                  <InteractiveHebrewText
                    key={`${node.id}-${gender}`}
                    text={hebrew}
                    wordBank={node.wordBank}
                  />
                </p>
                <p className="mt-3 text-[0.7rem] text-white/50">{UI.wordHint.he}</p>
              </div>

              <div className="space-y-2 px-4 pb-6 md:px-10">
                {node.options.map((option, index) => {
                  const label = g(option.text, gender)
                  const latin = /[A-Za-z]/.test(label)
                  return (
                    <Button
                      key={`${label}-${index}`}
                      variant="outline"
                      dir={latin ? "ltr" : "rtl"}
                      className="h-auto min-h-12 w-full justify-start whitespace-normal rounded-2xl border-white/25 bg-white/10 py-3 text-start text-base text-white hover:bg-white/20 hover:text-white md:text-lg"
                      onClick={() => pickOption(option)}
                    >
                      {label}
                    </Button>
                  )
                })}
                <p className="pt-1 text-center text-xs text-white/45">
                  {alreadyDone
                    ? UI.practice.he
                    : `טעות עולה ${formatShekels(MISTAKE_PENALTY)}`}
                </p>
              </div>
            </>
          ) : null}
        </div>
      </CinematicScene>
    </DialogContent>
  )
}
