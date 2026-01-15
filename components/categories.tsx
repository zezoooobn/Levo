 "use client"
 
 import Link from "next/link"
 
 import { Card } from "@/components/ui/card"
 import { useEffect, useState } from "react"
 
export function Categories() {
  const [categories, setCategories] = useState([
    { id: "men", name: "رجالي", image: "/placeholder.svg?height=300&width=300", count: 0 },
    { id: "women", name: "نسائي", image: "/placeholder.svg?height=300&width=300", count: 0 },
    { id: "kids", name: "أطفال", image: "/placeholder.svg?height=300&width=300", count: 0 },
    { id: "accessories", name: "إكسسوارات", image: "/placeholder.svg?height=300&width=300", count: 0 },
  ])

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const storedProducts = localStorage.getItem("admin-products")
        if (storedProducts) {
          const allProducts = JSON.parse(storedProducts)
          const updated = categories.map((cat) => ({
            ...cat,
            count: allProducts.filter((p: any) => p.category === cat.name).length,
          }))
          setCategories(updated)
        }
      }
    } catch {}
  }, [])

  return (
    <section className="w-full py-12 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">تسوق حسب الفئة</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              اكتشف مجموعتنا المتنوعة من الملابس لجميع الفئات
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {categories.map((category) => (
            <Link key={category.id} href={`/products?category=${encodeURIComponent(category.name)}`}>
              <Card className="overflow-hidden h-full group">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center text-white p-4">
                      <h3 className="font-bold text-2xl">{category.name}</h3>
                      <p className="mt-1">{category.count} منتج</p>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
