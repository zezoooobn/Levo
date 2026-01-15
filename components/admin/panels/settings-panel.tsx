"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useEffect, useState } from "react"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { db, ensureAuth } from "@/lib/firebase/client"
import { useStore } from "@/lib/store"

export function SettingsPanel() {
  const [shippingPricing, setShippingPricing] = useState<Record<string, number>>({})
  const setStoreShippingPricing = useStore((s) => s.setShippingPricing)
  const storeShippingPricing = useStore((s) => s.shippingPricing)

  useEffect(() => {
    ;(async () => {
      try {
        await ensureAuth()
        const snap = await getDoc(doc(db, "shippingPricing", "eg"))
        if (snap.exists()) {
          const data = snap.data() as any
          const map: Record<string, number> = {}
          Object.keys(data).forEach((k) => {
            if (typeof data[k] === "number") map[k] = data[k]
          })
          setShippingPricing(map)
          setStoreShippingPricing(map)
        } else {
          const def = {
            cairo: 50,
            giza: 60,
            alexandria: 80,
            ismailia: 100,
            port_said: 90,
            suez: 90,
            sharqia: 70,
            qalyubia: 70,
            gharbia: 70,
            monufia: 70,
            dakahlia: 70,
            kafr_el_sheikh: 75,
            beheira: 75,
            damietta: 80,
            faiyum: 85,
            beni_suef: 85,
            minya: 95,
            asyut: 95,
            sohag: 100,
            qena: 110,
            luxor: 120,
            aswan: 130,
            matrouh: 120,
            north_sinai: 140,
            south_sinai: 140,
            red_sea: 130,
            new_valley: 150,
            others: 90,
          }
          setShippingPricing(storeShippingPricing && Object.keys(storeShippingPricing).length ? storeShippingPricing : def)
          setStoreShippingPricing(storeShippingPricing && Object.keys(storeShippingPricing).length ? storeShippingPricing : def)
        }
      } catch {}
    })()
  }, [])

  const saveShippingPricing = async () => {
    try {
      await ensureAuth()
      await setDoc(doc(db, "shippingPricing", "eg"), { ...shippingPricing, updatedAt: serverTimestamp() })
      setStoreShippingPricing(shippingPricing)
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">إعدادات المتجر</h2>
        <p className="text-muted-foreground">تخصيص وإدارة إعدادات المتجر</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">عام</TabsTrigger>
          <TabsTrigger value="shipping">الشحن</TabsTrigger>
          <TabsTrigger value="payment">الدفع</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>معلومات المتجر</CardTitle>
              <CardDescription>تعديل المعلومات الأساسية للمتجر</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store-name">اسم المتجر</Label>
                  <Input id="store-name" defaultValue="أناقتي" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-email">البريد الإلكتروني</Label>
                  <Input id="store-email" type="email" defaultValue="info@anaqati.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-phone">رقم الهاتف</Label>
                  <Input id="store-phone" type="tel" defaultValue="01234567890" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-currency">العملة</Label>
                  <Input id="store-currency" defaultValue="ج.م" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-address">العنوان</Label>
                <Textarea id="store-address" defaultValue="123 شارع النيل، القاهرة، مصر" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-description">وصف المتجر</Label>
                <Textarea
                  id="store-description"
                  defaultValue="متجر أناقتي للملابس العصرية والأنيقة بأسعار مناسبة وجودة عالية"
                />
              </div>
              <Button>حفظ التغييرات</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>الشعار والألوان</CardTitle>
              <CardDescription>تخصيص مظهر المتجر</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>شعار المتجر</Label>
                  <div className="flex h-32 cursor-pointer items-center justify-center rounded-md border border-dashed border-gray-300 hover:border-primary">
                    <span className="text-muted-foreground">اضغط لتحميل الشعار</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>أيقونة المتجر (Favicon)</Label>
                  <div className="flex h-32 cursor-pointer items-center justify-center rounded-md border border-dashed border-gray-300 hover:border-primary">
                    <span className="text-muted-foreground">اضغط لتحميل الأيقونة</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary-color">اللون الرئيسي</Label>
                  <div className="flex gap-2">
                    <Input id="primary-color" defaultValue="#E11D48" />
                    <div className="h-10 w-10 rounded-md" style={{ backgroundColor: "#E11D48" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">اللون الثانوي</Label>
                  <div className="flex gap-2">
                    <Input id="secondary-color" defaultValue="#F1F5F9" />
                    <div className="h-10 w-10 rounded-md" style={{ backgroundColor: "#F1F5F9" }}></div>
                  </div>
                </div>
              </div>
              <Button>حفظ التغييرات</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="shipping" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الشحن</CardTitle>
              <CardDescription>تكوين طرق وتكاليف الشحن</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>القاهرة</Label>
                  <Input
                    type="number"
                    value={shippingPricing.cairo ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, cairo: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الجيزة</Label>
                  <Input
                    type="number"
                    value={shippingPricing.giza ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, giza: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الإسكندرية</Label>
                  <Input
                    type="number"
                    value={shippingPricing.alexandria ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, alexandria: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الإسماعيلية</Label>
                  <Input
                    type="number"
                    value={shippingPricing.ismailia ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, ismailia: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>بورسعيد</Label>
                  <Input
                    type="number"
                    value={shippingPricing.port_said ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, port_said: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>السويس</Label>
                  <Input
                    type="number"
                    value={shippingPricing.suez ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, suez: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الشرقية</Label>
                  <Input
                    type="number"
                    value={shippingPricing.sharqia ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, sharqia: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>القليوبية</Label>
                  <Input
                    type="number"
                    value={shippingPricing.qalyubia ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, qalyubia: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الغربية</Label>
                  <Input
                    type="number"
                    value={shippingPricing.gharbia ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, gharbia: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>المنوفية</Label>
                  <Input
                    type="number"
                    value={shippingPricing.monufia ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, monufia: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الدقهلية</Label>
                  <Input
                    type="number"
                    value={shippingPricing.dakahlia ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, dakahlia: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>كفر الشيخ</Label>
                  <Input
                    type="number"
                    value={shippingPricing.kafr_el_sheikh ?? 0}
                    onChange={(e) =>
                      setShippingPricing({ ...shippingPricing, kafr_el_sheikh: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>البحيرة</Label>
                  <Input
                    type="number"
                    value={shippingPricing.beheira ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, beheira: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>دمياط</Label>
                  <Input
                    type="number"
                    value={shippingPricing.damietta ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, damietta: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الفيوم</Label>
                  <Input
                    type="number"
                    value={shippingPricing.faiyum ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, faiyum: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>بني سويف</Label>
                  <Input
                    type="number"
                    value={shippingPricing.beni_suef ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, beni_suef: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>المنيا</Label>
                  <Input
                    type="number"
                    value={shippingPricing.minya ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, minya: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>أسيوط</Label>
                  <Input
                    type="number"
                    value={shippingPricing.asyut ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, asyut: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>سوهاج</Label>
                  <Input
                    type="number"
                    value={shippingPricing.sohag ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, sohag: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>قنا</Label>
                  <Input
                    type="number"
                    value={shippingPricing.qena ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, qena: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الأقصر</Label>
                  <Input
                    type="number"
                    value={shippingPricing.luxor ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, luxor: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>أسوان</Label>
                  <Input
                    type="number"
                    value={shippingPricing.aswan ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, aswan: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>مطروح</Label>
                  <Input
                    type="number"
                    value={shippingPricing.matrouh ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, matrouh: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>شمال سيناء</Label>
                  <Input
                    type="number"
                    value={shippingPricing.north_sinai ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, north_sinai: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>جنوب سيناء</Label>
                  <Input
                    type="number"
                    value={shippingPricing.south_sinai ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, south_sinai: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>البحر الأحمر</Label>
                  <Input
                    type="number"
                    value={shippingPricing.red_sea ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, red_sea: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الوادي الجديد</Label>
                  <Input
                    type="number"
                    value={shippingPricing.new_valley ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, new_valley: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>باقي المحافظات</Label>
                  <Input
                    type="number"
                    value={shippingPricing.others ?? 0}
                    onChange={(e) => setShippingPricing({ ...shippingPricing, others: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={saveShippingPricing}>حفظ أسعار الشحن</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payment" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>طرق الدفع</CardTitle>
              <CardDescription>تكوين طرق الدفع المتاحة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">الدفع عند الاستلام</Label>
                    <p className="text-sm text-muted-foreground">السماح للعملاء بالدفع نقدًا عند استلام الطلب</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">بطاقات الائتمان</Label>
                    <p className="text-sm text-muted-foreground">السماح للعملاء بالدفع باستخدام بطاقات الائتمان</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">المحافظ الإلكترونية</Label>
                    <p className="text-sm text-muted-foreground">السماح للعملاء بالدفع باستخدام المحافظ الإلكترونية</p>
                  </div>
                  <Switch />
                </div>
              </div>
              <Button>حفظ التغييرات</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الإشعارات</CardTitle>
              <CardDescription>تكوين إشعارات البريد الإلكتروني والرسائل النصية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">إشعارات الطلبات الجديدة</Label>
                    <p className="text-sm text-muted-foreground">تلقي إشعار عند وصول طلب جديد</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">إشعارات المخزون المنخفض</Label>
                    <p className="text-sm text-muted-foreground">تلقي إشعار عندما ينخفض مخزون منتج عن حد معين</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">تأكيد الطلب للعملاء</Label>
                    <p className="text-sm text-muted-foreground">إرسال بريد إلكتروني تأكيد للعملاء عند إتمام الطلب</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">تحديثات حالة الطلب</Label>
                    <p className="text-sm text-muted-foreground">إرسال تحديثات للعملاء عند تغيير حالة الطلب</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">البريد الإلكتروني للإشعارات</Label>
                <Input id="admin-email" type="email" defaultValue="admin@anaqati.com" />
              </div>
              <Button>حفظ التغييرات</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Import Table components for the shipping tab
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"
