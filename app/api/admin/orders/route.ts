import { NextResponse } from "next/server"

// Mock orders data - in a real app, this would come from a database
const orders = [
  {
    id: "ORD-123456",
    customer: "أحمد محمد",
    date: "2023-12-15",
    total: 648,
    status: "تم التسليم",
    items: [
      { id: 1, name: "قميص كاجوال", price: 299, quantity: 1 },
      { id: 3, name: "بنطلون جينز", price: 349, quantity: 1 },
    ],
    address: "123 شارع النيل، القاهرة، مصر",
    phone: "01234567890",
  },
  {
    id: "ORD-123457",
    customer: "سارة أحمد",
    date: "2023-11-20",
    total: 499,
    status: "قيد الشحن",
    items: [{ id: 2, name: "فستان أنيق", price: 499, quantity: 1 }],
    address: "456 شارع الهرم، الجيزة، مصر",
    phone: "01098765432",
  },
  {
    id: "ORD-123458",
    customer: "محمد علي",
    date: "2023-10-05",
    total: 997,
    status: "تم التسليم",
    items: [
      { id: 1, name: "قميص كاجوال", price: 299, quantity: 1 },
      { id: 2, name: "فستان أنيق", price: 499, quantity: 1 },
      { id: 4, name: "تيشيرت قطني", price: 199, quantity: 1 },
    ],
    address: "789 شارع المعز، القاهرة، مصر",
    phone: "01112345678",
  },
]

export async function GET() {
  return NextResponse.json({ orders })
}

export async function PUT(request: Request) {
  try {
    const { orderId, status } = await request.json()

    // In a real app, update order in database
    // For now, just return success
    return NextResponse.json({ success: true, orderId, status })
  } catch (error) {
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء تحديث الطلب" }, { status: 500 })
  }
}
