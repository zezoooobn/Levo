"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart, Minus, Plus, Share, ShoppingCart, Star, Check, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProductCard } from "@/components/product-card"
import { ProductReviews } from "@/components/product-reviews"
import { useStore, type CartItem } from "@/lib/store"
import { toast } from "@/components/ui/use-toast"
import { getCategoryButtonColor } from "@/lib/utils/category-colors"
import { useRouter, usePathname } from "next/navigation"

interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  category: string
  stock?: number
  status?: string
  description?: string
  images?: string[]
  sizes?: string[]
  colors?: string[]
  features?: string[]
  isNew?: boolean
  isSale?: boolean
  discount?: number
  rating?: number
  reviews?: number
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [activeTab, setActiveTab] = useState("description")
  const [currentImage, setCurrentImage] = useState(0)
  const [isAddingAnim, setIsAddingAnim] = useState(false)

  // استخدام متجر الحالة
  const { addToCart, addToWishlist, isInWishlist, removeFromWishlist } = useStore()

  useEffect(() => {
    // تحميل المنتج من localStorage
    if (typeof window !== "undefined") {
      const storedProducts = localStorage.getItem("admin-products")
      if (storedProducts) {
        try {
          const allProducts = JSON.parse(storedProducts)

          // البحث عن المنتج بواسطة المعرف
          const productId = Number(params.id)
          const foundProduct = allProducts.find((p: Product) => p.id === productId)

          if (foundProduct) {
            // تعيين المنتج الذي تم العثور عليه
            setProduct({
              ...foundProduct,
              rating: foundProduct.rating || 4.5,
              reviews: foundProduct.reviews || 120,
              discount: foundProduct.originalPrice
                ? Math.round(((foundProduct.originalPrice - foundProduct.price) / foundProduct.originalPrice) * 100)
                : 0,
              features: foundProduct.features || ["قطن 100%", "مريح وأنيق", "سهل العناية", "متوفر بعدة ألوان"],
            })

            // تعيين اللون والمقاس الافتراضي
            if (foundProduct.colors && foundProduct.colors.length > 0) {
              setSelectedColor(foundProduct.colors[0])
            }
            if (foundProduct.sizes && foundProduct.sizes.length > 0) {
              setSelectedSize(foundProduct.sizes[0])
            }

            // تحديد المنتجات ذات الصلة (من نفس الفئة)
            const related = allProducts
              .filter((p: Product) => p.id !== productId && p.category === foundProduct.category)
              .slice(0, 3) // أخذ أول 3 منتجات فقط

            setRelatedProducts(related)
          } else {
            // إذا لم يتم العثور على المنتج، استخدم البيانات الافتراضية
            setDefaultProductData(productId)
          }
        } catch (error) {
          console.error("Error parsing products from localStorage:", error)
          setDefaultProductData(Number(params.id))
        }
      } else {
        // إذا لم تكن هناك منتجات في localStorage، استخدم البيانات الافتراضية
        setDefaultProductData(Number(params.id))
      }
    }
  }, [params.id])

  // وظيفة لتعيين بيانات المنتج الافتراضية
  const setDefaultProductData = (productId: number) => {
    // بيانات المنتج الافتراضية
    const defaultProduct = {
      id: productId,
      name: "قميص كاجوال أنيق",
      price: 299,
      originalPrice: 399,
      discount: 25,
      rating: 4.5,
      reviews: 120,
      description: "قميص كاجوال أنيق مصنوع من القطن 100%، مناسب للمناسبات اليومية والرسمية. متوفر بعدة ألوان ومقاسات.",
      features: ["قطن 100%", "مريح وأنيق", "سهل العناية", "متوفر بعدة ألوان"],
      images: [
        "/placeholder.svg?height=600&width=500",
        "/placeholder.svg?height=600&width=500",
        "/placeholder.svg?height=600&width=500",
        "/placeholder.svg?height=600&width=500",
      ],
      colors: ["أسود", "أبيض", "أزرق"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      category: "رجالي",
      isNew: true,
      isSale: true,
    }

    setProduct(defaultProduct)
    setSelectedColor(defaultProduct.colors[0])
    setSelectedSize(defaultProduct.sizes[0])

    // منتجات ذات صلة افتراضية
    setRelatedProducts([
      {
        id: 2,
        name: "قميص رسمي",
        price: 399,
        originalPrice: 499,
        image: "/placeholder.svg?height=400&width=300",
        category: "رجالي",
        isNew: false,
        isSale: true,
      },
      {
        id: 3,
        name: "بنطلون جينز",
        price: 349,
        originalPrice: 449,
        image: "/placeholder.svg?height=400&width=300",
        category: "رجالي",
        isNew: true,
        isSale: false,
      },
      {
        id: 4,
        name: "تيشيرت قطني",
        price: 149,
        originalPrice: 199,
        image: "/placeholder.svg?height=400&width=300",
        category: "رجالي",
        isNew: false,
        isSale: true,
      },
    ])
  }

  // زيادة الكمية
  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  // تقليل الكمية
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const router = useRouter()
  const pathname = usePathname()

  // التحقق من وجود المنتج في المفضلة
  const inWishlist = product ? isInWishlist(product.id) : false

  // إضافة إلى/إزالة من المفضلة مع فرض تسجيل الدخول عند الإضافة
  const handleWishlist = () => {
    if (!product) return

    if (inWishlist) {
      removeFromWishlist(product.id)
      toast({
        title: "تمت الإزالة من المفضلة",
        description: `تمت إزالة ${product.name} من المفضلة`,
      })
    } else {
      if (!isLoggedIn) {
        setPendingWishlistItem({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice || product.price,
          image: product.images?.[0] || "/placeholder.svg",
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
        image: product.images?.[0] || "/placeholder.svg",
        category: product.category,
      })
      toast({
        title: "تمت الإضافة إلى المفضلة",
        description: `تمت إضافة ${product.name} إلى المفضلة`,
      })
    }
  }

  // إضافة إلى سلة التسوق
  const handleAddToCart = () => {
    if (!product) return

    if (!selectedSize || !selectedColor) {
      toast({
        title: "يرجى تحديد الخيارات",
        description: "يرجى اختيار المقاس واللون قبل الإضافة إلى السلة",
        variant: "destructive",
      })
      return
    }

    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      quantity: quantity,
      image: product.images?.[0] || "/placeholder.svg",
      size: selectedSize,
      color: selectedColor,
    }

    addToCart(cartItem)

    toast({
      title: "تمت الإضافة إلى السلة",
      description: `تمت إضافة ${product.name} إلى سلة التسوق`,
    })

    setIsAddingAnim(true)
    setTimeout(() => setIsAddingAnim(false), 1200)
  }

  // إذا لم يتم تحميل المنتج بعد
  if (!product) {
    return (
      <div className="container px-4 md:px-6 py-6 md:py-10 flex justify-center items-center min-h-[60vh]">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container px-4 md:px-6 py-6 md:py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* صور المنتج */}
        <div className="w-full lg:w-1/2">
          <div className="relative rounded-lg bg-black/5 dark:bg-white/5 overflow-hidden">
            <div className="aspect-[3/4] w-full max-h-[75vh] flex items-center justify-center">
              <img
                src={(product.images && product.images[currentImage]) || "/placeholder.svg"}
                alt={`${product.name} - صورة ${currentImage + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              aria-label="التالي"
              className="absolute top-1/2 -translate-y-1/2 right-2 z-10 p-2 rounded-full bg-background/70 backdrop-blur shadow hover:bg-background"
              onClick={() =>
                setCurrentImage((prev) =>
                  prev + 1 < (product.images?.length || 1) ? prev + 1 : 0
                )
              }
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              aria-label="السابق"
              className="absolute top-1/2 -translate-y-1/2 left-2 z-10 p-2 rounded-full bg-background/70 backdrop-blur shadow hover:bg-background"
              onClick={() =>
                setCurrentImage((prev) =>
                  prev - 1 >= 0 ? prev - 1 : Math.max((product.images?.length || 1) - 1, 0)
                )
              }
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="absolute bottom-2 left-2 flex items-center gap-2">
              {Array.from({ length: product.images?.length || 1 }).map((_, i) => (
                <button
                  key={i}
                  className={`h-2 w-2 rounded-full transition-all ${i === currentImage ? "bg-primary w-4" : "bg-muted"}`}
                  onClick={() => setCurrentImage(i)}
                  aria-label={`اذهب للصورة ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* تفاصيل المنتج */}
        <div className="w-full lg:w-1/2">
          <div className="flex flex-col space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/categories/${product.category.toLowerCase()}`}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {product.category}
                </Link>
                {product.isNew && <Badge className="bg-green-500 hover:bg-green-600">جديد</Badge>}
                {product.isSale && <Badge className="bg-primary hover:bg-primary/90">تخفيض {product.discount}%</Badge>}
              </div>
              <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(product.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({product.reviews} تقييم)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-bold">{product.price} ج.م</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-muted-foreground line-through text-lg">{product.originalPrice} ج.م</span>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">اللون</h3>
                <div className="flex gap-2">
                  {(product.colors || ["أسود", "أبيض", "أزرق"]).map((color, index) => (
                    <Button
                      key={index}
                      variant={selectedColor === color ? "default" : "outline"}
                      className={`rounded-full px-4 relative transition-all duration-300 ${
                        selectedColor === color
                          ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                          : "hover:bg-primary/10"
                      }`}
                      onClick={() => {
                        setSelectedColor(color)
                        const colorIndex = (product.colors || []).indexOf(color)
                        if (colorIndex >= 0) {
                          setCurrentImage(Math.min(colorIndex, (product.images?.length || 1) - 1))
                        }
                      }}
                    >
                      {color}
                      {selectedColor === color && (
                        <Check className="h-3 w-3 absolute -top-1 -right-1 bg-primary text-white rounded-full p-[1px] animate-in zoom-in-50 duration-300" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">المقاس</h3>
                <div className="flex flex-wrap gap-2">
                  {(product.sizes || ["S", "M", "L", "XL", "XXL"]).map((size, index) => (
                    <Button
                      key={index}
                      variant={selectedSize === size ? "default" : "outline"}
                      className={`px-4 relative transition-all duration-300 ${
                        selectedSize === size
                          ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                          : "hover:bg-primary/10"
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                      {selectedSize === size && (
                        <Check className="h-3 w-3 absolute -top-1 -right-1 bg-primary text-white rounded-full p-[1px] animate-in zoom-in-50 duration-300" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">الكمية</h3>
                <div className="flex items-center">
                  <Button variant="outline" size="icon" onClick={decreaseQuantity}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={increaseQuantity}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative flex flex-col sm:flex-row gap-4 mt-6">
              <Button
                size="lg"
                className={`flex-1 ${getCategoryButtonColor(product.category)} h-16 text-base sm:h-12 sm:text-sm`}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                إضافة إلى السلة
              </Button>
              <Button
                variant="outline"
                size="lg"
                className={`flex-1 ${inWishlist ? "text-red-500" : ""} h-16 text-base sm:h-12 sm:text-sm`}
                onClick={handleWishlist}
              >
                <Heart className={`mr-2 h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
                {inWishlist ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
              </Button>
              {isAddingAnim && (
                <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary text-primary-foreground shadow-lg animate-in fade-in zoom-in-50 duration-300">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="text-sm">تمت الإضافة</span>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="description">الوصف</TabsTrigger>
                <TabsTrigger value="features">المميزات</TabsTrigger>
                <TabsTrigger value="shipping">الشحن</TabsTrigger>
                <TabsTrigger value="reviews">التقييمات</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="pt-4">
                <p>{product.description}</p>
              </TabsContent>
              <TabsContent value="features" className="pt-4">
                <ul className="list-disc list-inside space-y-1">
                  {(product.features || []).map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="shipping" className="pt-4">
                <p>الشحن متاح لجميع المحافظات خلال 3-5 أيام عمل. شحن مجاني للطلبات أكثر من 500 جنيه.</p>
              </TabsContent>
              <TabsContent value="reviews" className="pt-4">
                <ProductReviews productId={product.id} />
              </TabsContent>
            </Tabs>

            <div className="flex items-center gap-4 mt-4">
              <Button variant="ghost" size="sm">
                <Share className="mr-2 h-4 w-4" />
                مشاركة
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* المنتجات ذات الصلة */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">منتجات ذات صلة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {relatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}
