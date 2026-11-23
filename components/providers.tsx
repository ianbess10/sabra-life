"use client"

import { useEffect, useState, type ReactNode } from "react"

import { AuthProvider } from "@/components/auth-provider"
import { HintProvider } from "@/components/hint-provider"
import { Hud } from "@/components/hud"
import { LoginModal } from "@/components/login-modal"
import { Toaster } from "@/components/ui/sonner"
import { UI } from "@/lib/copy"
import { useGameStore } from "@/lib/store"

export function Providers({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const setHydrated = useGameStore((state) => state.setHydrated)

  useEffect(() => {
    void useGameStore.persist.rehydrate().then(() => {
      setHydrated()
      setReady(true)
    })
  }, [setHydrated])

  useEffect(() => {
    if (!ready || process.env.NEXT_PUBLIC_E2E !== "1") return
    Object.assign(window, { __SABRA_STORE__: useGameStore })
  }, [ready])

  if (!ready) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <p className="font-heading text-xl text-primary">{UI.loading.he}</p>
      </div>
    )
  }

  return (
    <AuthProvider>
      <HintProvider>
        <Hud />
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</div>
        <LoginModal />
        <Toaster position="bottom-center" theme="dark" dir="rtl" />
      </HintProvider>
    </AuthProvider>
  )
}
