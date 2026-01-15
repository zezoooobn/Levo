"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Trash2, Edit, Plus, Ticket } from "lucide-react"
import { useStore, DiscountCode } from "@/lib/store"
import { Badge } from "@/components/ui/badge"

export function DiscountCodesPanel() {
  const discountCodes = useStore((state) => state.discountCodes)
  const addDiscountCode = useStore((state) => state.addDiscountCode)
  const removeDiscountCode = useStore((state) => state.removeDiscountCode)
  const updateDiscountCode = useStore((state) => state.updateDiscountCode)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null)

  const [formData, setFormData] = useState<Partial<DiscountCode>>({
    code: "",
    discountType: "percentage",
    discountValue: 0,
    active: true,
    minOrderValue: 0,
    maxUses: 0,
  })

  const resetForm = () => {
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: 0,
      active: true,
      minOrderValue: 0,
      maxUses: 0,
      expiryDate: undefined,
    })
    setEditingCode(null)
  }

  const handleOpenDialog = (code?: DiscountCode) => {
    if (code) {
      setEditingCode(code)
      setFormData(code)
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!formData.code || !formData.discountValue) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    if (editingCode) {
      updateDiscountCode(editingCode.id, formData)
      toast({ title: "تم التحديث", description: "تم تحديث كود الخصم بنجاح" })
    } else {
      addDiscountCode(formData as any)
      toast({ title: "تم الإضافة", description: "تم إضافة كود الخصم بنجاح" })
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الكود؟")) {
      removeDiscountCode(id)
      toast({ title: "تم الحذف", description: "تم حذف كود الخصم بنجاح" })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-gray-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>أكواد الخصم</CardTitle>
            <CardDescription className="text-gray-400">إدارة كوبونات الخصم والعروض</CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
            <Plus className="ml-2 h-4 w-4" /> إضافة كود جديد
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-white/5">
                <TableHead className="text-gray-400">الكود</TableHead>
                <TableHead className="text-gray-400">النوع</TableHead>
                <TableHead className="text-gray-400">القيمة</TableHead>
                <TableHead className="text-gray-400">الاستخدامات</TableHead>
                <TableHead className="text-gray-400">الحالة</TableHead>
                <TableHead className="text-gray-400 text-left">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discountCodes.length > 0 ? (
                discountCodes.map((code) => (
                  <TableRow key={code.id} className="border-gray-800 hover:bg-white/5">
                    <TableCell className="font-mono font-bold text-primary">{code.code}</TableCell>
                    <TableCell>
                      {code.discountType === "percentage" ? "نسبة مئوية" : "شحن مجاني/ثابت"}
                    </TableCell>
                    <TableCell>
                      {code.discountType === "percentage" ? `%${code.discountValue}` : `${code.discountValue} ج.م`}
                    </TableCell>
                    <TableCell>
                      {code.currentUses} / {code.maxUses || "∞"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={code.active ? "default" : "secondary"}>
                        {code.active ? "نشط" : "غير نشط"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(code)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(code.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    لا توجد أكواد خصم حالياً
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCode ? "تعديل كود الخصم" : "إضافة كود خصم جديد"}</DialogTitle>
            <DialogDescription>
              قم بإدخال تفاصيل كود الخصم أدناه.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">الكود</Label>
              <Input
                id="code"
                placeholder="مثال: SUMMER2024"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>نوع الخصم</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(val: any) => setFormData({ ...formData, discountType: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                    <SelectItem value="shipping">مبلغ ثابت / شحن</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>قيمة الخصم</Label>
                <Input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>الحد الأقصى للاستخدام</Label>
                <Input
                  type="number"
                  placeholder="0 = غير محدود"
                  value={formData.maxUses || ""}
                  onChange={(e) => setFormData({ ...formData, maxUses: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label>أقل قيمة للطلب</Label>
                <Input
                  type="number"
                  value={formData.minOrderValue || ""}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>تاريخ الانتهاء (اختياري)</Label>
              <Input
                type="date"
                value={formData.expiryDate ? new Date(formData.expiryDate).toISOString().split('T')[0] : ""}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit}>{editingCode ? "تحديث" : "إضافة"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
