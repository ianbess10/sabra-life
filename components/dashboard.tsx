"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowLeft, Compass, RotateCcw, Sparkles } from "lucide-react"

import { sceneMeta } from "@/components/cinematic-scene"
import { Hinted } from "@/components/hinted"
import { MissionModal } from "@/components/mission-modal"
import { useHintScreen } from "@/components/use-hint-screen"
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
import { PHONES, DINING, ownedPropertyItem, ownedVehicleItem } from "@/lib/catalog"
import { missionsByChapter, phraseCount } from "@/lib/chapters"
import { CITIES } from "@/lib/cities"
import { HUD_HINTS, UI, asHint } from "@/lib/copy"
import { formatShekels } from "@/lib/format"
import { g, genderedCopy } from "@/lib/gender"
import { levelFromXp } from "@/lib/levels"
import { missionsForCity, nextAvailableMission } from "@/lib/missions"
import { useGameStore } from "@/lib/store"
import type { Mission } from "@/lib/types"

export function Dashboard() {
  const shekels = useGameStore((state) => state.shekels)
  const xp = useGameStore((state) => state.xp)
  const location = useGameStore((state) => state.location)
  const inventory = useGameStore((state) => state.inventory)
  const completed = useGameStore((state) => state.completedMissions)
  const reset = useGameStore((state) => state.reset)
  const showWelcome = useGameStore((state) => state.showWelcome)
  const gender = useGameStore((state) => state.gender)
  const city = CITIES.find((item) => item.slug === location)!
  const level = levelFromXp(xp)
  const next = nextAvailableMission(location, level.level, completed)
  const cityMissions = missionsForCity(location)
  const chapters = missionsByChapter(cityMissions)
  const [active, setActive] = useState<Mission | null>(null)
  const vehicle = ownedVehicleItem(inventory)
  const property = ownedPropertyItem(inventory)
  const phone = PHONES.find((item) => item.id === inventory.phone)
  const dining = DINING.find((item) => item.id === inventory.dining)
  const copy = genderedCopy(gender)
  const doneCount = cityMissions.filter((mission) => completed.includes(mission.id)).length
  const totalCount = cityMissions.length
  const percent = totalCount ? Math.round((doneCount / totalCount) * 100) : 0

  const hintLines = useMemo(
    () => [
      ...HUD_HINTS,
      asHint(UI.welcomeTitle),
      asHint(UI.welcomeBody),
      asHint(UI.howToPlay),
      asHint(UI.nextMission),
      asHint(UI.inventoryTitle),
      asHint(UI.olehTest),
      { he: city.nameHe, en: city.nameEn },
      { he: city.vibeHe, en: city.vibeEn },
    ],
    [city]
  )
  useHintScreen("home", hintLines)

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-teal-500/15 via-background to-amber-400/10 p-6 md:p-8">
        <p className="text-sm text-primary">{UI.tagline.he}</p>
        <h1 className="mt-2 font-heading text-4xl leading-tight md:text-5xl">
          <Hinted he={copy.welcomeTitle} en={copy.welcomeTitleEn} />
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          <Hinted he={UI.welcomeBody.he} en={UI.welcomeBody.en} />
        </p>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-48 flex-1">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{UI.olehTest.he}</span>
              <span>
                {doneCount}/{totalCount} · {percent}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={`/city/${city.slug}`}
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <Compass data-icon="inline-start" />
            {city.nameHe}
          </Link>
          <Link href="/map" className={cn(buttonVariants({ variant: "outline" }))}>
            <ArrowLeft data-icon="inline-start" className="rotate-180" />
            {UI.navMap.he}
          </Link>
          <Button variant="outline" onClick={() => showWelcome()}>
            {UI.howToPlay.he}
          </Button>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-4">
          {next ? (
            <NextMissionCard mission={next} gender={gender} onStart={() => setActive(next)} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  <Hinted he={UI.nextMission.he} en={UI.nextMission.en} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  <Hinted he={UI.allDoneCity.he} en={UI.allDoneCity.en} />
                </p>
              </CardContent>
            </Card>
          )}

          {chapters.map((chapter) => {
            const done = chapter.missions.filter((mission) =>
              completed.includes(mission.id)
            ).length
            return (
              <Card key={chapter.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-3">
                    <span>
                      <Hinted he={chapter.titleHe} en={chapter.titleEn} />
                    </span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {done}/{chapter.missions.length}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    <Hinted he={chapter.blurbHe} en={chapter.blurbEn} />
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {chapter.missions.map((mission) => (
                    <MissionRow
                      key={mission.id}
                      mission={mission}
                      gender={gender}
                      done={completed.includes(mission.id)}
                      onStart={() => setActive(mission)}
                    />
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="h-fit lg:sticky lg:top-32">
          <CardHeader>
            <CardTitle>
              <Hinted he={UI.inventoryTitle.he} en={UI.inventoryTitle.en} />
            </CardTitle>
            <CardDescription>{formatShekels(shekels)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <ItemLine
              label={UI.vehicle}
              he={vehicle?.nameHe ?? UI.onFoot.he}
              en={vehicle?.nameEn ?? UI.onFoot.en}
            />
            <ItemLine
              label={UI.property}
              he={property?.nameHe ?? UI.noHome.he}
              en={property?.nameEn ?? UI.noHome.en}
            />
            <ItemLine
              label={{ he: "טלפון", en: "Phone" }}
              he={phone?.nameHe ?? ""}
              en={phone?.nameEn ?? ""}
            />
            <ItemLine
              label={{ he: "אוכל", en: "Food" }}
              he={dining?.nameHe ?? ""}
              en={dining?.nameEn ?? ""}
            />
            <ItemLine
              label={UI.profile}
              he={gender === "female" ? "אישה" : "גבר"}
              en={gender === "female" ? "Woman" : "Man"}
            />
          </CardContent>
          <CardFooter className="justify-between">
            <Link
              href="/yad2"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <Sparkles data-icon="inline-start" />
              {UI.navYad2.he}
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm(UI.resetConfirm.he)) reset()
              }}
            >
              <RotateCcw data-icon="inline-start" />
              {UI.reset.he}
            </Button>
          </CardFooter>
        </Card>
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

function NextMissionCard({
  mission,
  gender,
  onStart,
}: {
  mission: Mission
  gender: "male" | "female"
  onStart: () => void
}) {
  const scene = sceneMeta(mission.scene)
  return (
    <button
      type="button"
      onClick={onStart}
      className={cn(
        "relative w-full overflow-hidden rounded-3xl bg-linear-to-br p-6 text-start text-white shadow-lg",
        scene.className
      )}
    >
      <p className="text-xs tracking-[0.28em] text-white/60 uppercase">
        {UI.nextMission.he} · {scene.labelHe}
      </p>
      <h2 className="mt-3 font-heading text-3xl md:text-4xl">{mission.title}</h2>
      <p className="mt-2 max-w-xl text-sm text-white/75">
        {g(mission.setupHebrew, gender)}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className={cn(buttonVariants({ variant: "secondary" }))}>
          {UI.startMission.he}
        </span>
        <span className="text-xs text-white/70">
          {phraseCount(mission)} {UI.phrase.he} · {formatShekels(mission.shekelReward)}
        </span>
      </div>
    </button>
  )
}

function MissionRow({
  mission,
  gender,
  done,
  onStart,
}: {
  mission: Mission
  gender: "male" | "female"
  done: boolean
  onStart: () => void
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-card/40 p-3"
      data-testid={`mission-${mission.id}`}
    >
      <div>
        <div className="font-medium">
          <Hinted he={mission.title} en={mission.englishTitle} />
        </div>
        <p className="text-xs text-muted-foreground">
          <Hinted he={g(mission.setupHebrew, gender)} en={g(mission.setupText, gender)} />
        </p>
      </div>
      <Button size="sm" variant={done ? "secondary" : "default"} onClick={onStart}>
        {done ? UI.practice.he : UI.startMission.he}
      </Button>
    </div>
  )
}

function ItemLine({
  label,
  he,
  en,
}: {
  label: { he: string; en: string }
  he: string
  en: string
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">
        <Hinted he={label.he} en={label.en} />
      </span>
      <span className="text-end font-medium">
        <Hinted he={he} en={en} />
      </span>
    </div>
  )
}
