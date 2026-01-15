import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    // Simple password check - in a real app, use a secure authentication method
    if (password === "1234") {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, message: "كلمة المرور غير صحيحة" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء تسجيل الدخول" }, { status: 500 })
  }
}
