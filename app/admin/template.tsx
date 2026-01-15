"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AdminDashboard } from "@/components/admin/dashboard"
import { AdminLogin } from "@/components/admin/login"
import { useStore } from "@/lib/store"
import { AdminHeader } from "@/components/admin/header"
import { Toaster } from "@/components/ui/toaster"

export default function AdminTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { adminUser, logout } = useStore()

  useEffect(() => {
    // التحقق من حالة تسجيل الدخول
    if (adminUser) {
      setIsLoggedIn(true)
    }
    setIsLoading(false)
  }, [adminUser])

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    logout()
    setIsLoggedIn(false)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">جاري التحميل...</div>
  }

  return (
    <>
      <AdminHeader isLoggedIn={isLoggedIn} />
      {isLoggedIn ? <AdminDashboard onLogout={handleLogout} /> : <AdminLogin onLogin={handleLogin} />}
      <Toaster />
      <div className="hidden">{children}</div>

      {/* إضافة تذييل الصفحة خارج المحتوى الرئيسي */}
      {isLoggedIn && (
        <footer className="bg-black text-white py-8 border-t border-gray-800 mt-auto">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4">أناقتي</h3>
                <p className="text-sm">متجرك المفضل للملابس العصرية والأنيقة</p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">تسوق</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-sm hover:text-primary">
                      جميع المنتجات
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm hover:text-primary">
                      العروض الخاصة
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm hover:text-primary">
                      المنتجات الجديدة
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">المساعدة</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/complaints" className="text-sm hover:text-primary">
                      الشكاوي
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm hover:text-primary">
                      الأسئلة الشائعة
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm hover:text-primary">
                      سياسة الإرجاع
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">معلومات</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/terms" className="text-sm hover:text-primary">
                      الشروط والأحكام
                    </a>
                  </li>
                  <li>
                    <a href="/privacy" className="text-sm hover:text-primary">
                      سياسة الخصوصية
                    </a>
                  </li>
                  <li>
                    <a href="/about" className="text-sm hover:text-primary">
                      من نحن
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-center">
              <p className="text-sm">&copy; {new Date().getFullYear()} أناقتي. جميع الحقوق محفوظة.</p>
            </div>
          </div>
        </footer>
      )}
    </>
  )
}
