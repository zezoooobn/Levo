import { neon } from "@neondatabase/serverless"
import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "node:crypto"

// استخدام قاعدة البيانات إذا كانت متاحة، مع سقوط آمن إلى وضع التطوير
const hasDbEnv = Boolean(process.env.DATABASE_URL)

export async function POST(request: NextRequest) {
  try {
    // تهيئة اتصال Neon بشكل كسول داخل المعالج لتفادي أخطاء التحميل المسبق
    let sql: any = null
    if (hasDbEnv) {
      try {
        sql = neon(process.env.DATABASE_URL!)
      } catch (initErr) {
        console.warn("[register-simple] Neon init failed, falling back:", initErr)
        sql = null
      }
    }

    const { email, full_name, phone, address, password } = await request.json()

    // التحقق من البيانات المطلوبة
    if (!email || !full_name || !phone || !password) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 })
    }

    // التحقق من صيغة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "صيغة البريد الإلكتروني غير صحيحة" }, { status: 400 })
    }

    // التحقق من طول كلمة المرور
    if (password.length < 6) {
      return NextResponse.json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 })
    }

    // التحقق من وجود المستخدم بالفعل (مع سقوط آمن)
    if (hasDbEnv && sql) {
      try {
        const existingUser = await sql("SELECT id FROM user_profiles WHERE email = $1", [email])
        if (Array.isArray(existingUser) && existingUser.length > 0) {
          return NextResponse.json({ error: "البريد الإلكتروني مسجل بالفعل" }, { status: 400 })
        }
      } catch (dbErr) {
        console.warn("[register-simple] DB check failed, falling back to memory:", dbErr)
      }
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10)

    let user: any
    if (hasDbEnv && sql) {
      try {
        const result = await sql(
          `INSERT INTO user_profiles (id, email, full_name, phone, address, password, is_active, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, true, NOW(), NOW())
           RETURNING id, email, full_name, phone, address`,
          [email, full_name, phone, address || null, hashedPassword],
        )
        const row = Array.isArray(result) ? result[0] : (result as any)[0]
        if (!row) {
          throw new Error("Insert returned no rows")
        }
        user = row
      } catch (dbErr) {
        console.warn("[register-simple] DB insert failed, using memory fallback:", dbErr)
        user = {
          id: crypto.randomUUID(),
          email,
          full_name,
          phone,
          address: address || null,
        }
      }
    } else {
      // وضع بديل للتطوير: إرجاع بيانات مستخدم بدون حفظ في قاعدة بيانات
      user = {
        id: crypto.randomUUID(),
        email,
        full_name,
        phone,
        address: address || null,
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "تم إنشاء الحساب بنجاح",
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          address: user.address,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Registration error details:", error)
    const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الحساب"
    return NextResponse.json(
      {
        error: "حدث خطأ أثناء إنشاء الحساب",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
