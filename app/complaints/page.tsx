"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, CheckCircle, LogIn } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useStore } from "@/lib/store"
import Link from "next/link"

const complaintTypes = [
  { value: "website-malfunction", label: "عطل في الموقع" },
  { value: "order-not-received", label: "الطلب لم يصل" },
  { value: "payment-error", label: "خطأ في الدفع" },
  { value: "wrong-order", label: "طلب خاطئ" },
  { value: "damaged-product", label: "منتج تالف" },
  { value: "delivery-delay", label: "تأخير في التوصيل" },
  { value: "customer-service", label: "خدمة العملاء" },
  { value: "refund-issue", label: "مشكلة في الاسترداد" },
  { value: "other", label: "أخرى" },
]

export default function ComplaintsPage() {
  const { user, isLoggedIn } = useStore()
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState("")
  const [description, setDescription] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/")
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
      return isValidType && isValidSize
    })

    if (images.length + validFiles.length > 2) {
      toast({
        title: "خطأ",
        description: "يمكنك رفع صورتين كحد أقصى",
        variant: "destructive",
      })
      return
    }
    setImages([...images, ...validFiles.slice(0, 2 - images.length)])
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLoggedIn || !user) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً لإرسال شكوى",
        variant: "destructive",
      })
      return
    }

    if (!selectedType || !description.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      console.log("[v0] Submitting complaint:", {
        selectedType,
        description,
        imageCount: images.length,
        userEmail: user.email,
      })

      const formData = new FormData()
      formData.append("complaintType", selectedType)
      formData.append("description", description.trim())
      formData.append("userEmail", user.email)
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ")
      if (fullName) formData.append("userName", fullName)

      images.forEach((image, index) => {
        formData.append(`image${index}`, image)
      })

      const response = await fetch("/api/complaints", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      console.log("[v0] API Response:", result)

      if (response.ok && result.success) {
        console.log("[v0] Complaint submitted successfully with ID:", result.data?.id)
        setShowSuccess(true)

        setTimeout(() => {
          setSelectedType("")
          setDescription("")
          setImages([])
          setShowSuccess(false)
        }, 3000)
      } else {
        console.error("[v0] API Error:", result.error)
        throw new Error(result.error || "فشل في إرسال الشكوى")
      }
    } catch (error) {
      console.error("[v0] Submit error:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الشكوى. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">جاري التحميل...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <LogIn className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <CardTitle className="text-2xl font-bold">تسجيل الدخول مطلوب</CardTitle>
            <CardDescription>يجب تسجيل الدخول أولاً لتتمكن من إرسال شكوى</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">نحتاج لتسجيل دخولك لضمان متابعة شكواك والرد عليك بشكل مناسب</p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link href="/auth/login?redirect=/complaints">تسجيل الدخول</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/register?redirect=/complaints">إنشاء حساب جديد</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl relative">
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 animate-in zoom-in-50 duration-500 delay-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">تم إرسال شكواك بنجاح</h3>
            <p className="text-gray-600">سيكون الرد عليك خلال 48 ساعة</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">تقديم شكوى</CardTitle>
          <CardDescription>
            مرحباً {user.email}، نحن نهتم بآرائكم وملاحظاتكم. يرجى ملء النموذج أدناه لتقديم شكواكم
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">نوع الشكوى *</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full text-right">
                  <SelectValue placeholder="اختر نوع الشكوى" />
                </SelectTrigger>
                <SelectContent>
                  {complaintTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">تفاصيل الشكوى *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="يرجى وصف المشكلة بالتفصيل..."
                className="min-h-[120px] text-right"
                required
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">إرفاق صور (اختياري - حد أقصى صورتين)</Label>

              {images.length < 2 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500">اختر الصور</span>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </Label>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF حتى 10MB</p>
                </div>
              )}

              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image) || "/placeholder.svg"}
                        alt={`صورة ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || !selectedType || !description.trim()}>
              {isSubmitting ? "جاري الإرسال..." : "إرسال الشكوى"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
