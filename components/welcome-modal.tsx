"use client"

import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { GenderPicker } from "@/components/gender-picker"
import { UI } from "@/lib/copy"
import { WELCOME } from "@/lib/welcome"
import { useGameStore } from "@/lib/store"

function MixedText({ text }: { text: string }) {
  const parts = text.split(/(\₪\d+|[\u0590-\u05FF״׳]+(?:\s+[\u0590-\u05FF״׳]+)*)/g)
  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null
        if (/^₪\d+$/.test(part)) {
          return (
            <span key={index} dir="ltr">
              {part}
            </span>
          )
        }
        if (/[\u0590-\u05FF]/.test(part)) {
          return <bdi key={index}>{part}</bdi>
        }
        return <span key={index}>{part}</span>
      })}
    </>
  )
}

export function WelcomeModal() {
  const welcomeOpen = useGameStore((state) => state.welcomeOpen)
  const dismissWelcome = useGameStore((state) => state.dismissWelcome)

  return (
    <Dialog
      open={welcomeOpen}
      onOpenChange={(open) => {
        if (!open) dismissWelcome()
      }}
    >
      <DialogContent
        className="flex max-h-[min(40rem,85vh)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
        showCloseButton={false}
      >
        <DialogHeader dir="ltr" className="border-b border-border/70 px-5 py-4 text-left">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-wide text-primary uppercase">
                {WELCOME.kicker}
              </p>
              <DialogTitle className="font-heading text-2xl leading-tight">
                {WELCOME.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {WELCOME.subtitle}
              </DialogDescription>
            </div>
            <DialogClose
              render={
                <Button variant="ghost" size="icon-sm" aria-label={UI.close.he} />
              }
            >
              <XIcon />
            </DialogClose>
          </div>
        </DialogHeader>

        <div
          dir="ltr"
          className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4 text-left leading-relaxed"
          data-testid="welcome-modal"
        >
          <p>
            <MixedText text={WELCOME.intro} />
          </p>
          <section className="space-y-2">
            <h3 className="font-heading text-base text-primary">Speak as yourself</h3>
            <p className="text-sm text-muted-foreground">
              Pick the Hebrew that addresses you. NPCs will switch אתה/את, צריך/צריכה, משלם/משלמת
              to match.
            </p>
            <div dir="rtl">
              <GenderPicker />
            </div>
          </section>
          {WELCOME.sections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h3 className="font-heading text-base text-primary">{section.title}</h3>
              {section.body ? (
                <p className="text-sm text-muted-foreground">
                  <MixedText text={section.body} />
                </p>
              ) : null}
              {section.items ? (
                <ul className="list-disc space-y-1.5 ps-5 text-sm text-muted-foreground">
                  {section.items.map((item) => (
                    <li key={item}>
                      <MixedText text={item} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <DialogFooter dir="ltr" className="mx-0 mb-0 rounded-none sm:justify-start">
          <Button
            data-testid="welcome-dismiss"
            className="w-full sm:w-auto"
            onClick={() => dismissWelcome()}
          >
            {UI.welcomeCta.he}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
