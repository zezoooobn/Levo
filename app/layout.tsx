import type React from "react"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import "./globals.css"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ThemeProvider } from "@/components/theme-provider"
import { AutoLogin } from "@/components/auto-login"
import { SampleData } from "@/components/sample-data"
import { DiscountCodeListener } from "@/components/discount-code-listener"

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
})

export const metadata: Metadata = {
  title: "Levo - متجر الملابس ليڤو",
  description: "Levo هو متجر ملابس أونلاين متخصص في توفير ملابس عصرية وشبابية بأسعار منافسة جدًا في السوق المصري. بنوصّل الأوردر لحد باب البيت في كل محافظات مصر، مع ضمان جودة الخامات، أحدث الموديلات، وتجربة شراء سهلة وآمنة 100%. لو بتدور على ستايل مميز وسعر مش هتلاقيه في حتة تانية، Levo هو اختيارك الصح.متجر ليڤو للملابس العصرية والأنيقة بأسعار مناسبة وجودة عالية",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AutoLogin />
          <DiscountCodeListener />
          <SampleData />
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
