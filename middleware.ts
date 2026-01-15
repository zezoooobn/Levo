import { NextResponse, type NextRequest } from "next/server"

// تعطيل أي اعتماد على Supabase في الوسيط
export async function middleware(request: NextRequest) {
  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    /*
     * مطابقة جميع مسارات الطلبات باستثناء التي تبدأ بـ:
     * - _next/static (الملفات الثابتة)
     * - _next/image (ملفات تحسين الصور)
     * - favicon.ico (ملف الأيقونة)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
