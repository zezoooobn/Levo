"use client"

import { useEffect } from "react"
import { useStore } from "@/lib/store"

export function SampleData() {
  const { reviews, addReview } = useStore()

  useEffect(() => {
    // إضافة بعض التقييمات الافتراضية إذا لم تكن موجودة بالفعل
    if (reviews.length === 0) {
      const sampleReviews = [
        {
          productId: 1,
          userId: "user1@example.com",
          userName: "أحمد محمد",
          rating: 5,
          comment: "منتج رائع جداً! الخامة ممتازة والمقاس مناسب تماماً. سأشتري المزيد من هذا المنتج.",
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // قبل أسبوع
          helpful: 12,
          userHasMarkedHelpful: false,
          verified: true,
        },
        {
          productId: 1,
          userId: "user2@example.com",
          userName: "سارة أحمد",
          rating: 4,
          comment: "منتج جيد جداً، لكن المقاس أصغر قليلاً مما توقعت. أنصح بشراء مقاس أكبر.",
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // قبل أسبوعين
          helpful: 8,
          userHasMarkedHelpful: false,
          verified: true,
        },
        {
          productId: 1,
          userId: "user3@example.com",
          userName: "محمد علي",
          rating: 5,
          comment: "جودة ممتازة وسعر مناسب. وصل المنتج في الوقت المحدد والتغليف كان جيداً.",
          date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // قبل 3 أسابيع
          helpful: 5,
          userHasMarkedHelpful: false,
          verified: true,
        },
        {
          productId: 2,
          userId: "user4@example.com",
          userName: "فاطمة حسن",
          rating: 5,
          comment: "فستان جميل جداً! الخامة ممتازة والتصميم أنيق. مناسب للمناسبات الخاصة.",
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // قبل 5 أيام
          helpful: 10,
          userHasMarkedHelpful: false,
          verified: true,
        },
        {
          productId: 3,
          userId: "user5@example.com",
          userName: "خالد محمود",
          rating: 4,
          comment: "بنطلون جينز عالي الجودة. مريح جداً ومناسب للاستخدام اليومي.",
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // قبل 10 أيام
          helpful: 7,
          userHasMarkedHelpful: false,
          verified: true,
        },
      ]

      // إضافة التقييمات الافتراضية
      sampleReviews.forEach((review) => {
        addReview(review)
      })
    }
  }, [reviews.length, addReview])

  // هذا المكون لا يعرض أي شيء، فقط يقوم بإضافة البيانات الافتراضية
  return null
}
