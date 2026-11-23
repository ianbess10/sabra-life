"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { User } from "@supabase/supabase-js"

import { useGameStore } from "@/lib/store"
import { createClient } from "@/utils/supabase/client"
import { isSupabaseConfigured } from "@/utils/supabase/env"

type AuthContextValue = {
  user: User | null
  loading: boolean
  configured: boolean
  loginOpen: boolean
  setLoginOpen: (open: boolean) => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(configured)
  const [loginOpen, setLoginOpen] = useState(false)
  const syncWithCloud = useGameStore((state) => state.syncWithCloud)
  const setSyncStatus = useGameStore((state) => state.setSyncStatus)
  const setUserId = useGameStore((state) => state.setUserId)

  useEffect(() => {
    if (!configured) {
      setSyncStatus("offline")
      return
    }

    const supabase = createClient()
    if (!supabase) {
      setSyncStatus("offline")
      return
    }

    let active = true

    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      setUser(data.user ?? null)
      setUserId(data.user?.id ?? null)
      setLoading(false)
      if (data.user) void syncWithCloud()
      else setSyncStatus("offline")
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setUserId(session?.user?.id ?? null)
      if (session?.user && event !== "INITIAL_SESSION") {
        void syncWithCloud()
      }
      if (!session?.user) setSyncStatus("offline")
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [configured, setSyncStatus, setUserId, syncWithCloud])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    if (supabase) await supabase.auth.signOut()
    setUser(null)
    setUserId(null)
    setSyncStatus("offline")
  }, [setSyncStatus, setUserId])

  const value = useMemo(
    () => ({
      user,
      loading,
      configured,
      loginOpen,
      setLoginOpen,
      signOut,
    }),
    [configured, loading, loginOpen, signOut, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
