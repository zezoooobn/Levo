"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LockKeyhole } from "lucide-react"

interface AdminLoginProps {
  onLogin: (password: string) => boolean
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) {
      setError("الرجاء إدخال كلمة المرور")
      return
    }

    const success = onLogin(password)
    if (!success) {
      setError("كلمة المرور غير صحيحة")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gray-800">لوحة تحكم المسؤول</CardTitle>
          <CardDescription className="text-gray-600">الرجاء تسجيل الدخول للوصول إلى لوحة التحكم</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                كلمة المرور
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 border-gray-300"
                  placeholder="أدخل كلمة المرور"
                />
                <LockKeyhole className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">
              تسجيل الدخول
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-600">هذه المنطقة مخصصة للمسؤولين فقط</CardFooter>
      </Card>
    </div>
  )
}
