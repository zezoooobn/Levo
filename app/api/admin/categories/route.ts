import { NextResponse } from "next/server"

// Mock categories data - in a real app, this would come from a database
const categories = [
  {
    id: 1,
    name: "رجالي",
    slug: "men",
    description: "ملابس وإكسسوارات رجالية",
    productsCount: 120,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 2,
    name: "نسائي",
    slug: "women",
    description: "ملابس وإكسسوارات نسائية",
    productsCount: 150,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 3,
    name: "أطفال",
    slug: "kids",
    description: "ملابس وإكسسوارات للأطفال",
    productsCount: 80,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 4,
    name: "إكسسوارات",
    slug: "accessories",
    description: "إكسسوارات متنوعة",
    productsCount: 50,
    image: "/placeholder.svg?height=300&width=300",
  },
]

export async function GET() {
  return NextResponse.json({ categories })
}

export async function POST(request: Request) {
  try {
    const category = await request.json()

    // In a real app, validate and save to database
    // For now, just return success
    return NextResponse.json({ success: true, category: { ...category, id: categories.length + 1 } })
  } catch (error) {
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء إضافة الفئة" }, { status: 500 })
  }
}
