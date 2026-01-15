 "use client"
 
 import { useStore } from "@/lib/store"
 import { AdminDashboard } from "@/components/admin/dashboard"
 import Link from "next/link"
 import { Button } from "@/components/ui/button"
 
 export default function AdminPage() {
   const { user, isLoggedIn } = useStore()
   const allowedEmail = "yazeedmohamed098@gmail.com"
   const authorized = isLoggedIn && user?.email === allowedEmail
 
   if (!authorized) {
     return (
       <div className="flex min-h-screen items-center justify-center px-4">
         <div className="max-w-md text-center space-y-4">
           <h1 className="text-2xl font-bold">غير مصرح بالدخول</h1>
           <p className="text-muted-foreground">هذه الصفحة للمسؤول فقط.</p>
           <div className="flex justify-center">
             <Button asChild>
               <Link href="/auth/login">تسجيل الدخول</Link>
             </Button>
           </div>
         </div>
       </div>
     )
   }
 
   return <AdminDashboard onLogout={() => {}} />
 }
