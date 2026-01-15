"use client"

import { useEffect } from "react"
import { useStore } from "@/lib/store"

export function AutoLogin() {
  const { isLoggedIn, user, rememberMe } = useStore()

  // تنفيذ تسجيل الدخول التلقائي عند تحميل الصفحة
  useEffect(() => {
    // إذا كان المستخدم قد اختار "تذكرني" وتم تخزين بيانات المستخدم
    // ولكن لم يتم تسجيل الدخول بعد، قم بتسجيل الدخول تلقائياً
    if (!isLoggedIn && user && rememberMe) {
      useStore.setState({ isLoggedIn: true })
    }
  }, [isLoggedIn, user, rememberMe])

  // هذا المكون لا يعرض أي شيء، فقط يقوم بتنفيذ الكود عند تحميل الصفحة
  return null
}
