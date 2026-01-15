import type React from "react"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import "../globals.css"

const cairo = Cairo({ subsets: ["arabic", "latin"] })

export const metadata: Metadata = {
  title: "لوحة تحكم المسؤول - ليڤو",
  description: "لوحة تحكم المسؤول لمتجر ليڤو للملابس",
}

import { AdminOrderListener } from "@/components/admin-order-listener"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`admin-layout ${cairo.className} min-h-screen flex flex-col`}>
      <AdminOrderListener />
      <div className="flex-grow">{children}</div>
    </div>
  )
}
