"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Minus, Plus, Trash2, CreditCard, Truck, CheckCircle, MapPin, User, Mail, Phone, Home, Building } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useStore } from "@/lib/store"
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { LocationPicker } from "@/components/location-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CartPage() {
  const router = useRouter()
  const { cart, removeFromCart, updateCartItemQuantity, getCartTotal, clearCart, user, isLoggedIn, createOrder, updateUserInfo } = useStore()

  const [subtotal, setSubtotal] = useState(0)
  const [shipping, setShipping] = useState(50)
  const [total, setTotal] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [couponCode, setCouponCode] = useState("")

  // Checkout State
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    buildingNumber: "",
    floor: "",
    apartment: "",
    notes: "",
    paymentMethod: "cod", // الدفع عند الاستلام افتراضياً
  })

  // حساب المجاميع عند تغيير السلة
  useEffect(() => {
    const newSubtotal = getCartTotal()
    setSubtotal(newSubtotal)
    setTotal(Math.max(0, newSubtotal - discount) + shipping)
  }, [cart, shipping, getCartTotal, discount])

  // تعبئة بيانات المستخدم إذا كان مسجل الدخول
  useEffect(() => {
    if (isLoggedIn && user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        buildingNumber: user.buildingNumber || "",
        floor: user.floor || "",
        apartment: user.apartment || "",
      }))
    }
  }, [isLoggedIn, user])

  // زيادة الكمية
  const increaseQuantity = (id: number) => {
    const item = cart.find((item) => item.id === id)
    if (item) {
      updateCartItemQuantity(id, item.quantity + 1)
    }
  }

  // تقليل الكمية
  const decreaseQuantity = (id: number) => {
    const item = cart.find((item) => item.id === id)
    if (item && item.quantity > 1) {
      updateCartItemQuantity(id, item.quantity - 1)
    }
  }

  // إفراغ السلة
  const handleClearCart = () => {
    if (confirm("هل أنت متأكد من إفراغ السلة؟")) {
      clearCart()
      toast({
        title: "تم إفراغ السلة",
        description: "تم إفراغ سلة التسوق بنجاح",
      })
    }
  }

  // تطبيق الكوبون
  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase()
    if (!code) {
      setDiscount(0)
      return
    }
    if (code === "CHIKA10") {
      setDiscount(Math.round(subtotal * 0.1))
      toast({ title: "تم تطبيق الخصم", description: "خصم 10%" })
    } else if (code === "CHIKA50") {
      setDiscount(50)
      toast({ title: "تم تطبيق الخصم", description: "خصم 50 ج.م" })
    } else {
      setDiscount(0)
      toast({ title: "كود غير صالح", description: "تحقق من الكود", variant: "destructive" })
    }
  }

  // تحديث بيانات النموذج
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // معالجة اختيار الموقع
  const handleLocationSelected = (address: string, buildingNumber?: string) => {
    setFormData((prev) => ({
      ...prev,
      address,
      buildingNumber: buildingNumber || prev.buildingNumber,
    }))
  }

  // معالجة الطلب (تستخدمها آلية السحب والزر التقليدي)
  const processOrder = () => {
    if (cart.length === 0) {
      toast({ title: "السلة فارغة", description: "أضف منتجات قبل إتمام الطلب", variant: "destructive" })
      return false
    }

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.buildingNumber ||
      !formData.floor ||
      !formData.apartment
    ) {
      toast({
        title: "بيانات غير مكتملة",
        description: "الرجاء ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return false
    }

    const orderUser = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      buildingNumber: formData.buildingNumber,
      floor: formData.floor,
      apartment: formData.apartment,
    }

    if (isLoggedIn) {
      updateUserInfo(orderUser)
    }

    const newOrderId = createOrder()
    if (newOrderId) {
      setOrderId(newOrderId)
      setOrderComplete(true)
      return true
    }
    toast({
      title: "خطأ في إنشاء الطلب",
      description: "حدث خطأ أثناء إنشاء الطلب. الرجاء المحاولة مرة أخرى",
      variant: "destructive",
    })
    return false
  }

  // مكوّن السحب للتأكيد
  function SwipeToConfirm({ label, onConfirm }: { label: string; onConfirm: () => void }) {
    const [dragPercent, setDragPercent] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const trackRef = useState<HTMLDivElement | null>(null)[0]
    const [trackEl, setTrackEl] = useState<HTMLDivElement | null>(null)
    const [showOverlay, setShowOverlay] = useState(false)

    const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
      setIsDragging(true)
      setDragPercent(0)
    }

    const moveDrag = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging || !trackEl) return
      const rect = trackEl.getBoundingClientRect()
      let clientX =
        "touches" in e && e.touches.length > 0 ? e.touches[0].clientX : (e as React.MouseEvent).clientX
      const delta = Math.min(Math.max(clientX - rect.left, 0), rect.width)
      const percent = Math.round((delta / rect.width) * 100)
      setDragPercent(percent)
    }

    const endDrag = () => {
      if (!isDragging) return
      setIsDragging(false)
      if (dragPercent >= 95) {
        setShowOverlay(true)
        setTimeout(() => {
          onConfirm()
          setDragPercent(0)
          setShowOverlay(false)
        }, 900)
      } else {
        setDragPercent(0)
      }
    }

    return (
      <div className="space-y-2">
        <div className="text-center font-medium">{label}</div>
        <div
          ref={setTrackEl}
          className="relative w-full h-14 rounded-full bg-muted overflow-hidden select-none border border-primary/30"
          onMouseMove={moveDrag}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchMove={moveDrag}
          onTouchEnd={endDrag}
        >
          <div className="absolute inset-y-0 left-0 bg-primary/20 transition-[width] duration-150" style={{ width: `${dragPercent}%` }} />
          <div
            className="absolute inset-y-1 left-1 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
            style={{ transform: `translateX(${Math.max(dragPercent - 2, 0)}%)` }}
            onMouseDown={startDrag}
            onTouchStart={startDrag}
          >
            <CheckCircle className="h-5 w-5" />
          </div>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`h-[3px] w-6 rounded-full ${i * 20 < dragPercent ? "bg-primary" : "bg-muted-foreground/20"}`} />
            ))}
          </div>
        </div>
        {showOverlay && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
            <div className="h-24 w-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-[spin_0.9s_linear]">
              <CheckCircle className="h-12 w-12 animate-[zoom-in_0.9s_ease]" />
            </div>
          </div>
        )}
      </div>
    )
  }

  // عرض صفحة تأكيد الطلب
  if (orderComplete) {
    return (
      <div className="container px-4 md:px-6 py-12 md:py-24">
        <div className="max-w-md mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">تم إرسال طلبك بنجاح!</h1>
          <p className="text-muted-foreground mb-6">شكرًا لك على طلبك. تم إرسال تفاصيل الطلب إلى بريدك الإلكتروني.</p>
          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="font-medium">رقم الطلب: {orderId}</p>
            <p className="text-sm text-muted-foreground">يمكنك استخدام هذا الرقم لتتبع طلبك</p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-primary" />
              <span>سيتم توصيل طلبك خلال 3-5 أيام عمل</span>
            </div>
            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <Link href="/">العودة للرئيسية</Link>
              </Button>
              <Button asChild>
                <Link href="/products">مواصلة التسوق</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 md:px-6 py-6 md:py-10">
      <h1 className="text-3xl font-bold mb-6">سلة التسوق وإتمام الطلب</h1>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* القسم الأيمن: المنتجات */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>المنتجات ({cart.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">المنتج</TableHead>
                        <TableHead>التفاصيل</TableHead>
                        <TableHead className="text-center w-[100px]">الكمية</TableHead>
                        <TableHead className="text-left w-[80px]">السعر</TableHead>
                        <TableHead className="w-[40px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={`${item.id}-${item.size}-${item.color}`}>
                          <TableCell>
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <h3 className="font-medium text-sm">{item.name}</h3>
                              <p className="text-xs text-muted-foreground">{item.size} / {item.color}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => decreaseQuantity(item.id)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-sm">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => increaseQuantity(item.id)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-left font-medium text-sm">{item.price * item.quantity} ج.م</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <Button asChild variant="link" className="px-0">
                    <Link href="/products">مواصلة التسوق</Link>
                  </Button>
                  <Button variant="ghost" className="text-destructive px-0 hover:bg-transparent hover:text-destructive/80" onClick={handleClearCart}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    إفراغ السلة
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ملخص الطلب */}
            <Card>
              <CardHeader>
                <CardTitle>ملخص الحساب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="كود الخصم" 
                    value={couponCode} 
                    onChange={(e) => setCouponCode(e.target.value)} 
                  />
                  <Button variant="outline" onClick={applyCoupon}>تطبيق</Button>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي</span>
                    <span>{subtotal} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الشحن</span>
                    <span>{shipping} ج.م</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>الخصم</span>
                      <span>-{discount} ج.م</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>الإجمالي</span>
                    <span>{total.toFixed(2)} ج.م</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* القسم الأيسر: نموذج الدفع */}
          <div>
            <form onSubmit={(e) => { e.preventDefault(); }}>
              <Card>
                <CardHeader>
                  <CardTitle>تفاصيل الشحن والدفع</CardTitle>
                  <CardDescription>الرجاء إدخال بيانات التوصيل</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* المعلومات الشخصية */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" /> المعلومات الشخصية
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">الاسم الأول *</Label>
                        <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">اسم العائلة *</Label>
                        <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني *</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف *</Label>
                      <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                    </div>
                  </div>

                  <Separator />

                  {/* العنوان */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> عنوان التوصيل
                      </h3>
                      <LocationPicker onLocationSelected={handleLocationSelected} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">العنوان بالكامل *</Label>
                      <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="الشارع، المنطقة، المدينة" required />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="buildingNumber">رقم العمارة *</Label>
                        <Input id="buildingNumber" name="buildingNumber" value={formData.buildingNumber} onChange={handleChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="floor">الدور *</Label>
                        <Input id="floor" name="floor" value={formData.floor} onChange={handleChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apartment">الشقة *</Label>
                        <Input id="apartment" name="apartment" value={formData.apartment} onChange={handleChange} required />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* طريقة الدفع */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> طريقة الدفع
                    </h3>
                    <RadioGroup defaultValue="cod" name="paymentMethod" className="grid grid-cols-1 gap-4">
                      <div className="flex items-center space-x-2 space-x-reverse border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex-1 cursor-pointer">الدفع عند الاستلام</Label>
                        <Truck className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                        <RadioGroupItem value="card" id="card" disabled />
                        <div className="flex-1">
                          <Label htmlFor="card" className="cursor-pointer text-muted-foreground">بطاقة ائتمان (قريباً)</Label>
                        </div>
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="notes">ملاحظات إضافية</Label>
                    <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} placeholder="أي تعليمات خاصة للتوصيل..." />
                  </div>

                  <SwipeToConfirm
                    label={`اسحب لليمين لتأكيد الطلب (${total.toFixed(2)} ج.م)`}
                    onConfirm={() => { processOrder() }}
                  />
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">سلة التسوق فارغة</h2>
          <p className="text-muted-foreground mb-6">لم تقم بإضافة أي منتجات إلى سلة التسوق بعد.</p>
          <Button asChild size="lg">
            <Link href="/products">تسوق الآن</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
