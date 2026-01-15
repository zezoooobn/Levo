"use client"
import Link from "next/link"
import { ShoppingCart, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { getCategoryButtonColor } from "@/lib/utils/category-colors"

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart } = useStore()

  const handleAddToCart = (itemId: string) => {
    addToCart(itemId)
  }

  return (
    <div className="container px-4 md:px-6 py-6 md:py-10">
      <h1 className="text-3xl font-bold mb-6">المفضلة</h1>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative">
                <Link href={`/products/${item.id}`}>
                  <div className="overflow-hidden aspect-[3/4]">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="object-cover w-full h-full transition-transform hover:scale-105"
                    />
                  </div>
                </Link>
              </div>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{item.category}</div>
                <h3 className="font-semibold text-lg mt-1">{item.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold">{item.price} ج.م</span>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <span className="text-muted-foreground line-through text-sm">{item.originalPrice} ج.م</span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button
                  className={`flex-1 ${getCategoryButtonColor(item.category)}`}
                  onClick={() => handleAddToCart(item.id)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  إضافة إلى السلة
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive bg-transparent"
                  onClick={() => removeFromWishlist(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">المفضلة فارغة</h2>
          <p className="text-muted-foreground mb-6">لم تقم بإضافة أي منتجات إلى المفضلة بعد.</p>
          <Button asChild size="lg">
            <Link href="/products">تسوق الآن</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
