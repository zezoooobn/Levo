"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { useStore } from "@/lib/store"
import { signInWithGoogle, getGoogleRedirectUser } from "@/lib/firebase/client"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams?.get("redirect") || "/"
  const login = useStore((state) => state.login)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMeState] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState("")

  useEffect(() => {
    ;(async () => {
      const user = await getGoogleRedirectUser()
      if (user) {
        useStore.getState().loginWithGoogle(user)
        router.push(redirectPath as string)
      }
    })()
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!email) newErrors.email = "البريد الإلكتروني مطلوب"
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "البريد الإلكتروني غير صالح"

    if (!password) newErrors.password = "كلمة المرور مطلوبة"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/login-simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("[v0] Login error:", data.error)
        setErrors({
          login: data.error || "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        })
        setIsSubmitting(false)
        return
      }

      console.log("[v0] Password verified, sending OTP")

      // بعد التحقق من كلمة المرور أرسل رمز تحقق للبريد
      const otpRes = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "login" }),
      })
      const otpData = await otpRes.json()
      if (!otpRes.ok) {
        setErrors({ login: otpData.error || "تعذّر إرسال رمز التحقق" })
        setIsSubmitting(false)
        return
      }

      setOtpSent(true)
      toast({ title: "أرسلنا رمز تحقق", description: "أدخل الرمز المرسل إلى بريدك" })
    } catch (error) {
      console.error("[v0] Unexpected login error:", error)
      setErrors({
        login: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({ title: "رمز غير صالح", description: "أدخل رمزاً من 6 أرقام" })
      return
    }
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrors({ login: data.error || "الرمز غير صحيح أو منتهي" })
        return
      }

      login(email, password, rememberMe)
      toast({ title: "تم التحقق بنجاح", description: "مرحباً بك!" })
      router.push(redirectPath as string)
    } catch (err) {
      console.error("[v0] verify otp error:", err)
      setErrors({ login: "حدث خطأ غير متوقع" })
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle()
      if (user) {
        useStore.getState().loginWithGoogle(user)
        router.push(redirectPath as string)
      }
    } catch (e) {
      toast({ title: "تعذّر تسجيل الدخول عبر جوجل", description: "حاول مرة أخرى" })
    }
  }

  return (
    <div className="container px-4 md:px-6 py-6 md:py-10">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
            <CardDescription>أدخل بياناتك لتسجيل الدخول إلى حسابك</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.login && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">{errors.login}</div>}

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                    نسيت كلمة المرور؟
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="******"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMeState(checked as boolean)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="remember" className="text-sm font-normal">
                  تذكرني
                </Label>
              </div>

              {!otpSent ? (
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
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
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2" onClick={handleGoogleLogin}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.1 32.6 29 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.9 0 19.9-8.9 19.9-19.9 0-1.3-.1-2.2-.3-3.6z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.4 16.2 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.6 6.1 29.6 4 24 4 16.4 4 9.8 8.1 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.4 0 10.4-2.1 14.1-5.5l-6.5-5.3c-2.1 1.5-4.8 2.4-7.6 2.4-5 0-9.2-3.4-10.7-8l-6.6 5.1C9.8 39.9 16.4 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-5.7 8-11.3 8-5 0-9.2-3.4-10.7-8l-6.6 5.1C9.8 39.9 16.4 44 24 44c10.9 0 19.9-8.9 19.9-19.9 0-1.3-.1-2.2-.3-3.6z"/>
              </svg>
              تسجيل الدخول عبر جوجل
            </Button>
            <div className="text-center text-sm">
              ليس لديك حساب؟{" "}
              <Link
                prefetch={false}
                href={`/auth/register${redirectPath !== "/account" ? `?redirect=${encodeURIComponent(redirectPath as string)}` : ""}`}
                className="text-primary hover:underline"
              >
                إنشاء حساب جديد
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
