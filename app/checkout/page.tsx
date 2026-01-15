"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CreditCard, Truck, CheckCircle, LogIn, UserPlus, Minus, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/lib/store"
import { toast } from "@/components/ui/use-toast"
import { LocationPicker } from "@/components/location-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, getCartTotal, user, isLoggedIn, createOrder, updateUserInfo, updateCartItemQuantity, removeFromCart } = useStore()
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [showLoginOptions, setShowLoginOptions] = useState(!isLoggedIn)
  const [couponCode, setCouponCode] = useState("")
  const [discount, setDiscount] = useState(0)

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

  // حساب المجاميع
  const subtotal = getCartTotal()
  const shipping = 50
  const total = Math.max(0, subtotal - discount) + shipping

  // تعبئة بيانات المستخدم إذا كان مسجل الدخول
  useEffect(() => {
    if (isLoggedIn && user) {
      setFormData({
        ...formData,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        buildingNumber: user.buildingNumber || "",
        floor: user.floor || "",
        apartment: user.apartment || "",
      })
      setShowLoginOptions(false)
    } else {
      setShowLoginOptions(true)
    }
  }, [isLoggedIn, user])

  // التحقق من وجود منتجات في السلة
  useEffect(() => {
    if (cart.length === 0 && !orderComplete) {
      router.push("/cart")
    }
  }, [cart, router, orderComplete])

  const increaseQuantity = (id: string) => {
    const item = cart.find((i) => `${i.id}` === `${id}`)
    if (!item) return
    updateCartItemQuantity(item.id, item.quantity + 1)
  }

  const decreaseQuantity = (id: string) => {
    const item = cart.find((i) => `${i.id}` === `${id}`)
    if (!item) return
    updateCartItemQuantity(item.id, item.quantity - 1)
  }

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

  // إرسال الطلب
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // التحقق من البيانات المطلوبة
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
      return
    }

    // إنشاء كائن المستخدم
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

    // تحديث بيانات المستخدم في المخزن
    if (isLoggedIn) {
      updateUserInfo(orderUser)
    }

    // إنشاء الطلب
    const newOrderId = createOrder()

    if (newOrderId) {
      setOrderId(newOrderId)
      setOrderComplete(true)

      // في تطبيق حقيقي، يمكن إرسال بريد إلكتروني للتأكيد أو إعادة التوجيه إلى صفحة الدفع
    } else {
      toast({
        title: "خطأ في إنشاء الطلب",
        description: "حدث خطأ أثناء إنشاء الطلب. الرجاء المحاولة مرة أخرى",
        variant: "destructive",
      })
    }
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
                <Link href="/account/orders">تتبع طلبك</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // عرض خيارات تسجيل الدخول إذا لم يكن المستخدم مسجل الدخول
  if (showLoginOptions) {
    return (
      <div className="container px-4 md:px-6 py-12 md:py-24">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">إتمام الطلب</h1>
          <p className="text-muted-foreground mb-8">يرجى تسجيل الدخول أو إنشاء حساب جديد لإتمام عملية الشراء</p>
          <div className="flex flex-col gap-4">
            <Button asChild className="w-full" size="lg">
              <Link href={`/auth/login?redirect=${encodeURIComponent("/checkout")}`}>
                <LogIn className="mr-2 h-5 w-5" />
                تسجيل الدخول
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href={`/auth/register?redirect=${encodeURIComponent("/checkout")}`}>
                <UserPlus className="mr-2 h-5 w-5" />
                إنشاء حساب جديد
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 md:px-6 py-6 md:py-10">
      <h1 className="text-3xl font-bold mb-6">إتمام الطلب</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">المنتج</TableHead>
                  <TableHead>التفاصيل</TableHead>
                  <TableHead className="text-center">الكمية</TableHead>
                  <TableHead className="text-left">السعر</TableHead>
                  <TableHead className="text-left">الإجمالي</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.map((item) => (
                  <TableRow key={`${item.id}-${item.size}-${item.color}`}>
                    <TableCell>
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">المقاس: {item.size}</p>
                        <p className="text-sm text-muted-foreground">اللون: {item.color}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => decreaseQuantity(item.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-10 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => increaseQuantity(item.id)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-left">{item.price} ج.م</TableCell>
                    <TableCell className="text-left">{item.price * item.quantity} ج.م</TableCell>
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

          <form onSubmit={handleSubmit}>
            {/* معلومات الشحن */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">معلومات الشحن</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">الاسم الأول</Label>
                  <Input id="first-name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">الاسم الأخير</Label>
                  <Input id="last-name" name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="address">العنوان</Label>
                    <LocationPicker onLocationSelected={handleLocationSelected} />
                  </div>
                  <Input id="address" name="address" value={formData.address} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="building-number">رقم العمارة</Label>
                  <Input
                    id="building-number"
                    name="buildingNumber"
                    value={formData.buildingNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">الدور</Label>
                  <Input id="floor" name="floor" value={formData.floor} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apartment">الشقة</Label>
                  <Input id="apartment" name="apartment" value={formData.apartment} onChange={handleChange} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                  <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* طريقة الدفع */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">طريقة الدفع</h2>
              <RadioGroup
                defaultValue="cod"
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod">الدفع عند الاستلام</Label>
                </div>
                <Separator className="my-4" />
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4" />
                    بطاقة ائتمان
                  </Label>
                </div>
                {formData.paymentMethod === "card" && (
                  <div className="mt-4 pr-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-number">رقم البطاقة</Label>
                      <Input id="card-number" placeholder="0000 0000 0000 0000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-name">الاسم على البطاقة</Label>
                      <Input id="card-name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiry">تاريخ الانتهاء</Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">رمز الأمان (CVV)</Label>
                      <Input id="cvv" />
                    </div>
                  </div>
                )}
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full mt-6" size="lg">
              تأكيد الطلب
            </Button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 space-y-4 sticky top-20">
            <h2 className="text-xl font-bold">ملخص الطلب</h2>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>{item.price * item.quantity} ج.م</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between">
                <span>المجموع الفرعي</span>
                <span>{subtotal} ج.م</span>
              </div>
              <div className="flex gap-2">
                <Input placeholder="كود الخصم" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                <Button type="button" variant="outline" onClick={applyCoupon}>تطبيق</Button>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>الخصم</span>
                  <span>-{discount} ج.م</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>الشحن</span>
                <span>{shipping} ج.م</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>الإجمالي</span>
                <span>{total} ج.م</span>
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground mt-4">
              بالضغط على "تأكيد الطلب"، فإنك توافق على{" "}
              <Link href="/terms" className="underline hover:text-primary">
                الشروط والأحكام
              </Link>{" "}
              و{" "}
              <Link href="/privacy" className="underline hover:text-primary">
                سياسة الخصوصية
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
