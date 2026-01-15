"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h2 className="mb-4 text-2xl font-bold">حدث خطأ ما</h2>
      <p className="mb-6 max-w-md text-muted-foreground">
        نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()}>إعادة المحاولة</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          العودة للرئيسية
        </Button>
      </div>
    </div>
  )
}
