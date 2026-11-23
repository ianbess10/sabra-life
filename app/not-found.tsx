import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <h1 className="font-heading text-3xl">העמוד לא נמצא</h1>
      <p className="text-muted-foreground">אולי פנית שמאלה במקום ימין אחרי הקשת.</p>
      <Link href="/" className={buttonVariants()}>
        חזרה הביתה
      </Link>
    </div>
  )
}
