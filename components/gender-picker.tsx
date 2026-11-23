"use client"

import { GENDERS, type Gender } from "@/lib/gender"
import { useGameStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function GenderPicker({
  compact = false,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  const gender = useGameStore((state) => state.gender)
  const setGender = useGameStore((state) => state.setGender)

  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      data-testid="gender-picker"
      role="group"
      aria-label="Hebrew gender profile"
    >
      {GENDERS.map((item) => (
        <GenderChip
          key={item.id}
          item={item}
          selected={gender === item.id}
          compact={compact}
          onSelect={setGender}
        />
      ))}
    </div>
  )
}

function GenderChip({
  item,
  selected,
  compact,
  onSelect,
}: {
  item: (typeof GENDERS)[number]
  selected: boolean
  compact: boolean
  onSelect: (gender: Gender) => void
}) {
  if (compact) {
    return (
      <Button
        type="button"
        size="sm"
        variant={selected ? "default" : "outline"}
        data-testid={`hud-gender-${item.id}`}
        aria-pressed={selected}
        onClick={() => onSelect(item.id)}
        title={`${item.he} · ${item.sampleHe}`}
      >
        {item.he}
      </Button>
    )
  }

  return (
    <button
      type="button"
      data-testid={`gender-${item.id}`}
      aria-pressed={selected}
      onClick={() => onSelect(item.id)}
      className={cn(
        "flex min-w-40 flex-1 flex-col rounded-2xl border px-4 py-3 text-start transition-colors",
        selected
          ? "border-primary bg-primary/15 ring-2 ring-primary"
          : "border-border bg-card/40 hover:bg-muted/60"
      )}
    >
      <span className="font-heading text-lg">{item.he}</span>
      <span dir="ltr" className="text-xs text-muted-foreground">
        {item.en}
      </span>
      <span className="mt-2 font-heading text-sm leading-snug">{item.sampleHe}</span>
      <span dir="ltr" className="mt-1 text-[0.7rem] text-muted-foreground">
        {item.sampleEn}
      </span>
    </button>
  )
}
