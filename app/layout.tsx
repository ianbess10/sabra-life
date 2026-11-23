import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Assistant, Rubik } from "next/font/google"

import { Providers } from "@/components/providers"

import "./globals.css"

const assistant = Assistant({
  subsets: ["latin", "hebrew"],
  variable: "--font-assistant",
  display: "swap",
})

const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  variable: "--font-display",
  display: "swap",
})

export const metadata: Metadata = {
  title: "סברה לייף · Sabra Life",
  description: "משחק למידת עברית לעולה חדש. משימות, שקלים, וחיים בארץ.",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${assistant.variable} ${rubik.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
