"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Users, DollarSign, TrendingUp } from "lucide-react"
import { useStore } from "@/lib/store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// واجهة للإحصائيات
interface Stats {
  totalSales: number
  newOrders: number
  newCustomers: number
  conversionRate: number
}

// واجهة للمبيعات الأخيرة
interface RecentSale {
  id: string
  orderNumber: string
  time: string
  amount: number
  customer: {
    name: string
    email: string
    image?: string
    initials: string
    color: string
  }
}

// واجهة للمنتجات الأكثر مبيعًا
interface TopProduct {
  id: number
  name: string
  sales: number
  percentage: number
  image: string
}

const COLORS = [
  "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500", "bg-lime-500",
  "bg-green-500", "bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-sky-500",
  "bg-blue-500", "bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-fuchsia-500",
  "bg-pink-500", "bg-rose-500"
]

const getColorForChar = (char: string) => {
  const index = char.charCodeAt(0) % COLORS.length
  return COLORS[index]
}

export function StatsPanel() {
  // حالة الإحصائيات
  const [stats, setStats] = useState<Stats>({
    totalSales: 0,
    newOrders: 0,
    newCustomers: 0,
    conversionRate: 0,
  })

  // حالة المبيعات الأخيرة
  const [recentSales, setRecentSales] = useState<RecentSale[]>([])

  // حالة المنتجات الأكثر مبيعًا
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])

  // الحصول على الطلبات والمستخدمين من المتجر
  const orders = useStore((state) => state.getOrders())
  const registeredUsers = useStore((state) => state.registeredUsers)

  // دالة لحساب الوقت المنقضي
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    // تصحيح فرق التوقيت إذا لزم الأمر، هنا نفترض أن التواريخ مخزنة بـ UTC أو ISO ونقارنها بالوقت المحلي
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return "الآن"
    
    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + " سنة"
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + " شهر"
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + " يوم"
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + " ساعة"
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + " دقيقة"
    return Math.floor(seconds) + " ثانية"
  }

  // تحديث الإحصائيات عند تغير الطلبات أو المستخدمين
  useEffect(() => {
    // حساب إجمالي المبيعات
    const totalSales = orders.reduce((total, order) => total + order.total, 0)

    // حساب عدد الطلبات الجديدة (آخر 30 يوم)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const newOrders = orders.filter((order) => new Date(order.date) > thirtyDaysAgo).length

    // حساب عدد العملاء الجدد (آخر 30 يوم)
    // في تطبيق حقيقي، يجب أن يكون لدينا تاريخ تسجيل للمستخدم
    const newCustomers = registeredUsers.length

    // تحديث الإحصائيات
    setStats({
      totalSales,
      newOrders,
      newCustomers,
      conversionRate: 2.5, // قيمة ثابتة للاختبار
    })

    // تحديث المبيعات الأخيرة
    const sortedOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const recent = sortedOrders.slice(0, 5).map((order) => {
      const name = `${order.customer.firstName} ${order.customer.lastName}`
      const initial = name.charAt(0).toUpperCase()
      return {
        id: order.id,
        orderNumber: order.id,
        time: getTimeAgo(new Date(order.date)),
        date: new Date(order.date).toLocaleDateString("ar-EG", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        amount: order.total,
        customer: {
          name,
          email: order.customer.email,
          image: order.customer.image,
          initials: initial,
          color: getColorForChar(initial),
        },
      }
    })
    setRecentSales(recent)

    // حساب المنتجات الأكثر مبيعًا
    const productSales: Record<number, { name: string; sales: number; image: string }> = {}
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.id]) {
          productSales[item.id] = { name: item.name, sales: 0, image: item.image }
        }
        productSales[item.id].sales += item.quantity
      })
    })

    const sortedProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id: Number(id), ...data }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)

    const maxSales = sortedProducts.length > 0 ? sortedProducts[0].sales : 0
    
    const top = sortedProducts.map(p => ({
      ...p,
      percentage: maxSales > 0 ? (p.sales / maxSales) * 100 : 0
    }))

    setTopProducts(top)

  }, [orders, registeredUsers])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-white text-shadow-sm">لوحة التحكم</h2>
        <p className="text-white text-shadow-sm">نظرة عامة على أداء متجرك</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-black border border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white text-shadow-sm">إجمالي المبيعات</CardTitle>
            <DollarSign className="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white text-shadow-sm">{stats.totalSales.toLocaleString()} ج.م</div>
            <p className="text-xs text-white text-shadow-sm">
              <span className="text-green-500">+0%</span> منذ الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card className="bg-black border border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white text-shadow-sm">الطلبات الجديدة</CardTitle>
            <ShoppingCart className="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white text-shadow-sm">{stats.newOrders}</div>
            <p className="text-xs text-white text-shadow-sm">
              <span className="text-green-500">+0%</span> منذ الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card className="bg-black border border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white text-shadow-sm">العملاء الجدد</CardTitle>
            <Users className="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white text-shadow-sm">{stats.newCustomers}</div>
            <p className="text-xs text-white text-shadow-sm">
              <span className="text-green-500">+0%</span> منذ الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card className="bg-black border border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white text-shadow-sm">معدل التحويل</CardTitle>
            <TrendingUp className="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white text-shadow-sm">{stats.conversionRate}%</div>
            <p className="text-xs text-white text-shadow-sm">
              <span className="text-green-500">+0%</span> منذ الشهر الماضي
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-black border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-shadow-sm">المبيعات الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.length > 0 ? (
                recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={sale.customer.image} alt={sale.customer.name} />
                      <AvatarFallback className={`${sale.customer.color} text-white`}>
                        {sale.customer.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white text-shadow-sm">طلب {sale.orderNumber}</p>
                      <p className="text-xs text-white text-shadow-sm">منذ {sale.time}</p>
                      <p className="text-xs text-gray-400">{sale.date}</p>
                    </div>
                    <div className="text-sm font-medium text-white text-shadow-sm">{sale.amount} ج.م</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-white text-shadow-sm">لا توجد مبيعات حتى الآن</div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-black border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-shadow-sm">المنتجات الأكثر مبيعًا</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-700 relative">
                     <img 
                       src={product.image || "/placeholder.svg"} 
                       alt={product.name}
                       className="object-cover w-full h-full"
                     />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white text-shadow-sm">{product.name}</p>
                    <div className="mt-1 h-2 w-full rounded-full bg-gray-700">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${product.percentage}%` }}></div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-white text-shadow-sm">{product.sales} مبيعات</div>
                </div>
              ))}
              {topProducts.length === 0 && (
                <div className="text-center py-4 text-white text-shadow-sm">لا توجد بيانات كافية</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
