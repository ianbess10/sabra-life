"use client"

import { UI } from "@/lib/copy"
import { TRAILER_DURATION, trailerCaption, type TrailerKind } from "@/lib/trailer"
import { Button } from "@/components/ui/button"

export function ParkingTrailer({
  time,
  kind = "ramzor",
  onSkip,
}: {
  time: number
  kind?: TrailerKind
  onSkip: () => void
}) {
  const caption = trailerCaption(time, kind)
  const left = Math.max(0, TRAILER_DURATION - time)
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[35] flex flex-col justify-between px-6 py-8"
      data-testid="parking-trailer"
      data-trailer-kind={kind}
    >
      <div className="flex items-start justify-end">
        <Button
          type="button"
          data-testid="parking-trailer-skip"
          size="sm"
          variant="secondary"
          className="pointer-events-auto bg-black/70 text-white hover:bg-black/85"
          onClick={onSkip}
        >
          {UI.skipTrailer.he} · {Math.ceil(left)}s
        </Button>
      </div>
      <div className="mb-10 text-center">
        <p
          className="font-heading text-3xl text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.85)] md:text-5xl"
          data-testid="parking-trailer-caption"
        >
          {caption.he}
        </p>
        <p className="mt-2 text-sm text-white/70">{caption.en}</p>
      </div>
    </div>
  )
}
