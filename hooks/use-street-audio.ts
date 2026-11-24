"use client"

import { useEffect, useRef, useState } from "react"

const E2E = process.env.NEXT_PUBLIC_E2E === "1"

export function useStreetAudio(enabled: boolean) {
  const [muted, setMuted] = useState(true)
  const ctxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (E2E || !enabled || muted) return

    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return

    const ctx = ctxRef.current ?? new AudioCtx()
    ctxRef.current = ctx
    void ctx.resume()

    const master = ctx.createGain()
    master.gain.value = 0.07
    master.connect(ctx.destination)

    const pad = ctx.createOscillator()
    pad.type = "sine"
    pad.frequency.value = 92
    const padGain = ctx.createGain()
    padGain.gain.value = 0.35
    pad.connect(padGain).connect(master)
    pad.start()

    const pad2 = ctx.createOscillator()
    pad2.type = "triangle"
    pad2.frequency.value = 138
    const pad2Gain = ctx.createGain()
    pad2Gain.gain.value = 0.12
    pad2.connect(pad2Gain).connect(master)
    pad2.start()

    let dead = false
    function horn() {
      if (dead) return
      const now = ctx.currentTime
      const a = ctx.createOscillator()
      const b = ctx.createOscillator()
      const g = ctx.createGain()
      a.type = "square"
      b.type = "square"
      a.frequency.value = 390
      b.frequency.value = 312
      g.gain.setValueAtTime(0.0001, now)
      g.gain.exponentialRampToValueAtTime(0.22, now + 0.04)
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.42)
      a.connect(g)
      b.connect(g)
      g.connect(master)
      a.start(now)
      b.start(now)
      a.stop(now + 0.45)
      b.stop(now + 0.45)
    }

    const first = window.setTimeout(horn, 1800)
    const loop = window.setInterval(horn, 5200 + Math.random() * 2400)

    return () => {
      dead = true
      window.clearTimeout(first)
      window.clearInterval(loop)
      pad.stop()
      pad2.stop()
      master.disconnect()
    }
  }, [enabled, muted])

  return { muted, setMuted }
}
