"use client"

import { UI } from "@/lib/copy"

export function DuskSting({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div
      data-testid="dusk-sting"
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-6"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-[11px] tracking-[0.55em] text-amber-200/80 uppercase">
          {UI.appName.en}
        </p>
        <h1
          className="font-heading text-4xl text-white drop-shadow-[0_8px_28px_rgba(0,0,0,0.85)] md:text-6xl"
          data-testid="dusk-sting-title"
        >
          {UI.gtaTelAviv.he}
        </h1>
        <p className="font-heading text-lg text-orange-200 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] md:text-2xl">
          {UI.stingSub.he}
        </p>
        <p className="max-w-md text-sm text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {UI.stingTag.he}
        </p>
      </div>
    </div>
  )
}
