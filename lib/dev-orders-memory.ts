export type DevOrderItem = { id: number; name: string; price: number; quantity: number }
export interface DevOrder {
  id: string
  customer: string
  date: string
  total: number
  status: string
  items: DevOrderItem[]
  address?: string
  phone?: string
  notes?: string
  paymentMethod?: string
  createdAt: string
  updatedAt: string
}

interface OrdersStore { orders: DevOrder[] }

const getStore = (): OrdersStore => {
  const g = globalThis as any
  if (!g.__ordersStore) g.__ordersStore = { orders: [] } as OrdersStore
  return g.__ordersStore as OrdersStore
}

export const addOrder = (order: Omit<DevOrder, "createdAt" | "updatedAt">): DevOrder => {
  const store = getStore()
  const now = new Date().toISOString()
  const saved: DevOrder = { ...order, createdAt: now, updatedAt: now }
  store.orders.unshift(saved)
  return saved
}

export const listOrders = (): DevOrder[] => {
  return [...getStore().orders]
}