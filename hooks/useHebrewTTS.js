"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Browser Web Speech engine. Swap `speakWithEngine` later for Google Cloud TTS
 * or ElevenLabs — MissionModal only calls `speak(text)` / reads `isPlaying`.
 * @param {string} text
 * @param {{
 *   onStart: () => void
 *   onEnd: () => void
 *   isCurrent: () => boolean
 * }} handlers
 */
async function speakWithEngine(text, handlers) {
  const synth = getSynth()
  if (!synth) {
    handlers.onEnd()
    return
  }

  const voices = await waitForVoices(synth)
  if (!handlers.isCurrent()) {
    handlers.onEnd()
    return
  }

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = "he-IL"
  utterance.rate = 0.9

  const hebrewVoice = pickHebrewVoice(voices)
  if (hebrewVoice) {
    try {
      utterance.voice = hebrewVoice
    } catch {
      // lang=he-IL still selects a Hebrew voice if the engine rejects the object
    }
  }

  utterance.onstart = () => handlers.onStart()
  utterance.onend = () => handlers.onEnd()
  utterance.onerror = () => handlers.onEnd()

  if (synth.speaking || synth.pending) synth.cancel()

  await new Promise((resolve) => {
    window.setTimeout(resolve, 0)
  })
  if (!handlers.isCurrent()) {
    handlers.onEnd()
    return
  }

  synth.speak(utterance)
}

function getSynth() {
  if (typeof window === "undefined") return null
  return window.speechSynthesis ?? null
}

/** @type {Promise<SpeechSynthesisVoice[]> | null} */
let voicesPromise = null

/** @param {SpeechSynthesis} synth */
function waitForVoices(synth) {
  if (voicesPromise) return voicesPromise

  voicesPromise = new Promise((resolve) => {
    const read = () => synth.getVoices()
    const existing = read()
    if (existing.length > 0) {
      resolve(existing)
      return
    }

    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      synth.removeEventListener("voiceschanged", finish)
      resolve(read())
    }

    synth.addEventListener("voiceschanged", finish)
    window.setTimeout(finish, 1500)
  }).then((voices) => {
    if (voices.length === 0) voicesPromise = null
    return voices
  })

  return voicesPromise
}

/** @param {SpeechSynthesisVoice[]} voices */
function pickHebrewVoice(voices) {
  const hebrew = voices.filter((voice) =>
    (voice.lang || "").toLowerCase().includes("he")
  )
  return (
    hebrew.find((voice) => voice.lang.toLowerCase() === "he-il") ||
    hebrew.find((voice) => voice.localService) ||
    hebrew[0] ||
    null
  )
}

export function useHebrewTTS() {
  const [isPlaying, setIsPlaying] = useState(false)
  const playId = useRef(0)

  const stop = useCallback(() => {
    playId.current += 1
    getSynth()?.cancel()
    setIsPlaying(false)
  }, [])

  const speak = useCallback(
    async (text) => {
      const line = typeof text === "string" ? text.trim() : ""
      if (!line) return

      const id = ++playId.current
      setIsPlaying(true)

      await speakWithEngine(line, {
        isCurrent: () => id === playId.current,
        onStart: () => {
          if (id === playId.current) setIsPlaying(true)
        },
        onEnd: () => {
          if (id === playId.current) setIsPlaying(false)
        },
      })
    },
    []
  )

  useEffect(() => {
    const synth = getSynth()
    if (synth) void waitForVoices(synth)
    const token = playId
    return () => {
      token.current += 1
      getSynth()?.cancel()
    }
  }, [])

  return { speak, isPlaying, stop }
}
