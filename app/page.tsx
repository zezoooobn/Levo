import Link from "next/link"
import { ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FeaturedProducts } from "@/components/featured-products"
import { Categories } from "@/components/categories"
import { NewArrivals } from "@/components/new-arrivals"
import { Newsletter } from "@/components/newsletter"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  اكتشف أحدث صيحات الموضة
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  تسوق أحدث الملابس والإكسسوارات من مجموعتنا الجديدة. جودة عالية وأسعار مناسبة.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="px-8">
                  <Link href="/products">
                    تسوق الآن
                    <ShoppingBag className="mr-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="px-8">
                  <Link href="/categories">استكشف الفئات</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-[500px] aspect-square overflow-hidden rounded-xl bg-muted flex items-center justify-center">
                <img
                  alt="Levo hero"
                  className="object-contain h-full w-full p-6 block dark:hidden"
                  src="https://retail-orange-pgdgj5caab.edgeone.app/ChatGPT%20Image%20Jan%2013,%202026,%2008_02_32%20PM.png"
                />
                <img
                  alt="Levo hero"
                  className="object-contain h-full w-full p-6 hidden dark:block"
                  src="https://zeroth-emerald-cva4yerssm.edgeone.app/ChatGPT%20Image%20Jan%2013,%202026,%2008_02_28%20PM.png"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <Categories />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* New Arrivals */}
      <NewArrivals />

      {/* Newsletter */}
      <Newsletter />
    </div>
  )
}
