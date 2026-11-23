"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Banknote,
  BedDouble,
  Bike,
  BookOpen,
  Bus,
  Car,
  Flame,
  Home,
  LandPlot,
  Languages,
  MapPinned,
  Smartphone,
  Trophy,
  Zap,
} from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { CloudStatus } from "@/components/cloud-status"
import { LeaderboardModal } from "@/components/leaderboard-modal"
import { useHint } from "@/components/hint-provider"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { ownedPropertyItem, ownedVehicleItem } from "@/lib/catalog"
import { CITIES } from "@/lib/cities"
import { UI } from "@/lib/copy"
import { formatShekels } from "@/lib/format"
import { HINT_COST, levelFromXp, xpProgress } from "@/lib/levels"
import { isMissionDayToday } from "@/lib/streak"
import { useGameStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/", label: UI.navHome, icon: Home },
  { href: "/map", label: UI.navMap, icon: MapPinned },
  { href: "/yad2", label: UI.navYad2, icon: LandPlot },
]

function VehicleIcon({ id }: { id: string | null }) {
  if (id === "rav-kav") return <Bus className="size-4" />
  if (id === "korkinet") return <Bike className="size-4" />
  if (id === "mazda") return <Car className="size-4" />
  if (id === "tesla") return <Zap className="size-4" />
  return <Smartphone className="size-4 opacity-40" />
}

function PropertyIcon({ id }: { id: string | null }) {
  if (id === "hostel") return <BedDouble className="size-4" />
  if (id) return <Home className="size-4" />
  return <Home className="size-4 opacity-40" />
}

export function Hud() {
  const pathname = usePathname()
  const shekels = useGameStore((state) => state.shekels)
  const xp = useGameStore((state) => state.xp)
  const location = useGameStore((state) => state.location)
  const inventory = useGameStore((state) => state.inventory)
  const currentStreak = useGameStore((state) => state.currentStreak)
  const lastMissionDate = useGameStore((state) => state.lastMissionDate)
  const { requestHint, revealed } = useHint()
  const { user, setLoginOpen, signOut } = useAuth()
  const showWelcome = useGameStore((state) => state.showWelcome)
  const [leaderboardOpen, setLeaderboardOpen] = useState(false)
  const level = levelFromXp(xp)
  const city = CITIES.find((item) => item.slug === location)
  const vehicle = ownedVehicleItem(inventory)
  const property = ownedPropertyItem(inventory)
  const canHint = shekels >= HINT_COST || revealed

  return (
    <header className="sticky top-0 z-60 border-b border-border/70 bg-[color-mix(in_oklch,var(--background)_88%,black)]/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:flex-wrap md:items-center md:justify-between">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
          <Link href="/" className="font-heading text-lg tracking-tight text-primary">
            {UI.appName.he}
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    buttonVariants({
                      variant: active ? "secondary" : "ghost",
                      size: "sm",
                    })
                  )}
                >
                  <Icon data-icon="inline-start" />
                  {item.label.he}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-2 text-xs sm:grid-cols-4 sm:text-sm">
          <Stat
            testId="hud-level"
            label={UI.level.he}
            value={`${level.level} · ${level.nameHe}`}
            extra={
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${xpProgress(xp)}%` }}
                />
              </div>
            }
          />
          <Stat
            testId="hud-shekels"
            label={UI.bank.he}
            value={formatShekels(shekels)}
            icon={<Banknote className="size-3.5 text-amber-300" />}
          />
          <Stat label={UI.location.he} value={city?.nameHe ?? location} />
          <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-lg bg-secondary/70 px-2.5 py-1.5">
            <Badge variant="outline" className="max-w-full gap-1" data-testid="hud-vehicle">
              <VehicleIcon id={inventory.vehicle} />
              {vehicle?.nameHe ?? UI.onFoot.he}
            </Badge>
            <Badge variant="outline" className="max-w-full gap-1">
              <PropertyIcon id={inventory.property} />
              {property?.nameHe ?? UI.noHome.he}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1 text-sm font-medium tabular-nums"
            title={`${UI.streak.he}${currentStreak ? ` · ${currentStreak}` : ""}`}
            data-testid="hud-streak"
          >
            <Flame
              data-testid="hud-flame"
              className={cn(
                "size-4",
                isMissionDayToday(lastMissionDate) ? "text-orange-500" : "text-gray-400"
              )}
            />
            {currentStreak}
          </span>
          <CloudStatus />
          <Button
            variant="outline"
            size="sm"
            data-testid="open-welcome"
            onClick={() => showWelcome()}
            title={UI.howToPlay.he}
          >
            <BookOpen data-icon="inline-start" />
            {UI.howToPlay.he}
          </Button>
          <Button
            variant={leaderboardOpen ? "secondary" : "outline"}
            size="sm"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => setLeaderboardOpen((open) => !open)}
            title={UI.leaderboard.he}
            aria-pressed={leaderboardOpen}
          >
            <Trophy data-icon="inline-start" />
            {UI.leaderboard.he}
          </Button>
          {user ? (
            <Button
              variant="outline"
              size="sm"
              data-testid="sign-out"
              onClick={() => void signOut()}
            >
              {UI.signOut.he}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              data-testid="open-login"
              onClick={() => setLoginOpen(true)}
            >
              {UI.signIn.he}
            </Button>
          )}
          <Button
            variant={revealed ? "secondary" : "outline"}
            size="sm"
            className="min-w-40 shrink-0"
            disabled={!canHint && !revealed}
            onClick={() => requestHint()}
            title={!canHint ? UI.noMoney.he : UI.hint.he}
          >
            <Languages data-icon="inline-start" />
            {revealed ? "תרגום פעיל" : `${UI.hint.he} · ₪${HINT_COST}`}
          </Button>
        </div>
      </div>
      <LeaderboardModal open={leaderboardOpen} onOpenChange={setLeaderboardOpen} />
    </header>
  )
}

function Stat({
  label,
  value,
  icon,
  extra,
  testId,
}: {
  label: string
  value: string
  icon?: ReactNode
  extra?: ReactNode
  testId?: string
}) {
  return (
    <div
      className="min-w-0 rounded-lg bg-secondary/60 px-2.5 py-1.5"
      data-testid={testId}
    >
      <div className="flex items-center gap-1 text-[0.7rem] text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className={cn("truncate font-medium", extra && "leading-tight")}>{value}</div>
      {extra}
    </div>
  )
}
