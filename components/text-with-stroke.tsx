import { cn } from "@/lib/utils"
import type React from "react"

interface TextWithStrokeProps {
  children: React.ReactNode
  className?: string
  strokeWidth?: number
}

export function TextWithStroke({ children, className, strokeWidth = 1 }: TextWithStrokeProps) {
  const strokeStyle = {
    WebkitTextStroke: `${strokeWidth}px black`,
    textShadow: `
      -${strokeWidth}px -${strokeWidth}px 0 #000,
      ${strokeWidth}px -${strokeWidth}px 0 #000,
      -${strokeWidth}px ${strokeWidth}px 0 #000,
      ${strokeWidth}px ${strokeWidth}px 0 #000
    `,
  }

  return (
    <span className={cn("text-white", className)} style={strokeStyle}>
      {children}
    </span>
  )
}
