"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Package, Settings, ShoppingBag, User, LogIn, UserPlus, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"
import { toast } from "@/components/ui/use-toast"
import { LocationPicker } from "@/components/location-picker"
// تمت إزالة اعتماد تسجيل الخروج على Supabase

export default function AccountPage() {
  const router = useRouter()
  const { user, isLoggedIn, orders, logout, updateUserInfo, notificationSettings, updateNotificationSettings } = useStore()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    buildingNumber: "",
    floor: "",
    apartment: "",
    image: "",
    backgroundImage: "",
  })

  // تحميل بيانات المستخدم عند تغيير حالة تسجيل الدخول
  useEffect(() => {
    if (isLoggedIn && user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        buildingNumber: user.buildingNumber || "",
        floor: user.floor || "",
        apartment: user.apartment || "",
        image: user.image || "",
        backgroundImage: user.backgroundImage || "",
      })
    }
  }, [isLoggedIn, user])

  // تحديث بيانات النموذج
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // حفظ التغييرات
  const handleSaveChanges = () => {
    // تحديث بيانات المستخدم في المتجر
    updateUserInfo({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      buildingNumber: formData.buildingNumber,
      floor: formData.floor,
      apartment: formData.apartment,
      image: formData.image,
      backgroundImage: formData.backgroundImage,
    })

    toast({
      title: "تم حفظ التغييرات",
      description: "تم تحديث بيانات حسابك بنجاح",
    })
  }

  const handleLogout = async () => {
    try {
      // تسجيل الخروج محلياً فقط
      logout()

      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح",
      })

      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("[v0] Logout error:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      })
    }
  }

  // معالجة اختيار الموقع
  const handleLocationSelected = (address: string, buildingNumber?: string) => {
    setFormData((prev) => ({
      ...prev,
      address,
      buildingNumber: buildingNumber || prev.buildingNumber,
    }))
  }

  // إذا لم يكن المستخدم مسجل الدخول، عرض خيارات تسجيل الدخول أو إنشاء حساب
  if (!isLoggedIn) {
    return (
      <div className="container px-4 md:px-6 py-12 md:py-24">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">حسابي</h1>
          <p className="text-muted-foreground mb-8">
            يرجى تسجيل الدخول أو إنشاء حساب جديد للوصول إلى حسابك الشخصي وتتبع طلباتك.
          </p>
          <div className="flex flex-col gap-4">
            <Button asChild className="w-full" size="lg">
              <Link href="/auth/login">
                <LogIn className="mr-2 h-5 w-5" />
                تسجيل الدخول
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent" size="lg">
              <Link href="/auth/register">
                <UserPlus className="mr-2 h-5 w-5" />
                إنشاء حساب جديد
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // عرض صفحة الحساب للمستخدم المسجل
  return (
    <div className="container px-4 md:px-6 py-6 md:py-10">
      {/* صورة الخلفية للملف الشخصي */}
      {formData.backgroundImage && (
        <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden mb-8 relative">
          <img
            src={formData.backgroundImage}
            alt="صورة الخلفية"
            className="w-full h-full object-cover"
          />
          {/* تراكب خفيف لتحسين قراءة النصوص إذا لزم الأمر */}
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-4">
          {formData.backgroundImage && (
             <div className={`w-20 h-20 rounded-full overflow-hidden border-4 border-background shadow-lg -mt-12 md:-mt-16 ${formData.image ? 'bg-muted' : getColorForChar(formData.firstName?.[0]?.toUpperCase())}`}>
               {formData.image ? (
                 <img src={formData.image} alt={formData.firstName} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                   {formData.firstName?.[0]?.toUpperCase()}
                 </div>
               )}
             </div>
          )}
          <h1 className="text-3xl font-bold">حسابي</h1>
        </div>
        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            الملف الشخصي
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center">
            <ShoppingBag className="mr-2 h-4 w-4" />
            الطلبات
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            الإعدادات
          </TabsTrigger>
        </TabsList>

        {/* الملف الشخصي */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>الملف الشخصي</CardTitle>
              <CardDescription>عرض وتعديل معلومات حسابك الشخصي</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="image">صورة الملف الشخصي (رابط)</Label>
                  <Input
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <p className="text-xs text-muted-foreground">أدخل رابط صورة لتظهر كصورة شخصية لحسابك.</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="backgroundImage">صورة الخلفية (رابط)</Label>
                  <Input
                    id="backgroundImage"
                    name="backgroundImage"
                    value={formData.backgroundImage}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-muted-foreground">أدخل رابط صورة لتظهر كخلفية في ملفك الشخصي.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">الاسم الأول</Label>
                  <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">اسم العائلة</Label>
                  <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="address">العنوان</Label>
                    <LocationPicker onLocationSelected={handleLocationSelected} />
                  </div>
                  <Input id="address" name="address" value={formData.address} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buildingNumber">رقم العمارة</Label>
                  <Input
                    id="buildingNumber"
                    name="buildingNumber"
                    value={formData.buildingNumber}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">الدور</Label>
                  <Input id="floor" name="floor" value={formData.floor} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apartment">الشقة</Label>
                  <Input id="apartment" name="apartment" value={formData.apartment} onChange={handleChange} />
                </div>
              </div>
              <Button onClick={handleSaveChanges}>حفظ التغييرات</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* الطلبات */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>طلباتي</CardTitle>
              <CardDescription>عرض وتتبع طلباتك السابقة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span className="font-medium">{order.id}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {order.date} • {order.items.length} منتج
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-medium">{order.total} ج.م</span>
                          <span
                            className={`text-sm ${
                              order.status === "تم التسليم"
                                ? "text-green-500"
                                : order.status === "قيد الشحن"
                                  ? "text-blue-500"
                                  : "text-amber-500"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="flex justify-between">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/account/orders/${order.id}`}>عرض التفاصيل</Link>
                </Button>
                        {order.status === "تم التسليم" && (
                          <Button variant="outline" size="sm">
                            إعادة الطلب
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium mb-2">لا توجد طلبات</h3>
                    <p className="text-muted-foreground mb-4">لم تقم بإجراء أي طلبات حتى الآن</p>
                      <Button asChild>
                        <Link href="/products">تسوق الآن</Link>
                      </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* الإعدادات */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات</CardTitle>
              <CardDescription>إدارة إعدادات حسابك والخصوصية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">تغيير كلمة المرور</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">كلمة المرور الحالية</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                  <Button className="mt-4">تغيير كلمة المرور</Button>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">إعدادات الإشعارات</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">إشعارات البريد الإلكتروني</Label>
                        <p className="text-xs text-muted-foreground">تلقي رسائل حول طلباتك والعروض</p>
                      </div>
                      <input
                        type="checkbox"
                        id="email-notifications"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={notificationSettings.email}
                        onChange={(e) => updateNotificationSettings({ email: e.target.checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-notifications">إشعارات الموقع</Label>
                        <p className="text-xs text-muted-foreground">تلقي إشعارات فورية حول تحديثات الطلبات</p>
                      </div>
                      <input
                        type="checkbox"
                        id="push-notifications"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={notificationSettings.push}
                        onChange={(e) => updateNotificationSettings({ push: e.target.checked })}
                      />
                    </div>
                  </div>
                  <Button
                    className="mt-4"
                    onClick={() =>
                      toast({
                        title: "تم حفظ الإعدادات",
                        description: "تم تحديث تفضيلات الإشعارات بنجاح",
                      })
                    }
                  >
                    حفظ الإعدادات
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
