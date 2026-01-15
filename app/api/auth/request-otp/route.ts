import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { setOtp } from "@/lib/dev-otp-memory"

// ذاكرة مؤقتة لاستخدامها في وضع التطوير عند غياب قاعدة البيانات
// تُخزن أكواد OTP لكل بريد إلكتروني مؤقتًا داخل عملية الخادم
const memoryOtps = new Map<string, { code: string; expiresAt: number; used: boolean; purpose: string }>()

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = (body?.email || "").trim().toLowerCase()
    const purpose = (body?.purpose || "login") as "login" | "register"

    if (!email) {
      return NextResponse.json({ error: "البريد الإلكتروني مطلوب" }, { status: 400 })
    }

    const DATABASE_URL = process.env.DATABASE_URL
    const hasDb = Boolean(DATABASE_URL)
    let sql: any = null
    if (hasDb) {
      try {
        sql = neon(DATABASE_URL!)
      } catch (initErr) {
        console.warn("[otp] Neon init failed, will use memory fallback:", initErr)
        sql = null
      }
    }
    // حاول إنشاء الجدول لكن لا تفشل إذا حدث خطأ
    if (hasDb && sql) {
      try {
        await sql(
          `CREATE TABLE IF NOT EXISTS email_otps (
            email TEXT NOT NULL,
            code TEXT NOT NULL,
            purpose TEXT NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL,
            used BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
          )`
        )
      } catch (tblErr) {
        console.warn("[otp] create table failed, continuing with memory:", tblErr)
      }
    }

    const code = generateOtp()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 دقائق

    if (hasDb && sql) {
      try {
        // احذف الأكواد السابقة غير المستخدمة لنفس البريد لنُبقي آخر كود فقط
        await sql(`DELETE FROM email_otps WHERE email = $1 AND used = FALSE`, [email])

        await sql(
          `INSERT INTO email_otps (email, code, purpose, expires_at, used)
           VALUES ($1, $2, $3, $4, FALSE)`,
          [email, code, purpose, expiresAt.toISOString()]
        )
      } catch (dbErr) {
        console.warn("[otp] DB insert failed, using memory fallback:", dbErr)
        setOtp(email, { code, expiresAt: expiresAt.getTime(), used: false, purpose })
      }
    } else {
      // تخزين مؤقت في الذاكرة أثناء التطوير
      setOtp(email, { code, expiresAt: expiresAt.getTime(), used: false, purpose })
    }

    // إرسال البريد باستخدام Resend إذا كان المفتاح متوفراً
    const resendKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.MAIL_FROM || "no-reply@example.com"
    if (resendKey) {
      try {
        const { Resend } = await import("resend")
        const resend = new Resend(resendKey)
        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: "رمز التحقق للدخول",
          text: `رمز التحقق الخاص بك هو: ${code}\nسينتهي خلال 5 دقائق.`,
        })
      } catch (mailErr) {
        console.error("[otp] Mail send failed:", mailErr)
        // نواصل دون فشل كامل
      }
    } else {
      console.log(`[otp] Dev mode: OTP for ${email} is ${code}`)
    }

    return NextResponse.json({ success: true, message: "تم إرسال رمز التحقق إلى بريدك" })
  } catch (err) {
    console.error("[otp] request error:", err)
    return NextResponse.json({ error: "حدث خطأ أثناء إنشاء رمز التحقق" }, { status: 500 })
  }
}