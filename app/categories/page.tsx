 "use client"
 
 import Link from "next/link"
 import { useEffect, useState } from "react"
 
 export default function CategoriesPage() {
   const [categories, setCategories] = useState([
    { id: "accessories", name: "إكسسوارات", count: 0 },
    { id: "kids", name: "أطفال", count: 0 },
    { id: "women", name: "نسائي", count: 0 },
    { id: "men", name: "رجالي", count: 0 },
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
          return
        }
      }
    } catch {}
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">تسوق حسب الفئة</h1>
          <p className="text-lg text-gray-600">اكتشف مجموعتنا المتنوعة من الملابس لجميع الفئات</p>
        </div>

        {/* Categories Grid - Simple gray cards matching the image */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {categories.map((category) => (
            <Link key={category.id} href={`/products?category=${encodeURIComponent(category.name)}`} className="block">
              <div className="bg-gray-400 rounded-lg p-8 h-48 flex flex-col justify-center items-center text-center hover:bg-gray-500 transition-colors duration-200 cursor-pointer">
                <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                <p className="text-white text-sm">{category.count} منتج</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="container px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">ليڤو</h4>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">تسوق</h4>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">المساعدة</h4>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">معلومات</h4>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
