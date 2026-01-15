"use client"

import { useState, useEffect } from "react"
import { Check, ChevronDown, Eye, Loader2, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { useStore } from "@/lib/store"

interface Order {
  id: string
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    location?: { lat: number; lng: number }
  }
  items: {
    id: number
    name: string
    price: number
    quantity: number
    image: string
    size: string
    color: string
  }[]
  total: number
  status: "قيد المعالجة" | "قيد الشحن" | "تم التسليم" | "تم الإلغاء"
  date: string
}

export function OrdersPanel() {
  const { orders, updateOrderStatus } = useStore()
  const [isLoading, setIsLoading] = useState(true)
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // تحميل الطلبات
  useEffect(() => {
    // محاكاة تأخير الشبكة
    const timer = setTimeout(() => {
      setAllOrders(orders)
      setFilteredOrders(orders)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [orders])

  // البحث في الطلبات
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredOrders(allOrders)
      return
    }

    const lowerQuery = query.toLowerCase()
    const filtered = allOrders.filter(
      (order) =>
        order.id.toLowerCase().includes(lowerQuery) ||
        `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase().includes(lowerQuery) ||
        order.customer.email.toLowerCase().includes(lowerQuery) ||
        order.customer.phone.includes(query) ||
        order.status.includes(query) ||
        order.date.includes(query),
    )
    setFilteredOrders(filtered)
  }

  // عرض تفاصيل الطلب
  const showOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailsOpen(true)
  }

  // تحديث حالة الطلب
  const handleUpdateStatus = (
    orderId: string,
    newStatus: "قيد المعالجة" | "قيد الشحن" | "تم التسليم" | "تم الإلغاء",
  ) => {
    updateOrderStatus(orderId, newStatus)

    // تحديث القوائم المحلية
    setAllOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
    setFilteredOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))

    // تحديث الطلب المحدد إذا كان مفتوحًا
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }

    toast({
      title: "تم تحديث حالة الطلب",
      description: `تم تغيير حالة الطلب ${orderId} إلى ${newStatus}`,
    })
  }

  // الحصول على لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case "قيد المعالجة":
        return "bg-blue-500 hover:bg-blue-600"
      case "قيد الشحن":
        return "bg-amber-500 hover:bg-amber-600"
      case "تم التسليم":
        return "bg-green-500 hover:bg-green-600"
      case "تم الإلغاء":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="البحث في الطلبات..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="rounded-full bg-muted p-3">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium">لم يتم العثور على طلبات</h3>
          <p className="mt-2 text-sm text-muted-foreground">لم نتمكن من العثور على أي طلبات تطابق بحثك.</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{`${order.customer.firstName} ${order.customer.lastName}`}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString("ar-EG")}</TableCell>
                  <TableCell>{order.total} ج.م</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => showOrderDetails(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "قيد المعالجة")}>
                            <span className="flex items-center">
                              {order.status === "قيد المعالجة" && <Check className="mr-2 h-4 w-4" />}
                              قيد المعالجة
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "قيد الشحن")}>
                            <span className="flex items-center">
                              {order.status === "قيد الشحن" && <Check className="mr-2 h-4 w-4" />}
                              قيد الشحن
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "تم التسليم")}>
                            <span className="flex items-center">
                              {order.status === "تم التسليم" && <Check className="mr-2 h-4 w-4" />}
                              تم التسليم
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "تم الإلغاء")}>
                            <span className="flex items-center">
                              {order.status === "تم الإلغاء" && <Check className="mr-2 h-4 w-4" />}
                              تم الإلغاء
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* نافذة تفاصيل الطلب */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              تاريخ الطلب: {selectedOrder ? new Date(selectedOrder.date).toLocaleDateString("ar-EG") : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">حالة الطلب</h3>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        تغيير الحالة <ChevronDown className="mr-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleUpdateStatus(selectedOrder.id, "قيد المعالجة")}>
                        <span className="flex items-center">
                          {selectedOrder.status === "قيد المعالجة" && <Check className="mr-2 h-4 w-4" />}
                          قيد المعالجة
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(selectedOrder.id, "قيد الشحن")}>
                        <span className="flex items-center">
                          {selectedOrder.status === "قيد الشحن" && <Check className="mr-2 h-4 w-4" />}
                          قيد الشحن
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(selectedOrder.id, "تم التسليم")}>
                        <span className="flex items-center">
                          {selectedOrder.status === "تم التسليم" && <Check className="mr-2 h-4 w-4" />}
                          تم التسليم
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(selectedOrder.id, "تم الإلغاء")}>
                        <span className="flex items-center">
                          {selectedOrder.status === "تم الإلغاء" && <Check className="mr-2 h-4 w-4" />}
                          تم الإلغاء
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">بيانات العميل</h3>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">الاسم:</span> {selectedOrder.customer.firstName}{" "}
                    {selectedOrder.customer.lastName}
                  </p>
                  <p>
                    <span className="font-medium">البريد الإلكتروني:</span> {selectedOrder.customer.email}
                  </p>
                  <p>
                    <span className="font-medium">الهاتف:</span> {selectedOrder.customer.phone}
                  </p>
                  <p>
                    <span className="font-medium">العنوان:</span> {selectedOrder.customer.address}
                  </p>
                </div>
              </div>

              {/* خريطة الموقع */}
              {selectedOrder.customer.address && (
                <div>
                  <h3 className="text-sm font-medium mb-2">الموقع على الخريطة</h3>
                  <div className="rounded-md overflow-hidden border border-gray-200 h-[300px] w-full bg-gray-100">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight={0}
                      marginWidth={0}
                      src={`https://www.google.com/maps?q=${encodeURIComponent(selectedOrder.customer.address)}&output=embed&z=15`}
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-2">المنتجات</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-md overflow-hidden">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.size} • {item.color} • {item.quantity} قطعة
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.price} ج.م</p>
                        <p className="text-xs text-muted-foreground">الإجمالي: {item.price * item.quantity} ج.م</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium">المجموع الفرعي</span>
                <span className="font-medium">
                  {(selectedOrder.discountDetails 
                    ? selectedOrder.total + selectedOrder.discountDetails.amount 
                    : selectedOrder.total).toLocaleString()} ج.م
                </span>
              </div>

              {selectedOrder.discountDetails && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="font-medium">
                    خصم ({selectedOrder.discountDetails.code})
                    {selectedOrder.discountDetails.type === 'percentage' && ` (${selectedOrder.discountDetails.value}%)`}
                  </span>
                  <span className="font-medium">-{selectedOrder.discountDetails.amount.toLocaleString()} ج.م</span>
                </div>
              )}
              
              {selectedOrder.appliedDiscountCode && !selectedOrder.discountDetails && (
                 <div className="flex justify-between items-center text-green-600">
                  <span className="font-medium">كود خصم</span>
                  <span className="font-medium">{selectedOrder.appliedDiscountCode}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-bold">الإجمالي</span>
                <span className="font-bold text-lg">{selectedOrder.total.toLocaleString()} ج.م</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
