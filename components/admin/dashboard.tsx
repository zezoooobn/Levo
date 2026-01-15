"use client"

import { useState } from "react"
import { AdminSidebar } from "./sidebar"
import { StatsPanel } from "./panels/stats-panel"
import { ProductsPanel } from "./panels/products-panel"
import { OrdersPanel } from "./panels/orders-panel"
import { CategoriesPanel } from "./panels/categories-panel"
import { SettingsPanel } from "./panels/settings-panel"
import { ComplaintsPanel } from "./panels/complaints-panel"
import { DiscountCodesPanel } from "./panels/discount-codes-panel"

interface AdminDashboardProps {
  onLogout: () => void
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activePanel, setActivePanel] = useState("stats")

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activePanel={activePanel} setActivePanel={setActivePanel} />
      <main className="flex-1 p-8 pb-32">
        {activePanel === "stats" && <StatsPanel />}
        {activePanel === "products" && <ProductsPanel />}
        {activePanel === "orders" && <OrdersPanel />}
        {activePanel === "categories" && <CategoriesPanel />}
        {activePanel === "discounts" && <DiscountCodesPanel />}
        {activePanel === "complaints" && <ComplaintsPanel />}
        {activePanel === "settings" && <SettingsPanel onLogout={onLogout} />}
      </main>
    </div>
  )
}
