import { type NextRequest, NextResponse } from "next/server"
import { updateComplaintStatus } from "@/lib/dev-complaints-memory"
import { adminDb } from "@/lib/firebase/admin"

export const runtime = "nodejs"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
    const complaintId = params.id

    if (!status || !["pending", "resolved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "حالة غير صحيحة" }, { status: 400 })
    }

    if (adminDb) {
      try {
        const docRef = adminDb.collection("reports").doc(complaintId)
        const exists = await docRef.get()
        if (!exists.exists) {
          return NextResponse.json({ error: "لم يتم العثور على الشكوى" }, { status: 404 })
        }
        await docRef.set({ status }, { merge: true })
        const saved = await docRef.get()
        return NextResponse.json({ success: true, data: { id: saved.id, ...saved.data() } })
      } catch (e) {
        console.warn("[complaints] PATCH firestore error, fallback to memory:", e)
      }
    }
    const updated = updateComplaintStatus(complaintId, status as any)
    if (!updated) return NextResponse.json({ error: "لم يتم العثور على الشكوى" }, { status: 404 })
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}
