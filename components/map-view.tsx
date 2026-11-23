"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, MapPin, Navigation } from "lucide-react"
import { toast } from "sonner"

import { Hinted } from "@/components/hinted"
import { useHintScreen } from "@/components/use-hint-screen"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CITIES, cityHintLines } from "@/lib/cities"
import { HUD_HINTS, UI, asHint } from "@/lib/copy"
import { formatShekels } from "@/lib/format"
import { cityUnlocked, levelFromXp, requiredLevelForCity } from "@/lib/levels"
import { useGameStore } from "@/lib/store"
import { canTravelTo, travelNote } from "@/lib/travel"
import type { CityInfo } from "@/lib/cities"

export function MapView() {
  const router = useRouter()
  const location = useGameStore((state) => state.location)
  const xp = useGameStore((state) => state.xp)
  const inventory = useGameStore((state) => state.inventory)
  const shekels = useGameStore((state) => state.shekels)
  const travelTo = useGameStore((state) => state.travelTo)
  const level = levelFromXp(xp)
  const note = useMemo(() => travelNote(inventory.vehicle), [inventory.vehicle])
  const [pending, setPending] = useState<CityInfo | null>(null)

  const hintLines = useMemo(
    () => [
      ...HUD_HINTS,
      asHint(UI.navMap),
      note,
      ...CITIES.flatMap((city) => cityHintLines(city)),
    ],
    [note]
  )
  useHintScreen("map", hintLines)

  function go(city: CityInfo) {
    const result = canTravelTo(city.slug, location, level.level, inventory, shekels)
    if (!result.ok) {
      toast.error(result.reasonHe)
      return
    }
    if (city.slug === location) {
      router.push(`/city/${city.slug}`)
      return
    }
    if (result.cost > 0) {
      setPending(city)
      return
    }
    const travel = travelTo(city.slug)
    if (!travel.ok) {
      toast.error(travel.messageHe)
      return
    }
    toast.success(travel.messageHe)
    router.push(`/city/${city.slug}`)
  }

  function confirmPending() {
    if (!pending) return
    const travel = travelTo(pending.slug)
    if (!travel.ok) {
      toast.error(travel.messageHe)
      setPending(null)
      return
    }
    toast.success(travel.messageHe)
    const slug = pending.slug
    setPending(null)
    router.push(`/city/${slug}`)
  }

  const pendingCost = pending
    ? canTravelTo(pending.slug, location, level.level, inventory, shekels)
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">
          <Hinted he={UI.navMap.he} en={UI.navMap.en} />
        </h1>
        <p className="mt-2 text-muted-foreground">
          <Hinted he={note.he} en={note.en} />
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {CITIES.map((city) => {
          const unlocked = cityUnlocked(city.slug, level.level)
          const here = city.slug === location
          const required = requiredLevelForCity(city.slug)
          return (
            <Card
              key={city.slug}
              className={`bg-linear-to-br ${city.accent} ${here ? "ring-2 ring-primary" : ""}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="font-heading text-2xl">
                    <Hinted he={city.nameHe} en={city.nameEn} />
                  </CardTitle>
                  {here ? (
                    <Badge>
                      <MapPin data-icon="inline-start" />
                      {UI.youAreHere.he}
                    </Badge>
                  ) : null}
                  {!unlocked ? (
                    <Badge variant="secondary">
                      <Lock data-icon="inline-start" />
                      {UI.locked.he}
                    </Badge>
                  ) : null}
                </div>
                <CardDescription>
                  <Hinted he={city.levelLabelHe} en={city.levelLabelEn} />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  <Hinted he={city.vibeHe} en={city.vibeEn} />
                </p>
                {!unlocked ? (
                  <p className="mt-3 text-xs text-amber-200">
                    נפתח ב{required.nameHe} · רמה {required.level}
                  </p>
                ) : null}
              </CardContent>
              <CardFooter>
                <Button className="w-full" disabled={!unlocked} onClick={() => go(city)}>
                  <Navigation data-icon="inline-start" />
                  {here ? UI.enterCity.he : UI.travel.he}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <Dialog open={Boolean(pending)} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{UI.confirmTravel.he}</DialogTitle>
            <DialogDescription>
              {pending ? (
                <Hinted
                  he={`${UI.fare.he} אל ${pending.nameHe}: ${formatShekels(pendingCost && pendingCost.ok ? pendingCost.cost : 0)}`}
                  en={`${UI.fare.en} to ${pending.nameEn}: ${formatShekels(pendingCost && pendingCost.ok ? pendingCost.cost : 0)}`}
                />
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)}>
              {UI.cancel.he}
            </Button>
            <Button onClick={confirmPending}>{UI.confirmTravel.he}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
