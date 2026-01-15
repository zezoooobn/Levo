"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Heart, Menu, ShoppingCart, User, Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
 

export function SiteHeader() {
  const pathname = usePathname()
  const { getCartCount, isLoggedIn, language, user, notifications, markNotificationRead } = useStore()
  const cartCount = getCartCount()
  const [hasMounted, setHasMounted] = useState(false)

  const userNotifications = user ? notifications.filter((n) => n.userId === user.email) : []
  const unreadCount = userNotifications.filter((n) => !n.read).length

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const routes = [
    {
      href: "/",
      label: "الرئيسية",
      active: pathname === "/",
    },
    {
      href: "/products",
      label: "المنتجات",
      active: pathname === "/products",
    },
    {
      href: "/categories",
      label: "الفئات",
      active: pathname === "/categories",
    },
    {
      href: "/terms",
      label: "من نحن",
      active: pathname === "/terms",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden bg-transparent">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col gap-4 text-right">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-primary",
                    route.active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {route.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="mr-4 hidden md:flex">
          <Link href="/" className={cn("flex items-center space-x-2", language === "ar" ? "ml-10" : "mr-10")}>
            <div className="flex items-center">
              <img
                src="https://retail-orange-pgdgj5caab.edgeone.app/ChatGPT%20Image%20Jan%2013,%202026,%2008_02_32%20PM.png"
                alt={language === "en" ? "Levo" : "ليڤو"}
                className="h-7 w-auto block dark:hidden"
              />
              <img
                src="https://zeroth-emerald-cva4yerssm.edgeone.app/ChatGPT%20Image%20Jan%2013,%202026,%2008_02_28%20PM.png"
                alt={language === "en" ? "Levo" : "ليڤو"}
                className="h-7 w-auto hidden dark:block"
              />
              <span className="font-bold text-xl ml-2">{language === "en" ? "Levo" : "ليڤو"}</span>
            </div>
          </Link>
          <nav className="flex items-center space-x-6 space-x-reverse text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "transition-colors hover:text-primary",
                  route.active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon">
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                <span className="sr-only">المفضلة</span>
              </Link>
            </Button>

            {isLoggedIn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {hasMounted && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                    <span className="sr-only">الإشعارات</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>الإشعارات</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userNotifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">لا توجد إشعارات جديدة</div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto">
                      {userNotifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className={cn("flex flex-col items-start gap-1 p-3 cursor-pointer", !notification.read && "bg-muted/50")}
                          onClick={() => markNotificationRead(notification.id)}
                        >
                          <div className="flex w-full justify-between items-start">
                            <span className="font-medium text-sm">{notification.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.date).toLocaleDateString("ar-EG")}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button asChild variant="ghost" size="icon" className="relative">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">عربة التسوق</span>
                {hasMounted && cartCount > 0 && (
                  <span
                    className={cn(
                      "absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold flex items-center justify-center leading-none",
                      cartCount > 9 ? "h-5 px-1.5 rounded-full min-w-[20px]" : "h-5 w-5 rounded-full",
                    )}
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon">
              <Link href={isLoggedIn ? "/account" : "/auth/login"}>
                <User className="h-5 w-5" />
                <span className="sr-only">الحساب</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
