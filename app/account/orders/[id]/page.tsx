"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowRight, Package, Truck, CheckCircle, MapPin, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useStore, type Order } from "@/lib/store"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { orders, isLoggedIn, updateOrderStatus, canCancelOrder } = useStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/auth/login")
    }
  }, [isLoggedIn, router])

  // البحث عن الطلب بواسطة المعرف
  useEffect(() => {
    if (params.id && orders.length > 0) {
      const foundOrder = orders.find((o) => o.id === params.id)
      if (foundOrder) {
        setOrder(foundOrder)
      } else {
        // إذا لم يتم العثور على الطلب، العودة إلى صفحة الحساب
        router.push("/account")
      }
    }
  }, [params.id, orders, router])

  // تعديل وظيفة إلغاء الطلب لتعمل بشكل صحيح

  // إلغاء الطلب
  const cancelOrder = () => {
    if (order) {
      // استدعاء وظيفة تحديث حالة الطلب من المتجر
      updateOrderStatus(order.id, "تم الإلغاء")

      // تحديث حالة الطلب محلياً
      setOrder({ ...order, status: "تم الإلغاء" })

      toast({
        title: "تم إلغاء الطلب",
        description: `تم إلغاء الطلب ${order.id} بنجاح`,
      })

      setIsDeleteDialogOpen(false)
    }
  }

  // عرض حالة التحميل
  if (!order) {
    return (
      <div className="container px-4 md:px-6 py-12 flex items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    )
  }

  // الحصول على أيقونة الحالة
  const getStatusIcon = () => {
    switch (order.status) {
      case "قيد المعالجة":
        return <Package className="h-6 w-6 text-amber-500" />
      case "قيد الشحن":
        return <Truck className="h-6 w-6 text-blue-500" />
      case "تم التسليم":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "تم الإلغاء":
        return <Trash2 className="h-6 w-6 text-red-500" />
      default:
        return <Package className="h-6 w-6" />
    }
  }

  // الحصول على لون الحالة
  const getStatusColor = () => {
    switch (order.status) {
      case "قيد المعالجة":
        return "bg-amber-100 text-amber-800"
      case "قيد الشحن":
        return "bg-blue-100 text-blue-800"
      case "تم التسليم":
        return "bg-green-100 text-green-800"
      case "تم الإلغاء":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/account" className="text-muted-foreground hover:text-foreground">
          <ArrowRight className="h-4 w-4 transform rotate-180" />
          <span className="sr-only">العودة</span>
        </Link>
        <h1 className="text-2xl font-bold">تفاصيل الطلب {order.id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* معلومات الطلب */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات الطلب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">رقم الطلب</div>
                  <div className="font-medium">{order.id}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">تاريخ الطلب</div>
                  <div className="font-medium">{order.date}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">إجمالي الطلب</div>
                  <div className="font-medium">{order.total} ج.م</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">حالة الطلب</div>
                  <div
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor()}`}
                  >
                    {getStatusIcon()}
                    {order.status}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* المنتجات */}
          <Card>
            <CardHeader>
              <CardTitle>المنتجات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4 py-4 border-b last:border-0">
                    <div className="w-16 h-16 rounded-md overflow-hidden">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <div className="text-sm text-muted-foreground">
                        المقاس: {item.size} | اللون: {item.color}
                      </div>
                      <div className="text-sm">
                        {item.price} ج.م × {item.quantity}
                      </div>
                    </div>
                    <div className="font-medium">{item.price * item.quantity} ج.م</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between">
                  <span>المجموع الفرعي</span>
                  <span>{order.total - 50} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span>الشحن</span>
                  <span>50 ج.م</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>الإجمالي</span>
                  <span>{order.total} ج.م</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* معلومات الشحن */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات الشحن</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">العنوان</h3>
                  <p className="text-muted-foreground mt-1">{order.customer.address}</p>
                  {order.customer.buildingNumber && (
                    <p className="text-muted-foreground">رقم العمارة: {order.customer.buildingNumber}</p>
                  )}
                  {order.customer.floor && <p className="text-muted-foreground">الدور: {order.customer.floor}</p>}
                  {order.customer.apartment && (
                    <p className="text-muted-foreground">الشقة: {order.customer.apartment}</p>
                  )}
                </div>
                {order.customer.location && (
                  <Button variant="outline" size="sm" className="w-full">
                    <MapPin className="mr-2 h-4 w-4" />
                    عرض الموقع على الخريطة
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* معلومات العميل */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات العميل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الاسم</span>
                  <span>
                    {order.customer.firstName} {order.customer.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">البريد الإلكتروني</span>
                  <span>{order.customer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">رقم الهاتف</span>
                  <span>{order.customer.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* إجراءات */}
          <div className="flex flex-col gap-2">
            {canCancelOrder(order) && (
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    إلغاء الطلب
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>هل أنت متأكد من إلغاء هذا الطلب؟</AlertDialogTitle>
                    <AlertDialogDescription>
                      سيتم إلغاء الطلب بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={cancelOrder}>
                      تأكيد الإلغاء
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => toast({ title: "قريباً", description: "هذه الميزة ستكون متاحة قريباً" })}
            >
              <Truck className="mr-2 h-4 w-4" />
              تتبع الشحنة
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => toast({ title: "قريباً", description: "هذه الميزة ستكون متاحة قريباً" })}
            >
              إعادة الطلب
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => toast({ title: "قريباً", description: "هذه الميزة ستكون متاحة قريباً" })}
            >
              طلب المساعدة
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
