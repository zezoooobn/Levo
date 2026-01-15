"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { LocationPicker } from "@/components/location-picker"
import { useStore } from "@/lib/store"

export default function RegisterPage() {
  const router = useRouter()
  const registerUser = useStore((state) => state.register)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLocationSelected = (address: string) => {
    setFormData((prev) => ({
      ...prev,
      address,
    }))
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setIsSubmitting(true)

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "خطأ في التسجيل",
        description: "كلمات المرور غير متطابقة",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "خطأ في التسجيل",
        description: "يرجى إدخال بريد إلكتروني صحيح",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "خطأ في التسجيل",
        description: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register-simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          full_name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          address: formData.address,
          password: formData.password,
        }),
      })
      // Parse response safely: handle non-JSON error pages
      let data: any = null
      const isJson = response.headers.get("content-type")?.includes("application/json")
      try {
        data = isJson ? await response.json() : await response.text()
      } catch (parseErr) {
        console.error("[v0] registration parse error:", parseErr)
      }

      if (!response.ok) {
        const message = typeof data === "string" ? data : data?.error || "حدث خطأ أثناء التسجيل"
        toast({ title: "خطأ في التسجيل", description: message, variant: "destructive" })
        setIsSubmitting(false)
        return
      }
      // أرسل رمز تحقق إلى البريد الإلكتروني بعد إنشاء الحساب
      const otpRes = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, purpose: "register" }),
      })
      // Safe parse for OTP as well
      let otpData: any = null
      const otpIsJson = otpRes.headers.get("content-type")?.includes("application/json")
      try {
        otpData = otpIsJson ? await otpRes.json() : await otpRes.text()
      } catch (parseErr) {
        console.error("[v0] otp parse error:", parseErr)
      }
      if (!otpRes.ok) {
        const msg = typeof otpData === "string" ? otpData : otpData?.error || "حاول مرة أخرى"
        toast({ title: "تعذّر إرسال رمز التحقق", description: msg })
        setIsSubmitting(false)
        return
      }

      setOtpSent(true)
      toast({ title: "تم إرسال رمز التحقق", description: "تحقق من بريدك وأدخل الرمز أدناه" })
      console.log("[v0] User registered successfully, OTP sent")
    } catch (error) {
      console.error("[v0] Registration error:", error)
      toast({
        title: "خطأ في التسجيل",
        description: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({ title: "رمز غير صالح", description: "أدخل رمزاً مكوناً من 6 أرقام" })
      return
    }

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code: otpCode }),
      })
      const ct = res.headers.get("content-type") || ""
      let data: any = {}
      if (ct.includes("application/json")) {
        try {
          data = await res.json()
        } catch {
          const txt = await res.text()
          data = { error: txt }
        }
      } else {
        const txt = await res.text()
        data = { error: txt }
      }
      if (!res.ok) {
        toast({ title: "فشل التحقق", description: data.error || "تحقق من الرمز وحاول ثانية", variant: "destructive" })
        return
      }

      // تسجيل المستخدم محلياً بعد التحقق
      registerUser(
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        },
        formData.password,
        false,
      )

      toast({ title: "تم التحقق بنجاح", description: "أهلاً بك!" })
      router.push("/")
    } catch (err) {
      console.error("[v0] verify otp error:", err)
      toast({ title: "خطأ غير متوقع", description: "حاول مرة أخرى", variant: "destructive" })
    }
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">إنشاء حساب جديد</h1>
        <p className="text-muted-foreground mt-2">أنشئ حسابك للاستمتاع بتجربة تسوق مميزة</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">الاسم الأول</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              autoComplete="given-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">اسم العائلة</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">رقم الهاتف</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
            autoComplete="tel"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="address">العنوان</Label>
            <LocationPicker onLocationSelected={handleLocationSelected} />
          </div>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            autoComplete="street-address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">كلمة المرور</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="terms"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            required
          />
          <label htmlFor="terms" className="mr-2 text-sm">
            أوافق على{" "}
            <Link href="/terms" className="text-primary hover:underline">
              الشروط والأحكام
            </Link>{" "}
            و{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              سياسة الخصوصية
            </Link>
          </label>
        </div>

        {!otpSent ? (
          <Button type="submit" className="w-full" disabled={isSubmitting} onClick={() => handleSubmit()}>
            {isSubmitting ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
          </Button>
        ) : (
          <div className="space-y-3">
            <Label htmlFor="otp">أدخل رمز التحقق المرسل إلى بريدك</Label>
            <Input
              id="otp"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
            />
            <Button type="button" className="w-full" onClick={handleVerifyOtp}>
              تأكيد الرمز والدخول
            </Button>
          </div>
        )}

        <div className="text-center text-sm">
          لديك حساب بالفعل؟{" "}
          <Link prefetch={false} href="/auth/login" className="text-primary hover:underline">
            تسجيل الدخول
          </Link>
        </div>
      </form>
    </div>
  )
}
