"use client"

import { useEffect, useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"

import { AuthProvider } from "@/components/auth-provider"
import { HintProvider } from "@/components/hint-provider"
import { Hud } from "@/components/hud"
import { LoginModal } from "@/components/login-modal"
import { WelcomeModal } from "@/components/welcome-modal"
import { Toaster } from "@/components/ui/sonner"
import { UI } from "@/lib/copy"
import { useGameStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function Providers({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const setHydrated = useGameStore((state) => state.setHydrated)
  const pathname = usePathname()
  const streets = pathname === "/"

  useEffect(() => {
    void useGameStore.persist.rehydrate().then(() => {
      const state = useGameStore.getState()
      if (!state.sawWelcome) state.showWelcome()
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
        <div className="flex h-svh flex-col">
          <Hud />
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col",
              streets ? "overflow-hidden" : "mx-auto w-full max-w-6xl overflow-y-auto px-4 py-6"
            )}
          >
            {children}
          </div>
        </div>
        <LoginModal />
        <WelcomeModal />
        <Toaster position="bottom-center" theme="dark" dir="rtl" />
      </HintProvider>
    </AuthProvider>
  )
}
