"use client"

import { useState, useEffect } from "react"
import { Filter } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { db } from "@/lib/firebase/client"
import { collection, getDocs } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"

export default function ProductsPage() {
  const searchParams = useSearchParams()

  // تحميل فوري من التخزين المحلي إن وجد، بدون منتجات وهمية
  const [allProducts, setAllProducts] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("admin-products")
      if (stored) {
        try {
          const adminProducts = JSON.parse(stored)
          return adminProducts.map((product: any) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice || product.price,
            image: product.images?.[0] || "/placeholder.svg?height=400&width=300",
            category: product.category,
            isNew: product.isNew,
            isSale: product.isSale,
            sizes: product.sizes || [],
            colors: product.colors || [],
            description: product.description,
            stock: product.stock,
          }))
        } catch {}
      }
    }
    return []
  })

  // التحميل من Firestore مع سقوط آمن للتخزين المحلي (يحدّث البيانات بدون شاشة تحميل)
  useEffect(() => {
    ;(async () => {
      try {
        const snap = await getDocs(collection(db, "products"))
        if (!snap.empty) {
          const formatted = snap.docs.map((d) => {
            const p = d.data() as any
            return {
              id: Number(p.id ?? d.id),
              name: p.name,
              price: Number(p.price || 0),
              originalPrice: Number(p.originalPrice ?? p.price ?? 0),
              image: (p.images && p.images[0]) || "/placeholder.svg?height=400&width=300",
              category: p.category || "",
              isNew: Boolean(p.isNew),
              isSale: Boolean(p.isSale),
              sizes: p.sizes || [],
              colors: p.colors || [],
              description: p.description || "",
              stock: Number(p.stock || 0),
            }
          })
          setAllProducts(formatted)
          setFilteredProducts(formatted)
          return
        }
      } catch (e) {}
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("admin-products")
        if (stored) {
          try {
            const adminProducts = JSON.parse(stored)
            const formattedProducts = adminProducts.map((product: any) => ({
              id: product.id,
              name: product.name,
              price: product.price,
              originalPrice: product.originalPrice || product.price,
              image: product.images?.[0] || "/placeholder.svg?height=400&width=300",
              category: product.category,
              isNew: product.isNew,
              isSale: product.isSale,
              sizes: product.sizes || [],
              colors: product.colors || [],
              description: product.description,
              stock: product.stock,
            }))
            setAllProducts(formattedProducts)
            setFilteredProducts(formattedProducts)
          } catch {}
        }
      }
    })()
  }, [])

  // State for search and sort (these apply immediately)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState("featured")

  // State for temporary filters (what user selects but not applied yet)
  const [tempSelectedCategories, setTempSelectedCategories] = useState<string[]>([])
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([0, 2000])
  const [tempSelectedSizes, setTempSelectedSizes] = useState<string[]>([])
  const [tempSelectedColors, setTempSelectedColors] = useState<string[]>([])

  // State for applied filters (what actually filters the products)
  const [appliedCategories, setAppliedCategories] = useState<string[]>([])
  const [appliedPriceRange, setAppliedPriceRange] = useState<[number, number]>([0, 2000])
  const [appliedSizes, setAppliedSizes] = useState<string[]>([])
  const [appliedColors, setAppliedColors] = useState<string[]>([])

  const [filteredProducts, setFilteredProducts] = useState(allProducts)

  // إضافة حالة للصفحة الحالية
  const [currentPage, setCurrentPage] = useState(1)
  // عدد المنتجات في الصفحة الواحدة
  const productsPerPage = 12

  // تحقق من وجود فئة في URL عند تحميل الصفحة - مرة واحدة فقط
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  useEffect(() => {
    if (!initialLoadDone) {
      const categoryFromUrl = searchParams.get("category")
      if (categoryFromUrl) {
        setTempSelectedCategories([categoryFromUrl])
        setAppliedCategories([categoryFromUrl])
        // إعادة تعيين موضع التمرير إلى الأعلى عند الانتقال من صفحة أخرى
        window.scrollTo(0, 0)
      }
      setInitialLoadDone(true)
    }
  }, [searchParams, initialLoadDone])

  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Apply filters function
  const applyFilters = () => {
    setAppliedCategories(tempSelectedCategories)
    setAppliedPriceRange(tempPriceRange)
    setAppliedSizes(tempSelectedSizes)
    setAppliedColors(tempSelectedColors)
  }

  // Apply filters effect (only when applied filters change)
  useEffect(() => {
    let result = [...allProducts]

    // Filter by search term (applies immediately)
    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by applied categories
    if (appliedCategories.length > 0) {
      result = result.filter((product) => appliedCategories.includes(product.category))
    }

    // Filter by applied price range
    result = result.filter((product) => product.price >= appliedPriceRange[0] && product.price <= appliedPriceRange[1])

    // Filter by applied sizes
    if (appliedSizes.length > 0) {
      result = result.filter((product) => product.sizes?.some((size) => appliedSizes.includes(size)))
    }

    // Filter by applied colors
    if (appliedColors.length > 0) {
      result = result.filter((product) => product.colors?.some((color) => appliedColors.includes(color)))
    }

    // Apply sorting
    switch (sortOption) {
      case "newest":
        result = [...result].reverse()
        break
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price)
        break
      default:
        break
    }

    setFilteredProducts(result)
    setCurrentPage(1)
  }, [searchTerm, appliedCategories, appliedPriceRange, appliedSizes, appliedColors, sortOption, allProducts])

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("")
    setTempSelectedCategories([])
    setTempPriceRange([0, 2000])
    setTempSelectedSizes([])
    setTempSelectedColors([])
    setAppliedCategories([])
    setAppliedPriceRange([0, 2000])
    setAppliedSizes([])
    setAppliedColors([])
  }

  // حساب إجمالي عدد الصفحات
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  // الحصول على المنتجات للصفحة الحالية
  const currentProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)

  // وظائف التنقل بين الصفحات
  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }

  // إنشاء مصفوفة بأرقام الصفحات للعرض
  const getPageNumbers = () => {
    const pageNumbers = []

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPage <= 3) {
        pageNumbers.push(1, 2, 3, 4, 5)
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pageNumbers.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2)
      }
    }

    return pageNumbers
  }

  return (
    <div className="container px-4 md:px-6 py-6 md:py-10">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        {/* Sidebar filters on desktop only */}
        <div className="hidden md:block md:w-1/4 lg:w-1/5">
          <div className="sticky top-20 bg-background p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">الفلاتر</h2>
              <Button
                variant="ghost"
                size="sm"
                className="bg-transparent hover:bg-primary/10"
                onClick={clearAllFilters}
              >
                مسح الكل
              </Button>
            </div>
            <ProductFilters
              selectedCategories={tempSelectedCategories}
              setSelectedCategories={setTempSelectedCategories}
              priceRange={tempPriceRange}
              setPriceRange={setTempPriceRange}
              selectedSizes={tempSelectedSizes}
              setSelectedSizes={setTempSelectedSizes}
              selectedColors={tempSelectedColors}
              setSelectedColors={setTempSelectedColors}
            />
            <div className="mt-4">
              <Button onClick={applyFilters} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                تطبيق الفلاتر
              </Button>
            </div>
          </div>
        </div>
        <div className="w-full md:w-3/4 lg:w-4/5">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold">
              {filteredProducts.length === allProducts.length
                ? "جميع المنتجات"
                : `المنتجات (${filteredProducts.length})`}
            </h1>
            <div className="flex items-center gap-4 w-full sm:w-auto flex-1 sm:flex-initial">
              <div className="relative w-full sm:w-auto">
                <Input
                  placeholder="بحث..."
                  className="pl-10 w-full sm:w-[350px] md:w-[400px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* Mobile filter toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-0 top-0 bg-transparent hover:bg-primary/10 sm:hidden"
                  onClick={() => setIsFiltersOpen((v) => !v)}
                  aria-label="عرض الفلاتر"
                >
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">فلتر</span>
                </Button>
              </div>
              <div className="hidden sm:block">
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="featured">الأكثر شهرة</option>
                  <option value="newest">الأحدث</option>
                  <option value="price-asc">السعر: من الأقل للأعلى</option>
                  <option value="price-desc">السعر: من الأعلى للأقل</option>
                </select>
              </div>
            </div>
            {/* Mobile Filters */}
            {isFiltersOpen && (
              <div className="w-full sm:hidden mt-2">
                <div className="p-4 border rounded-lg">
                  <ProductFilters
                    selectedCategories={tempSelectedCategories}
                    setSelectedCategories={setTempSelectedCategories}
                    priceRange={tempPriceRange}
                    setPriceRange={setTempPriceRange}
                    selectedSizes={tempSelectedSizes}
                    setSelectedSizes={setTempSelectedSizes}
                    selectedColors={tempSelectedColors}
                    setSelectedColors={setTempSelectedColors}
                  />
                  <div className="mt-4 flex gap-2">
                    <Button onClick={applyFilters} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                      تطبيق الفلاتر
                    </Button>
                    <Button onClick={() => setIsFiltersOpen(false)} variant="outline" className="flex-1">
                      إخفاء
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-xl font-medium mb-2">لا توجد منتجات</h3>
              <p className="text-muted-foreground mb-4">لا توجد منتجات تطابق معايير البحث الخاصة بك</p>
              <Button onClick={clearAllFilters}>مسح الفلاتر</Button>
            </div>
          )}

          {filteredProducts.length > 0 && (
            <div className="flex justify-center mt-10">
              <Button
                variant="outline"
                className="mx-1 bg-transparent hover:bg-primary/10"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                السابق
              </Button>

              {getPageNumbers().map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant="outline"
                  className={`mx-1 ${
                    pageNumber === currentPage
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-transparent hover:bg-primary/10"
                  }`}
                  onClick={() => goToPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ))}

              <Button
                variant="outline"
                className="mx-1 bg-transparent hover:bg-primary/10"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                التالي
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
