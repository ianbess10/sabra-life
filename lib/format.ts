export function formatShekels(amount: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatXp(amount: number) {
  return `${amount.toLocaleString("he-IL")} נק״ז`
}
