"use client"

import { useHint } from "@/components/hint-provider"

export function Hinted({
  he,
  en,
  className,
  enClassName,
  inline = false,
}: {
  he: string
  en: string
  className?: string
  enClassName?: string
  inline?: boolean
}) {
  const { revealed } = useHint()

  return (
    <span className={className}>
      <span dir="auto">{he}</span>
      {revealed ? (
        <span
          dir="ltr"
          className={
            enClassName ??
            (inline
              ? "ms-1 text-[0.65rem] font-normal tracking-wide text-amber-300/85"
              : "mt-0.5 block text-[0.7rem] font-normal tracking-wide text-amber-300/85")
          }
        >
          {en}
        </span>
      ) : null}
    </span>
  )
}
