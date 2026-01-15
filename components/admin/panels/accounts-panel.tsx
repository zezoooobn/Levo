"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { User, Trash2, Edit, Eye } from "lucide-react"
import { useStore } from "@/lib/store"

type AdminUser = {
  id: string
  email: string
  full_name: string
  phone: string | null
  address: string | null
}

export function AccountsPanel() {
  const register = useStore((s) => s.register)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [editForm, setEditForm] = useState({ full_name: "", phone: "", address: "" })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "فشل جلب الحسابات")
      setUsers(data.users || [])
    } catch (e) {
      console.error("fetch users error", e)
      toast({ title: "خطأ", description: "تعذّر تحميل الحسابات" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("LOAD USERS ERROR:", err);
    }
    setLoading(false);
  }

  load();
}, []);


  const handleEditOpen = (u: AdminUser) => {
    setEditUser(u)
    setEditForm({ full_name: u.full_name || "", phone: u.phone || "", address: u.address || "" })
    setEditOpen(true)
  }

  const handleEditSave = async () => {
    if (!editUser) return
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editUser.id, ...editForm }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || "فشل التحديث")
      setUsers((prev) => prev.map((x) => (x.id === editUser.id ? { ...x, ...editForm } : x)))
      setEditOpen(false)
      toast({ title: "تم التحديث", description: `تم تحديث ${editUser.email}` })
    } catch (e) {
      console.error("update user error", e)
      toast({ title: "خطأ", description: "تعذّر تحديث الحساب" })
    }
  }

  const handleImpersonate = (u: AdminUser) => {
    const parts = (u.full_name || "").split(" ")
    const first = parts[0] || ""
    const last = parts.slice(1).join(" ") || ""
    register(
      {
        firstName: first,
        lastName: last,
        email: u.email,
        phone: u.phone || "",
        address: u.address || "",
      },
      "__ADMIN__",
      true,
    )
    toast({ title: "تفعيل حساب", description: `تم الدخول كـ ${u.email}` })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>الحسابات</CardTitle>
            <CardDescription>إدارة جميع حسابات العملاء</CardDescription>
          </div>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="بحث بالاسم أو البريد"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-64"
            />
            <Button variant="outline" onClick={fetchUsers} disabled={loading}>
              تحديث القائمة
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>العنوان</TableHead>
                  <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users
                  .filter((u) => {
                    if (!query.trim()) return true
                    const q = query.toLowerCase()
                    return (
                      (u.full_name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q)
                    )
                  })
                  .map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4" /> {u.full_name || "—"}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.phone || "—"}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{u.address || "—"}</TableCell>
                    <TableCell className="text-left">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => handleImpersonate(u)}>
                          <Eye className="mr-2 h-4 w-4" /> استخدام الحساب
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditOpen(u)}>
                          <Edit className="mr-2 h-4 w-4" /> تعديل
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(u)}>
                          <Trash2 className="mr-2 h-4 w-4" /> حذف
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      لا توجد حسابات حالياً
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل الحساب</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm">الاسم الكامل</label>
              <Input value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">رقم الهاتف</label>
              <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">العنوان</label>
              <Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditOpen(false)}>إلغاء</Button>
              <Button onClick={handleEditSave}>حفظ</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}