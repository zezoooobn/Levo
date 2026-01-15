"use client"

import Link from "next/link"
import { LayoutDashboard, ShoppingBag, Package, FolderTree, Settings, ShoppingCart, AlertCircle, Ticket } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminSidebarProps {
  activePanel: string
  setActivePanel: (panel: any) => void
}

export function AdminSidebar({ activePanel, setActivePanel }: AdminSidebarProps) {
  const menuItems = [
    {
      id: "stats",
      label: "الإحصائيات",
      icon: <LayoutDashboard className="h-5 w-5 text-primary" />,
    },
    {
      id: "products",
      label: "المنتجات",
      icon: <ShoppingBag className="h-5 w-5 text-primary" />,
    },
    {
      id: "orders",
      label: "الطلبات",
      icon: <Package className="h-5 w-5 text-primary" />,
    },
    {
      id: "categories",
      label: "الفئات",
      icon: <FolderTree className="h-5 w-5 text-primary" />,
    },
    {
      id: "discounts",
      label: "أكواد الخصم",
      icon: <Ticket className="h-5 w-5 text-primary" />,
    },
    {
      id: "complaints",
      label: "الشكاوي",
      icon: <AlertCircle className="h-5 w-5 text-primary" />,
    },
    {
      id: "settings",
      label: "الإعدادات",
      icon: <Settings className="h-5 w-5 text-primary" />,
    },
  ]

  return (
    <aside className="w-72 bg-white border-l min-h-screen">
      <div className="p-6 border-b">
        <Link href="/" className="flex items-center gap-3">
          <ShoppingCart className="h-7 w-7 text-primary" />
          <span className="font-bold text-2xl text-gray-800">ليڤو</span>
        </Link>
      </div>
      <nav className="p-4">
        <ul className="space-y-3">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActivePanel(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-md text-base font-medium transition-colors",
                  activePanel === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100 hover:text-primary",
                )}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
