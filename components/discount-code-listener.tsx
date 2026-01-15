"use client"

import { useEffect } from "react"
import { useStore } from "@/lib/store"

export function DiscountCodeListener() {
  const { subscribeToDiscountCodes } = useStore()

  useEffect(() => {
    // الاشتراك في تحديثات أكواد الخصم لجميع المستخدمين
    // هذا يضمن أن الأكواد المضافة من قبل المسؤول تظهر للعملاء فوراً
    const unsubscribe = subscribeToDiscountCodes()
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [subscribeToDiscountCodes])

  return null
}
