"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, Mail, Calendar, Eye, CheckCircle, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Complaint {
  id: string // Changed from number to string to match uuid type
  user_email: string | null
  user_name: string | null // Added user_name field to match schema
  complaint_type: string
  description: string
  images: string[] | null // Changed from image_urls to images to match schema
  status: string
  created_at: string
}

const complaintTypeLabels: Record<string, string> = {
  "website-malfunction": "عطل في الموقع",
  "order-not-received": "الطلب لم يصل",
  "payment-error": "خطأ في الدفع",
  "wrong-order": "طلب خاطئ",
  "damaged-product": "منتج تالف",
  "delivery-delay": "تأخير في التوصيل",
  "customer-service": "خدمة العملاء",
  "refund-issue": "مشكلة في الاسترداد",
  other: "أخرى",
}

const statusLabels: Record<string, string> = {
  pending: "قيد المراجعة",
  resolved: "تم الحل",
  rejected: "مرفوض",
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
}

export function ComplaintsPanel() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const response = await fetch("/api/complaints")
      const data = await response.json()

      if (response.ok) {
        setComplaints(data.complaints || [])
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في جلب الشكاوى",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateComplaintStatus = async (id: string, status: string) => {
    // Changed id type from number to string
    try {
      const response = await fetch(`/api/complaints/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        setComplaints(complaints.map((c) => (c.id === id ? { ...c, status } : c)))
        toast({
          title: "تم التحديث",
          description: "تم تحديث حالة الشكوى بنجاح",
        })
      } else {
        throw new Error("فشل في التحديث")
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الشكوى",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة الشكاوى</h2>
          <p className="text-gray-600">عرض ومتابعة شكاوى العملاء</p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {complaints.length} شكوى
        </Badge>
      </div>

      {complaints.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">لا توجد شكاوى حالياً</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {complaints.map((complaint) => (
            <Card key={complaint.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {complaintTypeLabels[complaint.complaint_type] || complaint.complaint_type}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      {complaint.user_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {complaint.user_email}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(complaint.created_at)}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge className={statusColors[complaint.status]}>{statusLabels[complaint.status]}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-2">{complaint.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {complaint.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateComplaintStatus(complaint.id, "resolved")}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          تم الحل
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateComplaintStatus(complaint.id, "rejected")}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          رفض
                        </Button>
                      </>
                    )}
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => setSelectedComplaint(complaint)}>
                        <Eye className="h-4 w-4 mr-1" />
                        عرض التفاصيل
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {complaintTypeLabels[complaint.complaint_type] || complaint.complaint_type}
                        </DialogTitle>
                        <DialogDescription>تفاصيل الشكوى رقم {complaint.id}</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">البريد الإلكتروني:</h4>
                          <p>{complaint.user_email || "غير محدد"}</p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">اسم المستخدم:</h4>
                          <p>{complaint.user_name || "غير محدد"}</p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">تاريخ الإرسال:</h4>
                          <p>{formatDate(complaint.created_at)}</p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">الحالة:</h4>
                          <Badge className={statusColors[complaint.status]}>{statusLabels[complaint.status]}</Badge>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">تفاصيل الشكوى:</h4>
                          <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
                        </div>

                        {complaint.images &&
                          complaint.images.length > 0 && ( // Changed from image_urls to images
                            <div>
                              <h4 className="font-medium mb-2">الصور المرفقة:</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {complaint.images.map(
                                  (
                                    url,
                                    index, // Changed from image_urls to images
                                  ) => (
                                    <img
                                      key={index}
                                      src={url || "/placeholder.svg"}
                                      alt={`صورة ${index + 1}`}
                                      className="w-full h-32 object-cover rounded border"
                                    />
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
