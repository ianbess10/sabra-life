"use client"

import { useMemo } from "react"
import { toast } from "sonner"
import { Check, ShoppingBag } from "lucide-react"

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
  CATALOG,
  DINING,
  PHONES,
  PROPERTIES,
  VEHICLES,
  canPurchase,
  isOwned,
} from "@/lib/catalog"
import { HUD_HINTS, UI, asHint } from "@/lib/copy"
import { formatShekels } from "@/lib/format"
import { useGameStore } from "@/lib/store"
import type { CatalogItem } from "@/lib/types"

const SECTIONS = [
  { title: UI.shopTransport, items: VEHICLES },
  { title: UI.shopHomes, items: PROPERTIES },
  { title: UI.shopStatus, items: [...PHONES, ...DINING] },
]

export function Yad2Shop() {
  const inventory = useGameStore((state) => state.inventory)
  const shekels = useGameStore((state) => state.shekels)
  const buyItem = useGameStore((state) => state.buyItem)

  const hintLines = useMemo(
    () => [
      ...HUD_HINTS,
      asHint(UI.navYad2),
      asHint(UI.shopTransport),
      asHint(UI.shopHomes),
      asHint(UI.shopStatus),
      ...CATALOG.map((item) => ({ he: item.nameHe, en: item.nameEn })),
      ...CATALOG.map((item) => ({ he: item.blurbHe, en: item.blurbEn })),
    ],
    []
  )
  useHintScreen("yad2", hintLines)

  function buy(item: CatalogItem) {
    const result = buyItem(item.id)
    if (result.ok) toast.success(result.messageHe)
    else toast.error(result.messageHe)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl">
          <Hinted he={UI.navYad2.he} en={UI.navYad2.en} />
        </h1>
        <p className="mt-2 text-muted-foreground">
          {formatShekels(shekels)} בחשבון. קנייה משדרגת את מה שמופיע למעלה.
        </p>
      </div>

      {SECTIONS.map((section) => (
        <section key={section.title.he} className="space-y-3">
          <h2 className="font-heading text-xl">
            <Hinted he={section.title.he} en={section.title.en} />
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {section.items.map((item) => {
              const owned = isOwned(inventory, item)
              const purchasable = canPurchase(inventory, item)
              const poor = shekels < item.price
              return (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle>
                        <Hinted he={item.nameHe} en={item.nameEn} />
                      </CardTitle>
                      {owned ? (
                        <Badge>
                          <Check data-icon="inline-start" />
                          {UI.owned.he}
                        </Badge>
                      ) : (
                        <Badge variant="outline">{formatShekels(item.price)}</Badge>
                      )}
                    </div>
                    <CardDescription>
                      <Hinted he={item.blurbHe} en={item.blurbEn} />
                    </CardDescription>
                  </CardHeader>
                  <CardContent />
                  <CardFooter>
                    <Button
                      className="w-full"
                      disabled={!purchasable || poor}
                      onClick={() => buy(item)}
                    >
                      <ShoppingBag data-icon="inline-start" />
                      {owned
                        ? UI.owned.he
                        : item.starter
                          ? UI.starter.he
                          : !purchasable
                            ? UI.lowerTier.he
                            : poor
                              ? UI.tooPoor.he
                              : `${UI.buy.he} · ${formatShekels(item.price)}`}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
