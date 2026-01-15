import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getOtp, markUsed } from "@/lib/dev-otp-memory"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = (body?.email || "").trim().toLowerCase()
    const code = (body?.code || "").trim()

    if (!email || !code) {
      return NextResponse.json({ error: "البريد الإلكتروني والرمز مطلوبان" }, { status: 400 })
    }

    // وضع التطوير: إن لم يكن هناك مفتاح بريد، اسمح برمز ثابت 000000
    const devBypassActive = !process.env.RESEND_API_KEY && process.env.NODE_ENV !== "production"
    if (devBypassActive && code === "000000") {
      try {
        // علّم الكود كمستخدم في الذاكرة إن وجد
        markUsed(email)
      } catch {}
      return NextResponse.json({ success: true })
    }

    const DATABASE_URL = process.env.DATABASE_URL
    const hasDb = Boolean(DATABASE_URL)
    let sql: any = null
    if (hasDb) {
      try {
        sql = neon(DATABASE_URL!)
      } catch (initErr) {
        console.warn("[verify-otp] Neon init failed, will use memory fallback:", initErr)
        sql = null
      }
    }

    let latest: any = null
    if (hasDb && sql) {
      try {
        // اجلب أحدث رمز غير مستخدم لهذا البريد
        const rows = await sql(
          `SELECT code, expires_at, used FROM email_otps
           WHERE email = $1 AND used = FALSE
           ORDER BY created_at DESC
           LIMIT 1`,
          [email]
        )
        latest = Array.isArray(rows) ? rows[0] : (rows as any)[0]
      } catch (dbErr) {
        console.warn("[verify-otp] DB fetch failed, trying memory fallback:", dbErr)
      }
    }
    if (!latest) {
      const item = getOtp(email)
      if (item && !item.used) {
        latest = { code: item.code, expires_at: new Date(item.expiresAt).toISOString(), used: item.used }
      }
    }
    if (!latest) {
      return NextResponse.json({ error: "لا يوجد رمز صالح لهذا البريد" }, { status: 400 })
    }

    const expiresAt = new Date(latest.expires_at)
    if (latest.code !== code) {
      return NextResponse.json({ error: "الرمز غير صحيح" }, { status: 400 })
    }

    if (Date.now() > expiresAt.getTime()) {
      return NextResponse.json({ error: "انتهت صلاحية الرمز" }, { status: 400 })
    }

    if (hasDb && sql) {
      try {
        await sql(`UPDATE email_otps SET used = TRUE WHERE email = $1 AND code = $2`, [email, code])
      } catch (dbErr) {
        console.warn("[verify-otp] DB update failed, marking memory used:", dbErr)
        markUsed(email)
      }
    } else {
      markUsed(email)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[otp] verify error:", err)
    return NextResponse.json({ error: "حدث خطأ أثناء التحقق من الرمز" }, { status: 500 })
  }
}