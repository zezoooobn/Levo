"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type AdminAuthContextType = {
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
})

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated
    if (typeof window !== "undefined") {
      const authStatus = localStorage.getItem("admin-auth")
      setIsAuthenticated(authStatus === "authenticated")
      setIsInitialized(true)
    }
  }, [])

  const login = (password: string) => {
    // Simple password check - in a real app, use a secure authentication method
    if (password === "1234") {
      setIsAuthenticated(true)
      localStorage.setItem("admin-auth", "authenticated")
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("admin-auth")
  }

  // Only render children after initialization to prevent hydration issues
  if (!isInitialized && typeof window !== "undefined") {
    return null
  }

  return <AdminAuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}
