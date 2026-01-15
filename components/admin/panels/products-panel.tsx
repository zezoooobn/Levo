"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Upload, X, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { convertImageToBase64, convertUrlToBase64 } from "@/lib/image-utils"
import { db } from "@/lib/firebase/client"
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore"

// نوع المنتج
interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  category: string
  stock: number
  status: string
  description?: string
  images?: string[]
  sizes?: string[]
  colors?: string[]
  features?: string[]
  isNew?: boolean
  isSale?: boolean
  reviews?: number
  rating?: number
  deliveryDays?: number
}

export function ProductsPanel() {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)

  // إضافة متغيرات الترقيم
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 15

  // مراجع لعناصر إدخال الملفات
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null])
  const editFileInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null])

  // منتج جديد
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    price: 0,
    originalPrice: 0,
    category: "",
    stock: 0,
    description: "",
    sizes: [],
    colors: [],
    features: [],
    isNew: false,
    isSale: false,
    images: [],
    reviews: 0,
    rating: 4.5,
    deliveryDays: 5,
  })

  // حقول إدخال المقاسات والألوان
  const [sizeInput, setSizeInput] = useState("")
  const [colorInput, setColorInput] = useState("")
  const [editSizeInput, setEditSizeInput] = useState("")
  const [editColorInput, setEditColorInput] = useState("")

  // تحميل المنتجات عند البدء من Firestore أولاً ثم من localStorage
  useEffect(() => {
    ;(async () => {
      try {
        const snap = await getDocs(collection(db, "products"))
        if (!snap.empty) {
          const loaded = snap.docs.map((d) => {
            const data = d.data() as any
            return { id: Number(data.id ?? d.id), ...data }
          })
          setProducts(loaded)
          localStorage.setItem("admin-products", JSON.stringify(loaded))
          return
        }
      } catch {}
      const storedProducts = localStorage.getItem("admin-products")
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts))
        return
      }
      // منتجات افتراضية
      const initialProducts = [
        {
          id: 1,
          name: "قميص كاجوال",
          price: 299,
          originalPrice: 399,
          category: "رجالي",
          stock: 25,
          status: "متوفر",
          description: "قميص كاجوال أنيق مصنوع من القطن 100%",
          images: ["/placeholder.svg?height=400&width=300"],
          sizes: ["S", "M", "L", "XL"],
          colors: ["أسود", "أبيض", "أزرق"],
          features: ["قطن 100%", "مريح وأنيق", "سهل العناية", "متوفر بعدة ألوان"],
          isNew: true,
          isSale: true,
          reviews: 120,
        },
        {
          id: 2,
          name: "فستان أنيق",
          price: 499,
          originalPrice: 599,
          category: "نسائي",
          stock: 15,
          status: "متوفر",
          description: "فستان أنيق للمناسبات الخاصة",
          images: ["/placeholder.svg?height=400&width=300"],
          sizes: ["S", "M", "L"],
          colors: ["أحمر", "أسود"],
          features: ["قماش فاخر", "تصميم عصري", "مناسب للمناسبات الخاصة"],
          isNew: true,
          isSale: false,
          reviews: 85,
        },
        {
          id: 3,
          name: "بنطلون جينز",
          price: 349,
          originalPrice: 449,
          category: "رجالي",
          stock: 30,
          status: "متوفر",
          description: "بنطلون جينز عالي الجودة",
          images: ["/placeholder.svg?height=400&width=300"],
          sizes: ["30", "32", "34", "36"],
          colors: ["أزرق", "أسود"],
          features: ["جينز عالي الجودة", "مريح للارتداء اليومي", "متين ويدوم طويلاً"],
          isNew: false,
          isSale: true,
          reviews: 67,
        },
        {
          id: 4,
          name: "تيشيرت قطني",
          price: 149,
          originalPrice: 199,
          category: "أطفال",
          stock: 0,
          status: "غير متوفر",
          description: "تيشيرت قطني مريح للأطفال",
          images: ["/placeholder.svg?height=400&width=300"],
          sizes: ["S", "M", "L"],
          colors: ["أبيض", "أزرق", "أحمر"],
          features: ["قطن 100%", "مريح للأطفال", "سهل الغسيل"],
          isNew: false,
          isSale: true,
          reviews: 42,
        },
        // إضافة منتجات أكثر للاختبار
        {
          id: 5,
          name: "حذاء رياضي",
          price: 599,
          originalPrice: 699,
          category: "رجالي",
          stock: 20,
          status: "متوفر",
          description: "حذاء رياضي مريح للجري والتمارين الرياضية",
          images: ["/placeholder.svg?height=400&width=300"],
          sizes: ["40", "41", "42", "43", "44"],
          colors: ["أسود", "أبيض", "أزرق"],
          features: ["خفيف الوزن", "مريح للقدم", "مناسب للرياضة"],
          isNew: true,
          isSale: false,
          reviews: 56,
        },
        {
          id: 6,
          name: "حقيبة يد",
          price: 399,
          originalPrice: 499,
          category: "نسائي",
          stock: 15,
          status: "متوفر",
          description: "حقيبة يد أنيقة للمناسبات",
          images: ["/placeholder.svg?height=400&width=300"],
          sizes: ["وسط"],
          colors: ["أسود", "بني", "أحمر"],
          features: ["جلد طبيعي", "تصميم عصري", "سعة كبيرة"],
          isNew: false,
          isSale: true,
          reviews: 38,
        },
        {
          id: 7,
          name: "ساعة يد",
          price: 899,
          originalPrice: 1099,
          category: "إكسسوارات",
          stock: 10,
          status: "متوفر",
          description: "ساعة يد فاخرة بتصميم أنيق",
          images: ["/placeholder.svg?height=400&width=300"],
          sizes: ["واحد"],
          colors: ["فضي", "ذهبي"],
          features: ["مقاومة للماء", "عقارب مضيئة", "تصميم فاخر"],
          isNew: true,
          isSale: true,
          reviews: 72,
        },
        {
          id: 8,
          name: "بلوزة قطنية",
          price: 199,
          originalPrice: 249,
          category: "نسائي",
          stock: 25,
          status: "متوفر",
          description: "بلوزة قطنية مريحة للاستخدام اليومي",
          images: ["/placeholder.svg?height=400&width=300"],
          sizes: ["S", "M", "L", "XL"],
          colors: ["أبيض", "وردي", "أزرق فاتح"],
          features: ["قطن 100%", "مريحة للارتداء", "سهلة الغسيل"],
          isNew: false,
          isSale: false,
          reviews: 45,
        },
        {
          id: 9,
          name: "سترة شتوية",
          price: 799,
          originalPrice: 999,
          category: "رجالي",
          stock: 15,
          status: "متوفر",
          description: "سترة شتوية دافئة مناسبة للطقس البارد",
          images: ["/placeholder.svg?height=400&width=300"],
          sizes: ["M", "L", "XL", "XXL"],
          colors: ["أسود", "كحلي", "بني"],
          features: ["مقاومة للماء", "دافئة", "خفيفة الوزن"],
          isNew: true,
          isSale: false,
          reviews: 62,
        },
        {
          id: 10,
          name: "بنطلون رياضي",
          price: 249,
          originalPrice: 299,
          category: "رجالي",
          stock: 30,
          status: "متوفر",
          description: "بنطلون رياضي مريح للتمارين والجري",
          images: ["/placeholder.svg?height=400&width=300"],
          sizes: ["M", "L", "XL"],
          colors: ["أسود", "رمادي"],
          features: ["قماش مرن", "مريح للحركة", "سريع الجفاف"],
          isNew: false,
          isSale: true,
          reviews: 53,
        },
        {
          id: 11,
          name: "فستان سهرة",
          price: 1299,
          originalPrice: 1599,
          category: "نسائي",
          stock: 8,
          status: "متوفر",
          description: "فستان سهرة فاخر للمناسبات الخاصة",
          images: ["/placeholder.svg?height=400&width=300"],
          sizes: ["S", "M", "L"],
          colors: ["أسود", "أحمر", "ذهبي"],
          features: ["قماش فاخر", "تطريز يدوي", "تصميم أنيق"],
          isNew: true,
          isSale: false,
          reviews: 87,
        },
        {
          id: 12,
          name: "قميص رسمي",
          price: 349,
          originalPrice: 399,
          category: "رجالي",
          stock: 20,
          status: "متوفر",
          description: "قميص رسمي أنيق للمناسبات والعمل",
          images: ["/placeholder.svg?height=400&width=300"],
          sizes: ["39", "40", "41", "42", "43"],
          colors: ["أبيض", "أزرق فاتح", "وردي فاتح"],
          features: ["قطن مصري", "تصميم أنيق", "مناسب للمناسبات الرسمية"],
          isNew: false,
          isSale: false,
          reviews: 41,
        },
        {
          id: 13,
          name: "حذاء كعب عالي",
          price: 499,
          originalPrice: 599,
          category: "نسائي",
          stock: 12,
          status: "متوفر",
          description: "حذاء بكعب عالي أنيق للمناسبات",
          images: ["/placeholder.svg?height=400&width=300"],
          sizes: ["36", "37", "38", "39", "40"],
          colors: ["أسود", "أحمر", "بيج"],
          features: ["جلد طبيعي", "كعب مريح", "تصميم أنيق"],
          isNew: true,
          isSale: true,
          reviews: 68,
        },
        {
          id: 14,
          name: "بيجامة أطفال",
          price: 149,
          originalPrice: 199,
          category: "أطفال",
          stock: 25,
          status: "متوفر",
          description: "بيجامة قطنية مريحة للأطفال",
          images: ["/placeholder.svg?height=400&width=300"],
          sizes: ["2-3", "4-5", "6-7", "8-9"],
          colors: ["أزرق", "وردي", "أخضر"],
          features: ["قطن 100%", "مريحة للنوم", "تصاميم جذابة للأطفال"],
          isNew: false,
          isSale: true,
          reviews: 39,
        },
        {
          id: 15,
          name: "نظارة شمسية",
          price: 299,
          originalPrice: 399,
          category: "إكسسوارات",
          stock: 15,
          status: "متوفر",
          description: "نظارة شمسية بتصميم أنيق وحماية من الأشعة فوق البنفسجية",
          images: ["/placeholder.svg?height=400&width=300"],
          sizes: ["واحد"],
          colors: ["أسود", "بني", "ذهبي"],
          features: ["حماية UV400", "إطار متين", "تصميم عصري"],
          isNew: true,
          isSale: false,
          reviews: 54,
        },
        {
          id: 16,
          name: "قبعة صيفية",
          price: 99,
          originalPrice: 129,
          category: "إكسسوارات",
          stock: 30,
          status: "متوفر",
          description: "قبعة صيفية للحماية من أشعة الشمس",
          images: ["/placeholder.svg?height=400&width=300"],
          sizes: ["واحد"],
          colors: ["بيج", "أبيض", "أسود"],
          features: ["خفيفة الوزن", "حماية من الشمس", "قابلة للطي"],
          isNew: false,
          isSale: true,
          reviews: 27,
        },
        {
          id: 17,
          name: "سويت شيرت",
          price: 349,
          originalPrice: 399,
          category: "رجالي",
          stock: 20,
          status: "متوفر",
          description: "سويت شيرت مريح بقلنسوة",
          images: ["/placeholder.svg?height=400&width=300"],
          sizes: ["M", "L", "XL", "XXL"],
          colors: ["رمادي", "أسود", "كحلي"],
          features: ["قطن مخلوط", "مريح للارتداء", "مناسب للطقس البارد"],
          isNew: true,
          isSale: false,
          reviews: 48,
        },
        {
          id: 18,
          name: "جينز أطفال",
          price: 199,
          originalPrice: 249,
          category: "أطفال",
          stock: 25,
          status: "متوفر",
          description: "بنطلون جينز للأطفال بتصميم عصري",
          images: ["/placeholder.svg?height=400&width=300"],
          sizes: ["4-5", "6-7", "8-9", "10-11"],
          colors: ["أزرق", "أزرق غامق"],
          features: ["قماش مرن", "مريح للحركة", "متين"],
          isNew: false,
          isSale: true,
          reviews: 36,
        },
        {
          id: 19,
          name: "حقيبة ظهر",
          price: 299,
          originalPrice: 349,
          category: "إكسسوارات",
          stock: 18,
          status: "متوفر",
          description: "حقيبة ظهر عملية للاستخدام اليومي",
          images: ["/placeholder.svg?height=400&width=300"],
          sizes: ["واحد"],
          colors: ["أسود", "رمادي", "أزرق"],
          features: ["متعددة الجيوب", "مقاومة للماء", "مريحة للظهر"],
          isNew: true,
          isSale: false,
          reviews: 59,
        },
        {
          id: 20,
          name: "تنورة ميدي",
          price: 249,
          originalPrice: 299,
          category: "نسائي",
          stock: 15,
          status: "متوفر",
          description: "تنورة ميدي أنيقة بتصميم عصري",
          images: ["/placeholder.svg?height=400&width=300"],
          sizes: ["S", "M", "L"],
          colors: ["أسود", "بيج", "أزرق داكن"],
          features: ["قماش ناعم", "تصميم أنيق", "مناسبة للعمل والمناسبات"],
          isNew: false,
          isSale: true,
          reviews: 42,
        },
      ]
      setProducts(initialProducts)
      localStorage.setItem("admin-products", JSON.stringify(initialProducts))
    })()
  }, [])

  // تصفية المنتجات
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.includes(searchTerm) ||
      product.description?.includes(searchTerm) ||
      product.category.includes(searchTerm)

    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  // حساب إجمالي عدد الصفحات
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  // الحصول على المنتجات للصفحة الحالية
  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * productsPerPage
    const endIndex = startIndex + productsPerPage
    return filteredProducts.slice(startIndex, endIndex)
  }

  // الانتقال إلى الصفحة التالية
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // الانتقال إلى الصفحة السابقة
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // الانتقال إلى صفحة محددة
  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  // إنشاء أرقام الصفحات للعرض
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5 // عدد أزرار الصفحات التي ستظهر

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    let endPage = startPage + maxPagesToShow - 1

    if (endPage > totalPages) {
      endPage = totalPages
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    return pageNumbers
  }

  // معالجة التغييرات في نموذج المنتج الجديد
  const handleNewProductChange = (field: string, value: any) => {
    setNewProduct({
      ...newProduct,
      [field]: value,
    })
  }

  // إضافة مقاس جديد
  const handleAddSize = () => {
    if (!sizeInput.trim()) return

    const newSizes = [...(newProduct.sizes || []), sizeInput.trim()]
    setNewProduct({
      ...newProduct,
      sizes: newSizes,
    })
    setSizeInput("")
  }

  // إضافة لون جديد
  const handleAddColor = () => {
    if (!colorInput.trim()) return

    const newColors = [...(newProduct.colors || []), colorInput.trim()]
    setNewProduct({
      ...newProduct,
      colors: newColors,
    })
    setColorInput("")
  }

  // حذف مقاس
  const handleRemoveSize = (index: number) => {
    const newSizes = [...(newProduct.sizes || [])]
    newSizes.splice(index, 1)
    setNewProduct({
      ...newProduct,
      sizes: newSizes,
    })
  }

  // حذف لون
  const handleRemoveColor = (index: number) => {
    const newColors = [...(newProduct.colors || [])]
    newColors.splice(index, 1)
    setNewProduct({
      ...newProduct,
      colors: newColors,
    })
  }

  // إضافة مقاس للمنتج الحالي
  const handleAddEditSize = () => {
    if (!editSizeInput.trim() || !currentProduct) return

    const newSizes = [...(currentProduct.sizes || []), editSizeInput.trim()]
    setCurrentProduct({
      ...currentProduct,
      sizes: newSizes,
    })
    setEditSizeInput("")
  }

  // إضافة لون للمنتج الحالي
  const handleAddEditColor = () => {
    if (!editColorInput.trim() || !currentProduct) return

    const newColors = [...(currentProduct.colors || []), editColorInput.trim()]
    setCurrentProduct({
      ...currentProduct,
      colors: newColors,
    })
    setEditColorInput("")
  }

  // حذف مقاس من المنتج الحالي
  const handleRemoveEditSize = (index: number) => {
    if (!currentProduct) return

    const newSizes = [...(currentProduct.sizes || [])]
    newSizes.splice(index, 1)
    setCurrentProduct({
      ...currentProduct,
      sizes: newSizes,
    })
  }

  // حذف لون من المنتج الحالي
  const handleRemoveEditColor = (index: number) => {
    if (!currentProduct) return

    const newColors = [...(currentProduct.colors || [])]
    newColors.splice(index, 1)
    setCurrentProduct({
      ...currentProduct,
      colors: newColors,
    })
  }

  // معالجة ضغط مفتاح Enter في حقل المقاسات
  const handleSizeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddSize()
    }
  }

  // معالجة ضغط مفتاح Enter في حقل الألوان
  const handleColorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddColor()
    }
  }

  // معالجة ضغط مفتاح Enter في حقل المقاسات للتعديل
  const handleEditSizeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddEditSize()
    }
  }

  // معالجة ضغط مفتاح Enter في حقل الألوان للتعديل
  const handleEditColorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddEditColor()
    }
  }

  // إضافة منتج جديد
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.category || Number(newProduct.price) <= 0) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    try {
      // تحويل الصور إلى Base64 قبل الحفظ
      let processedImages = [...(newProduct.images || [])]

      // تحويل جميع الصور إلى Base64 إذا لم تكن كذلك بالفعل
      if (processedImages.length > 0) {
        processedImages = await Promise.all(
          processedImages.map(async (img) => {
            if (img && !img.includes("placeholder.svg")) {
              return await convertUrlToBase64(img)
            }
            return img
          }),
        )
      } else {
        processedImages = ["/placeholder.svg?height=400&width=300"]
      }

      const existingIds = products.map((p) => Number(p.id)).filter((n) => !isNaN(n))
      const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1
      const productToAdd: Product = {
        id: nextId,
        name: newProduct.name || "",
        price: newProduct.price || 0,
        originalPrice: newProduct.originalPrice || newProduct.price || 0,
        category: newProduct.category || "",
        stock: newProduct.stock || 0,
        status: newProduct.stock && newProduct.stock > 0 ? "متوفر" : "غير متوفر",
        description: newProduct.description || "",
        images: processedImages,
        sizes: newProduct.sizes || [],
        colors: newProduct.colors || [],
        features: newProduct.features || [],
        isNew: Boolean(newProduct.isNew),
        isSale: Boolean(newProduct.isSale),
        reviews: newProduct.reviews || 0,
        rating: newProduct.rating || 4.5,
        deliveryDays: newProduct.deliveryDays || 5,
      }

      const updatedProducts = [...products, productToAdd]
      setProducts(updatedProducts)
      localStorage.setItem("admin-products", JSON.stringify(updatedProducts))
      try {
        const firestoreProduct = {
          ...productToAdd,
          images: (productToAdd.images || []).map((img) =>
            typeof img === "string" && img.startsWith("data:") ? "/placeholder.svg?height=400&width=300" : img,
          ),
        }
        await setDoc(doc(db, "products", String(productToAdd.id)), firestoreProduct)
      } catch {}

      // إعادة تعيين النموذج
      setNewProduct({
        name: "",
        price: 0,
        originalPrice: 0,
        category: "",
        stock: 0,
        description: "",
        sizes: [],
        colors: [],
        features: [],
        isNew: false,
        isSale: false,
        images: [],
        reviews: 0,
        rating: 4.5,
        deliveryDays: 5,
      })

      setIsAddProductOpen(false)

      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إضافة المنتج بنجاح",
      })
    } catch (error) {
      console.error("خطأ في إضافة المنتج:", error)
      toast({
        title: "خطأ في إضافة المنتج",
        description: "حدث خطأ أثناء معالجة الصور. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    }
  }

  // تعديل منتج
  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product)
    setIsEditProductOpen(true)
  }

  // حفظ تغييرات المنتج
  const handleSaveProduct = async () => {
    if (!currentProduct) return

    try {
      // تحويل الصور إلى Base64 قبل الحفظ
      let processedImages = [...(currentProduct.images || [])]

      // تحويل جميع الصور إلى Base64 إذا لم تكن كذلك بالفعل
      if (processedImages.length > 0) {
        processedImages = await Promise.all(
          processedImages.map(async (img) => {
            if (img && !img.includes("placeholder.svg")) {
              return await convertUrlToBase64(img)
            }
            return img
          }),
        )
      }

      const updatedProduct = {
        ...currentProduct,
        images: processedImages,
      }

      const updatedProducts = products.map((p) => (p.id === currentProduct.id ? updatedProduct : p))

      setProducts(updatedProducts)
      localStorage.setItem("admin-products", JSON.stringify(updatedProducts))
      try {
        const firestoreProduct = {
          ...updatedProduct,
          images: (updatedProduct.images || []).map((img) =>
            typeof img === "string" && img.startsWith("data:") ? "/placeholder.svg?height=400&width=300" : img,
          ),
        }
        await setDoc(doc(db, "products", String(updatedProduct.id)), firestoreProduct, { merge: true })
      } catch {}
      setIsEditProductOpen(false)

      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث المنتج بنجاح",
      })
    } catch (error) {
      console.error("خطأ في تحديث المنتج:", error)
      toast({
        title: "خطأ في تحديث المنتج",
        description: "حدث خطأ أثناء معالجة الصور. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    }
  }

  // حذف منتج
  const handleDeleteProduct = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      const updatedProducts = products.filter((p) => p.id !== id)
      setProducts(updatedProducts)
      localStorage.setItem("admin-products", JSON.stringify(updatedProducts))
      try {
        await deleteDoc(doc(db, "products", String(id)))
      } catch {}

      // إعادة ضبط الصفحة الحالية إذا لزم الأمر
      const newTotalPages = Math.ceil(updatedProducts.length / productsPerPage)
      if (currentPage > newTotalPages) {
        setCurrentPage(Math.max(1, newTotalPages))
      }

      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف المنتج بنجاح",
      })
    }
  }

  // معالجة رفع الصور
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number, isEdit = false) => {
    const file = e.target.files?.[0]
    if (!file) return

    // التحقق من نوع الملف
    if (!file.type.startsWith("image/")) {
      toast({
        title: "خطأ في الملف",
        description: "يرجى اختيار ملف صورة فقط",
        variant: "destructive",
      })
      return
    }

    try {
      // تحويل الصورة إلى Base64
      const base64Image = await convertImageToBase64(file)

      if (isEdit && currentProduct) {
        // تحديث صور المنتج الحالي
        const updatedImages = [...(currentProduct.images || [])]
        updatedImages[index] = base64Image
        setCurrentProduct({ ...currentProduct, images: updatedImages })
      } else {
        // تحديث صور المنتج الجديد
        const updatedImages = [...(newProduct.images || [])]
        updatedImages[index] = base64Image
        setNewProduct({ ...newProduct, images: updatedImages })
      }

      toast({
        title: "تم رفع الصورة",
        description: "تم رفع الصورة بنجاح",
      })
    } catch (error) {
      console.error("خطأ في رفع الصورة:", error)
      toast({
        title: "خطأ في رفع الصورة",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء معالجة الصورة",
        variant: "destructive",
      })
    }
  }

  const handleAddImageUrl = (url: string, index: number, isEdit = false) => {
    // السماح بالقيم الفارغة للحذف
    if (isEdit && currentProduct) {
      const updatedImages = [...(currentProduct.images || [])]
      updatedImages[index] = url
      setCurrentProduct({ ...currentProduct, images: updatedImages })
    } else {
      const updatedImages = [...(newProduct.images || [])]
      updatedImages[index] = url
      setNewProduct({ ...newProduct, images: updatedImages })
    }
  }

  // فتح مربع حوار اختيار الملفات
  const triggerFileInput = (index: number, isEdit = false) => {
    const refs = isEdit ? editFileInputRefs : fileInputRefs
    if (refs.current[index]) {
      refs.current[index]?.click()
    }
  }

  return (
    <div className="space-y-6 text-gray-800">
      <Toaster />
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-bold text-white arabic-text"
            style={{ textShadow: "1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black" }}
          >
            إدارة المنتجات
          </h2>
          <p
            className="text-white arabic-text"
            style={{ textShadow: "1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black" }}
          >
            إضافة وتعديل وحذف منتجات المتجر
          </p>
        </div>
        <Button
          className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90"
          onClick={() => setIsAddProductOpen(true)}
        >
          <Plus className="h-4 w-4" />
          إضافة منتج جديد
        </Button>

        {/* نافذة إضافة منتج جديد بتصميم أفقي */}
        <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gray-800">إضافة منتج جديد</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3 sticky top-0 z-10 bg-background">
                <TabsTrigger value="basic">المعلومات الأساسية</TabsTrigger>
                <TabsTrigger value="details">التفاصيل</TabsTrigger>
                <TabsTrigger value="images">الصور والخيارات</TabsTrigger>
              </TabsList>

              {/* المعلومات الأساسية */}
              <TabsContent value="basic" className="py-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="product-name" className="text-gray-700">
                      اسم المنتج
                    </Label>
                    <Input
                      id="product-name"
                      placeholder="أدخل اسم المنتج"
                      value={newProduct.name}
                      onChange={(e) => handleNewProductChange("name", e.target.value)}
                      className="border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-category" className="text-gray-700">
                      الفئة
                    </Label>
                    <Select
                      value={newProduct.category}
                      onValueChange={(value) => handleNewProductChange("category", value)}
                    >
                      <SelectTrigger id="product-category" className="border-gray-300">
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="رجالي">رجالي</SelectItem>
                        <SelectItem value="نسائي">نسائي</SelectItem>
                        <SelectItem value="أطفال">أطفال</SelectItem>
                        <SelectItem value="إكسسوارات">إكسسوارات</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-price" className="text-gray-700">
                      السعر
                    </Label>
                    <Input
                      id="product-price"
                      type="number"
                      placeholder="أدخل سعر المنتج"
                      value={newProduct.price || ""}
                      onChange={(e) => handleNewProductChange("price", Number(e.target.value))}
                      className="border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-original-price" className="text-gray-700">
                      السعر الأصلي (قبل الخصم)
                    </Label>
                    <Input
                      id="product-original-price"
                      type="number"
                      placeholder="أدخل السعر الأصلي"
                      value={newProduct.originalPrice || ""}
                      onChange={(e) => handleNewProductChange("originalPrice", Number(e.target.value))}
                      className="border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-stock" className="text-gray-700">
                      الكمية المتوفرة
                    </Label>
                    <Input
                      id="product-stock"
                      type="number"
                      placeholder="أدخل الكمية المتوفرة"
                      value={newProduct.stock || ""}
                      onChange={(e) => handleNewProductChange("stock", Number(e.target.value))}
                      className="border-gray-300"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* التفاصيل */}
              <TabsContent value="details" className="py-4">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="product-description" className="text-gray-700">
                      وصف المنتج
                    </Label>
                    <Textarea
                      id="product-description"
                      placeholder="أدخل وصف المنتج"
                      rows={4}
                      value={newProduct.description || ""}
                      onChange={(e) => handleNewProductChange("description", e.target.value)}
                      className="border-gray-300 max-h-[150px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="product-sizes" className="text-gray-700">
                        المقاسات المتوفرة
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="product-sizes"
                          placeholder="أدخل المقاس ثم اضغط Enter"
                          value={sizeInput}
                          onChange={(e) => setSizeInput(e.target.value)}
                          onKeyDown={handleSizeKeyDown}
                          className="border-gray-300"
                        />
                        <Button type="button" variant="outline" size="sm" onClick={handleAddSize} className="shrink-0">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(newProduct.sizes || []).map((size, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                            {size}
                            <button
                              type="button"
                              onClick={() => handleRemoveSize(index)}
                              className="text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-colors" className="text-gray-700">
                        الألوان المتوفرة
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="product-colors"
                          placeholder="أدخل اللون ثم اضغط Enter"
                          value={colorInput}
                          onChange={(e) => setColorInput(e.target.value)}
                          onKeyDown={handleColorKeyDown}
                          className="border-gray-300"
                        />
                        <Button type="button" variant="outline" size="sm" onClick={handleAddColor} className="shrink-0">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(newProduct.colors || []).map((color, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                            {color}
                            <button
                              type="button"
                              onClick={() => handleRemoveColor(index)}
                              className="text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-features" className="text-gray-700">
                      مميزات المنتج
                    </Label>
                    <Textarea
                      id="product-features"
                      placeholder="أدخل مميزات المنتج (كل ميزة في سطر جديد)"
                      rows={4}
                      value={newProduct.features?.join("\n") || ""}
                      onChange={(e) => handleNewProductChange("features", e.target.value.split("\n"))}
                      className="border-gray-300 max-h-[150px]"
                    />
                    <p className="text-xs text-gray-500">أدخل كل ميزة في سطر منفصل</p>
                  </div>
                </div>
              </TabsContent>

              {/* الصور والخيارات */}
              <TabsContent value="images" className="py-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-700">صور المنتج</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                          <div
                            className="flex h-24 cursor-pointer items-center justify-center rounded-md border border-dashed border-gray-300 hover:border-primary relative overflow-hidden"
                            onClick={() => triggerFileInput(i)}
                          >
                            {newProduct.images && newProduct.images[i] ? (
                              <img
                                src={newProduct.images[i] || "/placeholder.svg"}
                                alt={`صورة المنتج ${i + 1}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-gray-400">
                                <Upload className="h-8 w-8 mb-1" />
                                <span className="text-xs">اضغط لإضافة صورة</span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              ref={(el) => {
                                fileInputRefs.current[i] = el
                              }}
                              onChange={(e) => handleImageUpload(e, i)}
                            />
                          </div>
                          <Input
                            placeholder={
                              newProduct.colors?.[i]
                                ? `رابط صورة اللون ${newProduct.colors[i]}`
                                : "رابط الصورة"
                            }
                            value={newProduct.images?.[i] || ""}
                            onChange={(e) => handleAddImageUrl(e.target.value, i)}
                            className="h-9 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="checkbox"
                        id="is-new"
                        checked={Boolean(newProduct.isNew)}
                        onChange={(e) => handleNewProductChange("isNew", e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="is-new" className="text-gray-700">
                        منتج جديد
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="checkbox"
                        id="is-sale"
                        checked={Boolean(newProduct.isSale)}
                        onChange={(e) => handleNewProductChange("isSale", e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="is-sale" className="text-gray-700">
                        عرض خاص
                      </Label>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 mt-4 sticky bottom-0 pt-2 bg-background z-10">
              <Button
                variant="outline"
                onClick={() => setIsAddProductOpen(false)}
                className="text-gray-700 border-gray-300"
              >
                إلغاء
              </Button>
              <Button onClick={handleAddProduct} className="bg-primary text-white hover:bg-primary/90">
                حفظ المنتج
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* نافذة تعديل المنتج */}
        <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gray-800">تعديل المنتج</DialogTitle>
            </DialogHeader>
            {currentProduct && (
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3 sticky top-0 z-10 bg-background">
                  <TabsTrigger value="basic">المعلومات الأساسية</TabsTrigger>
                  <TabsTrigger value="details">التفاصيل</TabsTrigger>
                  <TabsTrigger value="images">الصور والخيارات</TabsTrigger>
                </TabsList>

                {/* المعلومات الأساسية */}
                <TabsContent value="basic" className="py-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="edit-product-name" className="text-gray-700">
                        اسم المنتج
                      </Label>
                      <Input
                        id="edit-product-name"
                        value={currentProduct.name}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                        className="border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-product-category" className="text-gray-700">
                        الفئة
                      </Label>
                      <Select
                        value={currentProduct.category}
                        onValueChange={(value) => setCurrentProduct({ ...currentProduct, category: value })}
                      >
                        <SelectTrigger id="edit-product-category" className="border-gray-300">
                          <SelectValue placeholder="اختر الفئة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="رجالي">رجالي</SelectItem>
                          <SelectItem value="نسائي">نسائي</SelectItem>
                          <SelectItem value="أطفال">أطفال</SelectItem>
                          <SelectItem value="إكسسوارات">إكسسوارات</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-product-price" className="text-gray-700">
                        السعر
                      </Label>
                      <Input
                        id="edit-product-price"
                        type="number"
                        value={currentProduct.price}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
                        className="border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-product-original-price" className="text-gray-700">
                        السعر الأصلي (قبل الخصم)
                      </Label>
                      <Input
                        id="edit-product-original-price"
                        type="number"
                        value={currentProduct.originalPrice || currentProduct.price}
                        onChange={(e) =>
                          setCurrentProduct({ ...currentProduct, originalPrice: Number(e.target.value) })
                        }
                        className="border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-product-stock" className="text-gray-700">
                        الكمية المتوفرة
                      </Label>
                      <Input
                        id="edit-product-stock"
                        type="number"
                        value={currentProduct.stock}
                        onChange={(e) =>
                          setCurrentProduct({
                            ...currentProduct,
                            stock: Number(e.target.value),
                            status: Number(e.target.value) > 0 ? "متوفر" : "غير متوفر",
                          })
                        }
                        className="border-gray-300"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* التفاصيل */}
                <TabsContent value="details" className="py-4">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="edit-product-description" className="text-gray-700">
                        وصف المنتج
                      </Label>
                      <Textarea
                        id="edit-product-description"
                        rows={4}
                        value={currentProduct.description || ""}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                        className="border-gray-300 max-h-[150px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="edit-product-sizes" className="text-gray-700">
                          المقاسات المتوفرة
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="edit-product-sizes"
                            placeholder="أدخل المقاس ثم اضغط Enter"
                            value={editSizeInput}
                            onChange={(e) => setEditSizeInput(e.target.value)}
                            onKeyDown={handleEditSizeKeyDown}
                            className="border-gray-300"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddEditSize}
                            className="shrink-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(currentProduct.sizes || []).map((size, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                              {size}
                              <button
                                type="button"
                                onClick={() => handleRemoveEditSize(index)}
                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-product-colors" className="text-gray-700">
                          الألوان المتوفرة
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="edit-product-colors"
                            placeholder="أدخل اللون ثم اضغط Enter"
                            value={editColorInput}
                            onChange={(e) => setEditColorInput(e.target.value)}
                            onKeyDown={handleEditColorKeyDown}
                            className="border-gray-300"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddEditColor}
                            className="shrink-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(currentProduct.colors || []).map((color, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                              {color}
                              <button
                                type="button"
                                onClick={() => handleRemoveEditColor(index)}
                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-product-features" className="text-gray-700">
                        مميزات المنتج
                      </Label>
                      <Textarea
                        id="edit-product-features"
                        placeholder="أدخل مميزات المنتج (كل ميزة في سطر جديد)"
                        rows={4}
                        value={currentProduct.features?.join("\n") || ""}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, features: e.target.value.split("\n") })}
                        className="border-gray-300 max-h-[150px]"
                      />
                      <p className="text-xs text-gray-500">أدخل كل ميزة في سطر منفصل</p>
                    </div>
                  </div>
                </TabsContent>

                {/* الصور والخيارات */}
                <TabsContent value="images" className="py-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-700">صور المنتج</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[0, 1, 2, 3].map((i) => (
                          <div key={i} className="space-y-2">
                            <div
                              className="flex h-24 cursor-pointer items-center justify-center rounded-md border border-dashed border-gray-300 hover:border-primary relative overflow-hidden"
                              onClick={() => triggerFileInput(i, true)}
                            >
                              {currentProduct.images && currentProduct.images[i] ? (
                                <img
                                  src={currentProduct.images[i] || "/placeholder.svg"}
                                  alt={`صورة المنتج ${i + 1}`}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                  <Upload className="h-8 w-8 mb-1" />
                                  <span className="text-xs">اضغط لإضافة صورة</span>
                                </div>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={(el) => {
                                  editFileInputRefs.current[i] = el
                                }}
                                onChange={(e) => handleImageUpload(e, i, true)}
                              />
                            </div>
                            <Input
                              placeholder={
                                currentProduct.colors?.[i]
                                  ? `رابط صورة اللون ${currentProduct.colors[i]}`
                                  : "رابط الصورة"
                              }
                              value={currentProduct.images?.[i] || ""}
                              onChange={(e) => handleAddImageUrl(e.target.value, i, true)}
                              className="h-9 text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="checkbox"
                          id="edit-is-new"
                          checked={Boolean(currentProduct.isNew)}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, isNew: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="edit-is-new" className="text-gray-700">
                          منتج جديد
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="checkbox"
                          id="edit-is-sale"
                          checked={Boolean(currentProduct.isSale)}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, isSale: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="edit-is-sale" className="text-gray-700">
                          عرض خاص
                        </Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
            <div className="flex justify-end gap-2 mt-4 sticky bottom-0 pt-2 bg-background z-10">
              <Button
                variant="outline"
                onClick={() => setIsEditProductOpen(false)}
                className="text-gray-700 border-gray-300"
              >
                إلغاء
              </Button>
              <Button onClick={handleSaveProduct} className="bg-primary text-white hover:bg-primary/90">
                حفظ التغييرات
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="البحث عن منتج..."
            className="pl-9 border-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select defaultValue="all" value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px] border-gray-300">
            <SelectValue placeholder="تصفية حسب الفئة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الفئات</SelectItem>
            <SelectItem value="رجالي">رجالي</SelectItem>
            <SelectItem value="نسائي">نسائي</SelectItem>
            <SelectItem value="أطفال">أطفال</SelectItem>
            <SelectItem value="إكسسوارات">إكسسوارات</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="w-[50px] text-white arabic-text"
                style={{ textShadow: "1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black" }}
              >
                الرقم
              </TableHead>
              <TableHead
                className="text-white arabic-text"
                style={{ textShadow: "1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black" }}
              >
                اسم المنتج
              </TableHead>
              <TableHead
                className="text-white arabic-text"
                style={{ textShadow: "1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black" }}
              >
                الفئة
              </TableHead>
              <TableHead
                className="text-white arabic-text"
                style={{ textShadow: "1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black" }}
              >
                السعر
              </TableHead>
              <TableHead
                className="text-white arabic-text"
                style={{ textShadow: "1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black" }}
              >
                المخزون
              </TableHead>
              <TableHead
                className="text-white arabic-text"
                style={{ textShadow: "1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black" }}
              >
                الحالة
              </TableHead>
              <TableHead
                className="text-left text-white arabic-text"
                style={{ textShadow: "1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black" }}
              >
                الإجراءات
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getCurrentPageProducts().map((product) => (
              <TableRow key={product.id}>
                <TableCell
                  className="text-white"
                  style={{
                    textShadow: "1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black",
                  }}
                >
                  {product.id}
                </TableCell>
                <TableCell
                  className="font-medium text-white"
                  style={{
                    textShadow: "1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black",
                  }}
                >
                  {product.name}
                </TableCell>
                <TableCell
                  className="text-white"
                  style={{
                    textShadow: "1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black",
                  }}
                >
                  {product.category}
                </TableCell>
                <TableCell
                  className="text-white"
                  style={{
                    textShadow: "1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black",
                  }}
                >
                  {product.price} ج.م
                </TableCell>
                <TableCell
                  className="text-white"
                  style={{
                    textShadow: "1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black",
                  }}
                >
                  {product.stock}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      product.status === "متوفر" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                      className="bg-blue-50 border-blue-200 hover:bg-blue-100"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                      <span className="mr-2 text-blue-600">تعديل</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="bg-red-50 border-red-200 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                      <span className="mr-2 text-red-600">حذف</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div
          className="text-sm text-white"
          style={{ textShadow: "1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black" }}
        >
          عرض {getCurrentPageProducts().length} من {filteredProducts.length} منتج
        </div>
        <div className="flex items-center gap-2 rtl">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={
              currentPage === 1
                ? "text-gray-400 border-gray-300"
                : "text-white border-gray-300 bg-gray-700 hover:bg-gray-600"
            }
          >
            <ChevronRight className="h-4 w-4 ml-1" />
            السابق
          </Button>

          {getPageNumbers().map((pageNumber) => (
            <Button
              key={pageNumber}
              variant="outline"
              size="sm"
              onClick={() => goToPage(pageNumber)}
              className={
                pageNumber === currentPage
                  ? "bg-primary text-primary-foreground"
                  : "text-white border-gray-300 bg-gray-700 hover:bg-gray-600"
              }
            >
              {pageNumber}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={
              currentPage === totalPages
                ? "text-gray-400 border-gray-300"
                : "text-white border-gray-300 bg-gray-700 hover:bg-gray-600"
            }
          >
            التالي
            <ChevronLeft className="h-4 w-4 mr-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
