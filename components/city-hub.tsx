"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Lock } from "lucide-react"

import { Hinted } from "@/components/hinted"
import { MissionModal } from "@/components/mission-modal"
import { useHintScreen } from "@/components/use-hint-screen"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cityHintLines, type CityInfo } from "@/lib/cities"
import { HUD_HINTS, UI } from "@/lib/copy"
import { formatShekels, formatXp } from "@/lib/format"
import { cityUnlocked, levelFromXp, requiredLevelForCity } from "@/lib/levels"
import { missionsForCity } from "@/lib/missions"
import { useGameStore } from "@/lib/store"
import type { Mission } from "@/lib/types"

export function CityHub({ city }: { city: CityInfo }) {
  const xp = useGameStore((state) => state.xp)
  const completed = useGameStore((state) => state.completedMissions)
  const level = levelFromXp(xp)
  const unlocked = cityUnlocked(city.slug, level.level)
  const required = requiredLevelForCity(city.slug)
  const missions = missionsForCity(city.slug)
  const [active, setActive] = useState<Mission | null>(null)

  const hintLines = useMemo(
    () => [...HUD_HINTS, ...cityHintLines(city), { he: UI.missions.he, en: UI.missions.en }],
    [city]
  )
  useHintScreen(`city:${city.slug}`, hintLines)

  if (!unlocked) {
    return (
      <Card className={`bg-linear-to-br ${city.accent}`}>
        <CardHeader>
          <CardTitle className="font-heading text-3xl">
            <Hinted he={city.nameHe} en={city.nameEn} />
          </CardTitle>
          <CardDescription>
            <Hinted he={city.levelLabelHe} en={city.levelLabelEn} />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Lock className="size-8 text-amber-200" />
          <p>
            העיר נעולה. צריך {required.nameHe} (רמה {required.level}).
          </p>
          <Link href="/map" className={cn(buttonVariants())}>
            {UI.navMap.he}
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <section className={`rounded-3xl bg-linear-to-br ${city.accent} p-6 md:p-8`}>
        <Badge variant="secondary">
          <Hinted he={city.levelLabelHe} en={city.levelLabelEn} />
        </Badge>
        <h1 className="mt-3 font-heading text-4xl">
          <Hinted he={city.nameHe} en={city.nameEn} />
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          <Hinted he={city.vibeHe} en={city.vibeEn} />
        </p>
      </section>

      <h2 className="font-heading text-2xl">
        <Hinted he={UI.missions.he} en={UI.missions.en} />
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {missions.map((mission) => {
          const done = completed.includes(mission.id)
          const locked = mission.minLevel > level.level
          return (
            <Card key={mission.id}>
              <CardHeader>
                <CardTitle>
                  <Hinted he={mission.titleHe} en={mission.titleEn} />
                </CardTitle>
                <CardDescription>
                  {formatShekels(mission.rewardShekels)} · {formatXp(mission.rewardXp)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  <Hinted he={mission.summaryHe} en={mission.summaryEn} />
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={done ? "secondary" : "default"}
                  disabled={locked}
                  onClick={() => setActive(mission)}
                >
                  {locked
                    ? `${UI.locked.he} · רמה ${mission.minLevel}`
                    : done
                      ? UI.practice.he
                      : UI.startMission.he}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <MissionModal
        mission={active}
        open={Boolean(active)}
        onOpenChange={(open) => {
          if (!open) setActive(null)
        }}
      />
    </div>
  )
}
