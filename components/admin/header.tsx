"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Bell } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

interface AdminHeaderProps {
  onLogout: () => void
}

export function AdminHeader({ onLogout }: AdminHeaderProps) {
  const { notifications, markNotificationRead } = useStore()
  const adminNotifications = notifications.filter((n) => n.userId === "admin")
  const unreadCount = adminNotifications.filter((n) => !n.read).length

  return (
    <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-800">لوحة تحكم متجر ليڤو</h1>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-gray-700 hover:bg-gray-100">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>الإشعارات</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {adminNotifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">لا توجد إشعارات جديدة</div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto">
                {adminNotifications.map((notification) => (
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

        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="flex items-center gap-2 text-gray-700 border-gray-300 hover:bg-gray-100"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </Button>
      </div>
    </header>
  )
}
