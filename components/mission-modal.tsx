"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { CheckCircle2, MessageCircle, UserRound } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { UI } from "@/lib/copy"
import { formatShekels, formatXp } from "@/lib/format"
import { answersMatch } from "@/lib/hebrew"
import { useGameStore } from "@/lib/store"
import type { HintLine, Mission, MissionChoice } from "@/lib/types"

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
  const [stepIndex, setStepIndex] = useState(0)
  const [typed, setTyped] = useState("")
  const [feedback, setFeedback] = useState<{
    kind: "ok" | "bad"
    he: string
    en: string
  } | null>(null)
  const [done, setDone] = useState(false)
  const [payout, setPayout] = useState<{ shekels: number; xp: number; paid: boolean } | null>(
    null
  )
  const completeMission = useGameStore((state) => state.completeMission)
  const recordFail = useGameStore((state) => state.recordFail)
  const completed = useGameStore((state) => state.completedMissions)
  const { setOverlay, revealed } = useHint()

  const step = mission.steps[stepIndex]
  const overlayId = `${mission.id}:${done ? "done" : step?.id}`
  const overlayLines = useMemo<HintLine[]>(() => {
    if (done) {
      return [
        { he: mission.successHe, en: mission.successEn },
        { he: UI.missionComplete.he, en: UI.missionComplete.en },
      ]
    }
    if (!step) return []
    const lines: HintLine[] = [
      { he: step.npcHe, en: step.npcEn },
      { he: step.promptHe, en: step.promptEn },
    ]
    for (const choice of step.choices ?? []) {
      lines.push({ he: choice.textHe, en: choice.textEn })
    }
    if (feedback) lines.push({ he: feedback.he, en: feedback.en })
    return lines
  }, [done, feedback, mission.successEn, mission.successHe, step])

  useEffect(() => {
    setOverlay(overlayId, overlayLines)
    return () => setOverlay(null, null)
  }, [overlayId, overlayLines, setOverlay])

  const alreadyDone = completed.includes(mission.id)

  function succeedStep(he: string, en: string) {
    setFeedback({ kind: "ok", he, en })
  }

  function failStep(he: string, en: string) {
    recordFail(mission.id)
    setFeedback({ kind: "bad", he, en })
    toast.error(UI.wrong.he)
  }

  function pickChoice(choice: MissionChoice) {
    if (feedback?.kind === "ok") return
    if (choice.correct) succeedStep(choice.reactionHe, choice.reactionEn)
    else failStep(choice.reactionHe, choice.reactionEn)
  }

  function submitTyped() {
    if (!step || step.type !== "type") return
    if (answersMatch(typed, step.acceptedAnswers ?? [])) {
      succeedStep("נכון. אפשר להמשיך.", "Correct. You can continue.")
    } else {
      failStep(step.failHe, step.failEn)
    }
  }

  function goNext() {
    if (!step) return
    const last = stepIndex >= mission.steps.length - 1
    if (last) {
      const result = completeMission(mission.id)
      setPayout(result)
      setDone(true)
      if (result.paid) {
        toast.success(
          `${UI.missionComplete.he} · +${formatShekels(result.shekels)} · +${formatXp(result.xp)}`
        )
      } else {
        toast.success(UI.practiceDone.he)
      }
      return
    }
    setStepIndex((index) => index + 1)
    setTyped("")
    setFeedback(null)
  }

  return (
    <DialogContent
      className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
      dir="rtl"
      showCloseButton
    >
      <DialogHeader>
        <DialogTitle className="font-heading text-xl">
          <Hinted he={mission.titleHe} en={mission.titleEn} />
        </DialogTitle>
        <DialogDescription>
          <Hinted he={mission.summaryHe} en={mission.summaryEn} />
        </DialogDescription>
      </DialogHeader>

      {done ? (
        <div className="space-y-3 rounded-xl bg-primary/15 p-4">
          <CheckCircle2 className="size-8 text-primary" />
          <p className="font-heading text-lg">
            <Hinted he={mission.successHe} en={mission.successEn} />
          </p>
          {payout?.paid ? (
            <p className="text-sm text-muted-foreground">
              {formatShekels(payout.shekels)} · {formatXp(payout.xp)}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">{UI.practiceDone.he}</p>
          )}
          <Button className="w-full" onClick={onClose}>
            {UI.close.he}
          </Button>
        </div>
      ) : step ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-secondary/60 p-3">
            <UserRound className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">
                <Hinted he={step.npcHe} en={step.npcEn} />
              </div>
              <p className="mt-1 text-base leading-relaxed">
                <Hinted he={step.promptHe} en={step.promptEn} />
              </p>
            </div>
          </div>

          {step.type === "choice" ? (
            <div className="grid gap-2">
              {step.choices?.map((choice) => (
                <Button
                  key={choice.id}
                  variant="outline"
                  className="h-auto min-h-10 justify-start whitespace-normal py-2 text-start"
                  onClick={() => pickChoice(choice)}
                  disabled={feedback?.kind === "ok"}
                >
                  <Hinted he={choice.textHe} en={choice.textEn} />
                </Button>
              ))}
            </div>
          ) : (
            <form
              className="flex flex-col gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                submitTyped()
              }}
            >
              <label className="text-xs text-muted-foreground">
                <Hinted he={UI.typeAnswer.he} en={UI.typeAnswer.en} />
              </label>
              <Input
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                placeholder={
                  revealed
                    ? (step.typePlaceholderEn ?? step.typePlaceholderHe)
                    : step.typePlaceholderHe
                }
                disabled={feedback?.kind === "ok"}
                autoComplete="off"
              />
              <Button type="submit" disabled={feedback?.kind === "ok" || !typed.trim()}>
                {UI.confirm.he}
              </Button>
            </form>
          )}

          {feedback ? (
            <div
              className={
                feedback.kind === "ok"
                  ? "flex items-start gap-2 rounded-lg bg-primary/15 p-3 text-sm"
                  : "flex items-start gap-2 rounded-lg bg-destructive/15 p-3 text-sm"
              }
            >
              <MessageCircle className="mt-0.5 size-4 shrink-0" />
              <Hinted he={feedback.he} en={feedback.en} />
            </div>
          ) : null}

          {feedback?.kind === "ok" ? (
            <Button className="w-full" onClick={goNext}>
              {UI.continue.he}
            </Button>
          ) : null}

          {alreadyDone ? (
            <p className="text-center text-xs text-muted-foreground">{UI.practice.he}</p>
          ) : null}
        </div>
      ) : null}

      <DialogFooter className="sr-only">{UI.close.he}</DialogFooter>
    </DialogContent>
  )
}
