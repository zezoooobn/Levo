"use client"

import { useState, useCallback, memo } from "react"
import Link from "next/link"
import { Heart, Star } from "lucide-react"
import { useStore } from "@/lib/store"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  isNew?: boolean
  sizes?: string[]
  colors?: string[]
  description?: string
  rating?: number
  reviews?: number
  deliveryDays?: number
}

interface ProductCardProps {
  product: Product
}

export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, isLoggedIn, setPendingWishlistItem } = useStore()
  const [isAdding, setIsAdding] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const isInWishlist = wishlist.some((item) => item.id === product.id)

  const handleAddToCart = useCallback(async () => {}, [])

  const handleAddToWishlist = useCallback(() => {
    if (isInWishlist) {
      removeFromWishlist(product.id)
      return
    }

    if (!isLoggedIn) {
      setPendingWishlistItem({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        image: product.image,
        category: product.category,
      })
      toast({ title: "سجّل الدخول", description: "سنعيدك لإكمال الإضافة للمفضلة" })
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname || "/")}`)
      return
    }

    addToWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      image: product.image,
      category: product.category,
    })
  }, [isInWishlist, removeFromWishlist, isLoggedIn, setPendingWishlistItem, router, pathname, addToWishlist, product])

  const handleAnimationComplete = useCallback(() => {}, [])

  const deliveryInfo = useCallback((days?: number) => {
    if (!days || days <= 0) return null
    const now = new Date()
    const target = new Date(now)
    target.setDate(now.getDate() + days)
    const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    const dayName = dayNames[target.getDay()]
    const dateStr = `${target.getDate()}/${target.getMonth() + 1}/${target.getFullYear()}`
    return { dayName, dateStr }
  }, [])

  return (
    <>
      <div
        className="group relative rounded-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02] border border-gray-200 dark:border-gray-700"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative">
          <Link href={`/products/${product.id}`}>
            <div className="overflow-hidden aspect-[3/4]">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isHovered ? "scale-110" : "scale-100"
                }`}
                loading="lazy"
              />
            </div>
          </Link>

          {/* الشارات */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {product.isNew && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                جديد
              </span>
            )}
          </div>

          {/* أيقونة القلب */}
          <button
            onClick={handleAddToWishlist}
            className={`absolute top-2 left-2 p-2 rounded-full transition-all duration-300 ${
              isInWishlist
                ? "bg-red-500 text-white scale-110"
                : "bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white hover:scale-110"
            }`}
            aria-label={isInWishlist ? "إزالة من المفضلة" : "إضافة للمفضلة"}
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? "fill-current" : ""}`} />
          </button>
        </div>

        <div className="p-4">
          <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">{product.category}</div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{product.name}</h3>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-gray-900 dark:text-white">{product.price} ج.م</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 dark:text-gray-300 line-through">{product.originalPrice} ج.م</span>
            )}
          </div>

          <div className="mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor((product.rating || 0)) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-500"}`}
                />
              ))}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {product.rating ? `${Number(product.rating).toFixed(1)} / 5` : "غير مقيم"}
            </div>
          </div>

          {product.description && (
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-7 break-all leading-relaxed">
              {product.description}
            </p>
          )}

          {product.deliveryDays && deliveryInfo(product.deliveryDays) && (
            <div className="mt-3 text-xs text-gray-600 dark:text-gray-300">
              سيتم التوصيل في {deliveryInfo(product.deliveryDays)!.dateStr} يوم {deliveryInfo(product.deliveryDays)!.dayName}
            </div>
          )}
        </div>
      </div>
    </>
  )
})
