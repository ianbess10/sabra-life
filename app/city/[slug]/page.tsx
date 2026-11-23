import { notFound } from "next/navigation"

import { CityHub } from "@/components/city-hub"
import { CITIES, getCity } from "@/lib/cities"

export function generateStaticParams() {
  return CITIES.map((city) => ({ slug: city.slug }))
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const city = getCity(slug)
  if (!city) notFound()
  return <CityHub city={city} />
}
