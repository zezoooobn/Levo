import { neon } from "@neondatabase/serverless"
import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

const hasDbEnv = Boolean(process.env.DATABASE_URL)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // التحقق من البيانات المطلوبة
    if (!email || !password) {
      return NextResponse.json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" }, { status: 400 })
    }

    if (!hasDbEnv) {
        console.warn("[login-simple] Missing DATABASE_URL")
        return NextResponse.json({ error: "خطأ في الاتصال بقاعدة البيانات" }, { status: 500 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    // البحث عن المستخدم
    const users = await sql(
      "SELECT id, email, full_name, phone, address, password FROM user_profiles WHERE email = $1",
      [email],
    )

    if (users.length === 0) {
      return NextResponse.json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }, { status: 401 })
    }

    const user = users[0]

    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }, { status: 401 })
    }

    // تحديث آخر تسجيل دخول
    await sql("UPDATE user_profiles SET last_login = NOW() WHERE id = $1", [user.id])

    return NextResponse.json(
      {
        success: true,
        message: "تم تسجيل الدخول بنجاح",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.full_name?.split(" ")[0] || "",
          lastName: user.full_name?.split(" ").slice(1).join(" ") || "",
          phone: user.phone,
          address: user.address,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء تسجيل الدخول" }, { status: 500 })
  }
}
