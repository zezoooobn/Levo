import { NextRequest, NextResponse } from "next/server"

type OrderItem = { id: number; name: string; price: number; quantity: number; image: string; size: string; color: string }
type User = { firstName: string; lastName: string; email: string; phone: string; address: string }
type Order = { id: string; customer: User; items: OrderItem[]; total: number; status: string; date: string; notes?: string; appliedDiscountCode?: string; shippingCost?: number; governorate?: string }

const getStore = (): { orders: Order[] } => {
  const g = globalThis as any
  if (!g.__ordersStore) g.__ordersStore = { orders: [] }
  return g.__ordersStore as { orders: Order[] }
}

export async function GET() {
  const store = getStore()
  return NextResponse.json({ orders: store.orders })
}

export async function POST(req: NextRequest) {
  try {
    const order = (await req.json()) as Order
    if (!order || !order.id || !order.customer || !Array.isArray(order.items)) {
      return NextResponse.json({ error: "invalid_order" }, { status: 400 })
    }
    const store = getStore()
    const existsIndex = store.orders.findIndex((o) => o.id === order.id)
    if (existsIndex >= 0) {
      store.orders[existsIndex] = order
    } else {
      store.orders = [order, ...store.orders]
    }
    return NextResponse.json({ success: true, id: order.id })
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
