import { NextResponse } from "next/server"

// Mock products data - in a real app, this would come from a database
const products = [
  {
    id: 1,
    name: "قميص كاجوال",
    price: 299,
    originalPrice: 399,
    category: "رجالي",
    stock: 25,
    status: "متوفر",
    description: "قميص كاجوال أنيق مصنوع من القطن 100%، مناسب للمناسبات اليومية والرسمية.",
    images: ["/placeholder.svg?height=400&width=300"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["أسود", "أبيض", "أزرق"],
    isNew: true,
    isSale: true,
  },
  {
    id: 2,
    name: "فستان أنيق",
    price: 499,
    originalPrice: 599,
    category: "نسائي",
    stock: 15,
    status: "متوفر",
    description: "فستان أنيق مناسب للمناسبات الخاصة، تصميم عصري وخامة ممتازة.",
    images: ["/placeholder.svg?height=400&width=300"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["أسود", "أحمر", "أزرق"],
    isNew: true,
    isSale: false,
  },
  {
    id: 3,
    name: "بنطلون جينز",
    price: 349,
    originalPrice: 449,
    category: "رجالي",
    stock: 30,
    status: "متوفر",
    description: "بنطلون جينز عالي الجودة، مريح وعملي للاستخدام اليومي.",
    images: ["/placeholder.svg?height=400&width=300"],
    sizes: ["30", "32", "34", "36", "38"],
    colors: ["أزرق غامق", "أزرق فاتح", "أسود"],
    isNew: false,
    isSale: true,
  },
]

export async function GET() {
  return NextResponse.json({ products })
}

export async function POST(request: Request) {
  try {
    const product = await request.json()

    // In a real app, validate and save to database
    // For now, just return success
    return NextResponse.json({ success: true, product: { ...product, id: products.length + 1 } })
  } catch (error) {
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء إضافة المنتج" }, { status: 500 })
  }
}
