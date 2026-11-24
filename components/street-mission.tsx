"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { CheckCircle2, Volume2, XIcon } from "lucide-react"

import { InteractiveHebrewText } from "@/components/interactive-hebrew-text"
import { Button } from "@/components/ui/button"
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

export function StreetMission({
  mission,
  open,
  onOpenChange,
  onFinished,
}: {
  mission: Mission | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onFinished?: (mission: Mission) => void
}) {
  if (!open || !mission) return null
  return (
    <StreetSession
      key={mission.id}
      mission={mission}
      onClose={() => onOpenChange(false)}
      onFinished={onFinished}
    />
  )
}

function StreetSession({
  mission,
  onClose,
  onFinished,
}: {
  mission: Mission
  onClose: () => void
  onFinished?: (mission: Mission) => void
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
  const hebrew = node ? g(node.hebrewText, gender) : ""
  const english = node ? g(node.englishTranslation, gender) : ""
  const speaker = node ? g(node.speaker, gender) : ""
  const alreadyDone = completed.includes(mission.id)

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
    return () => stop()
  }, [stop])

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
      onFinished?.(mission)
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
            description: (
              <p className="text-orange-500">
                {UI.streakBonus.he} · {result.streak} · +{formatShekels(STREAK_BONUS_SHEKELS)}
              </p>
            ),
          }
        )
      }
      window.setTimeout(() => onClose(), 2200)
      return
    }
    if (option.nextNode) {
      stop()
      setCurrentNodeId(option.nextNode)
    }
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-end"
      data-testid="street-mission"
      dir="rtl"
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/50 to-transparent" />

      <div className="pointer-events-auto relative mx-auto mb-4 w-full max-w-4xl rounded-2xl border border-white/10 bg-black/72 px-4 py-4 shadow-2xl backdrop-blur-sm md:px-8">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.7rem] tracking-[0.24em] text-white/55 uppercase">
              {mission.npcName ?? speaker}
            </p>
            <h2 className="font-heading text-lg text-white md:text-xl">{mission.title}</h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <p className="whitespace-nowrap rounded-full border border-white/20 bg-black/40 px-3 py-1 text-sm tabular-nums text-white/80">
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
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <CheckCircle2 className="size-14 text-emerald-300" />
            <p className="font-heading text-3xl text-white" data-testid="mission-success">
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
            <div className="mb-4 flex items-start gap-3">
              <button
                type="button"
                className="mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20"
                onClick={() => void speak(hebrew)}
                aria-label={UI.listen.he}
                aria-pressed={isPlaying}
                data-testid="mission-tts"
              >
                <Volume2 className={cn("size-5", isPlaying && "text-amber-300")} />
              </button>
              <div className="min-w-0">
                <p className="text-sm text-white/60">{speaker}</p>
                <p className="mt-1 font-heading text-2xl font-medium leading-snug text-white md:text-4xl">
                  <InteractiveHebrewText
                    key={`${node.id}-${gender}`}
                    text={hebrew}
                    wordBank={node.wordBank}
                  />
                </p>
                <p className="mt-2 text-[0.7rem] text-white/45">{UI.wordHint.he}</p>
              </div>
            </div>
            <div className="space-y-2">
              {node.options.map((option, index) => {
                const label = g(option.text, gender)
                const latin = /[A-Za-z]/.test(label)
                return (
                  <Button
                    key={`${label}-${index}`}
                    variant="outline"
                    dir={latin ? "ltr" : "rtl"}
                    className="h-auto min-h-11 w-full justify-start whitespace-normal rounded-2xl border-white/25 bg-black/45 py-2.5 text-start text-base text-white hover:bg-white/20 hover:text-white md:text-lg"
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
    </div>
  )
}
