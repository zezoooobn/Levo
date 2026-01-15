"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, ImageIcon } from "lucide-react"

export function CategoriesPanel() {
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)

  // Mock categories data
  const categories = [
    {
      id: 1,
      name: "رجالي",
      slug: "men",
      description: "ملابس وإكسسوارات رجالية",
      productsCount: 120,
    },
    {
      id: 2,
      name: "نسائي",
      slug: "women",
      description: "ملابس وإكسسوارات نسائية",
      productsCount: 150,
    },
    {
      id: 3,
      name: "أطفال",
      slug: "kids",
      description: "ملابس وإكسسوارات للأطفال",
      productsCount: 80,
    },
    {
      id: 4,
      name: "إكسسوارات",
      slug: "accessories",
      description: "إكسسوارات متنوعة",
      productsCount: 50,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة الفئات</h2>
          <p className="text-muted-foreground">إضافة وتعديل وحذف فئات المنتجات</p>
        </div>
        <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة فئة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>إضافة فئة جديدة</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">اسم الفئة</Label>
                <Input id="category-name" placeholder="أدخل اسم الفئة" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-slug">الاسم المختصر (slug)</Label>
                <Input id="category-slug" placeholder="مثال: men, women, kids" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-description">وصف الفئة</Label>
                <Textarea id="category-description" placeholder="أدخل وصف الفئة" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>صورة الفئة</Label>
                <div className="flex h-32 cursor-pointer items-center justify-center rounded-md border border-dashed border-gray-300 hover:border-primary">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={() => setIsAddCategoryOpen(false)}>حفظ الفئة</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="البحث عن فئة..." className="pl-9" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">الرقم</TableHead>
              <TableHead>اسم الفئة</TableHead>
              <TableHead>الاسم المختصر</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>عدد المنتجات</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>{category.productsCount}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
