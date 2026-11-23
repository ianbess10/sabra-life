"use client"

import { useState } from "react"
import { toast } from "sonner"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { UI } from "@/lib/copy"
import { useGameStore } from "@/lib/store"
import { createClient } from "@/utils/supabase/client"

type Mode = "signin" | "signup"

export function LoginModal() {
  const { loginOpen, setLoginOpen, configured } = useAuth()
  const syncWithCloud = useGameStore((state) => state.syncWithCloud)
  const [mode, setMode] = useState<Mode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [info, setInfo] = useState<string | null>(null)

  async function submit() {
    setInfo(null)
    if (!configured) {
      toast.error(UI.supabaseMissing.he)
      return
    }
    const supabase = createClient()
    if (!supabase) {
      toast.error(UI.supabaseMissing.he)
      return
    }
    setBusy(true)
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          toast.error(error.message)
          return
        }
        await syncWithCloud()
        setLoginOpen(false)
        toast.success(UI.signedIn.he)
        return
      }

      const origin = window.location.origin
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
          data: { username: email.split("@")[0] },
        },
      })
      if (error) {
        toast.error(error.message)
        return
      }
      if (data.session) {
        await syncWithCloud()
        setLoginOpen(false)
        toast.success(UI.signedIn.he)
        return
      }
      setInfo(UI.checkEmail.he)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {mode === "signin" ? UI.signIn.he : UI.signUp.he}
          </DialogTitle>
          <DialogDescription>{UI.authBlurb.he}</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Button
            variant={mode === "signin" ? "default" : "outline"}
            className="flex-1"
            data-testid="login-mode-signin"
            onClick={() => setMode("signin")}
          >
            {UI.signIn.he}
          </Button>
          <Button
            variant={mode === "signup" ? "default" : "outline"}
            className="flex-1"
            data-testid="login-mode-signup"
            onClick={() => setMode("signup")}
          >
            {UI.signUp.he}
          </Button>
        </div>

        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            void submit()
          }}
        >
          <label className="grid gap-1 text-sm">
            {UI.email.he}
            <Input
              type="email"
              dir="ltr"
              autoComplete="email"
              required
              data-testid="login-email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm">
            {UI.password.he}
            <Input
              type="password"
              dir="ltr"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              data-testid="login-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {info ? <p className="text-sm text-primary">{info}</p> : null}
          {!configured ? (
            <p className="text-sm text-amber-200">{UI.supabaseMissing.he}</p>
          ) : null}
          <Button type="submit" disabled={busy || !configured} data-testid="login-submit">
            {busy ? UI.working.he : mode === "signin" ? UI.signIn.he : UI.signUp.he}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
