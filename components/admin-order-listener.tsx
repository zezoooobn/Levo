"use client"

import { useEffect } from "react"
import { useStore } from "@/lib/store"

export function AdminOrderListener() {
  const { subscribeToOrders, syncOrdersToFirestore, user } = useStore()

  useEffect(() => {
    const allowedEmail = "yazeedmohamed098@gmail.com"
    if (user?.email === allowedEmail) {
      const unsubscribe = subscribeToOrders()
      syncOrdersToFirestore()
      return () => {
        if (unsubscribe) unsubscribe()
      }
    }
  }, [subscribeToOrders, syncOrdersToFirestore, user])

  return null
}
