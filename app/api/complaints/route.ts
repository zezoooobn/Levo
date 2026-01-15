import { type NextRequest, NextResponse } from "next/server"
import { listComplaintsByUser, createComplaint } from "@/lib/dev-complaints-memory"
import { adminDb, serverTimestamp } from "@/lib/firebase/admin"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const complaintType = (formData.get("complaintType") as string) || "other"
    const userEmail = (formData.get("userEmail") as string) || ""
    const userName = (formData.get("userName") as string) || ""
    const description = (formData.get("description") as string) || ""

    if (!userEmail) {
      return NextResponse.json({ error: "يجب تسجيل الدخول لإرسال شكوى" }, { status: 401 })
    }

    const imageUrls: string[] = []
    for (let i = 0; i < 2; i++) {
      const image = formData.get(`image${i}`) as File
      if (image && image.size > 0) {
        // في وضع التطوير بدون تخزين سحابي، نضع صورة وهمية
        imageUrls.push(`/placeholder.svg?height=200&width=300&text=صورة الشكوى ${i + 1}`)
      }
    }

    if (adminDb) {
      try {
        const docRef = await adminDb.collection("reports").add({
          user_email: userEmail,
          user_name: userName || null,
          complaint_type: complaintType,
          description,
          images: imageUrls.length > 0 ? imageUrls : null,
          status: "pending",
          created_at: serverTimestamp(),
        })
        const saved = await docRef.get()
        return NextResponse.json({ success: true, data: { id: saved.id, complaint: saved.data() } })
      } catch (e) {
        console.warn("[complaints] POST firestore error, fallback to memory:", e)
      }
    }
    const created = createComplaint({ userId: userEmail, title: complaintType, description, images: imageUrls })
    return NextResponse.json({ success: true, data: { id: created.id, complaint: created } })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") ?? undefined
    if (adminDb) {
      try {
        let ref = adminDb.collection("reports")
        if (userId) ref = ref.where("user_email", "==", userId)
        const snap = await ref.get()
        const complaints = snap.docs.map((d) => {
          const data = d.data() as any
          return {
            id: d.id,
            user_email: data.user_email || null,
            user_name: data.user_name || null,
            complaint_type: data.complaint_type || "other",
            description: data.description || "",
            images: data.images || null,
            status: data.status || "pending",
            created_at: data.created_at || new Date().toISOString(),
          }
        })
        return NextResponse.json({ complaints })
      } catch (e) {
        console.warn("[complaints] GET firestore error, fallback to memory:", e)
      }
    }
    const complaints = listComplaintsByUser(userId ?? undefined).map((c) => ({
      id: c.id,
      user_email: c.userId,
      user_name: null,
      complaint_type: c.title,
      description: c.description,
      images: c.images && c.images.length > 0 ? c.images : null,
      status: c.status === "in_progress" ? "pending" : c.status,
      created_at: c.createdAt,
    }))
    return NextResponse.json({ complaints })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}
