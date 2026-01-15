"use client"
import { useState, useEffect } from "react"
import { Star, User, ThumbsUp, Flag, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useStore } from "@/lib/store"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

interface Review {
  id: string
  productId: number
  userId: string
  userName: string
  rating: number
  comment: string
  date: string
  helpful: number
  userHasMarkedHelpful: boolean
  verified: boolean
}

export function ProductReviews({ productId }: { productId: number }) {
  const router = useRouter()
  const { isLoggedIn, user, orders, addReview, getReviews, markReviewHelpful } = useStore()
  const [reviews, setReviews] = useState<Review[]>([])
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState("")
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [canReview, setCanReview] = useState(false)
  const [averageRating, setAverageRating] = useState(0)
  const [reviewMessage, setReviewMessage] = useState("")

  // تحميل التقييمات والتحقق من إمكانية التقييم
  useEffect(() => {
    const productReviews = getReviews(productId)
    setReviews(productReviews)

    // حساب متوسط التقييم
    if (productReviews.length > 0) {
      const total = productReviews.reduce((sum, review) => sum + review.rating, 0)
      setAverageRating(total / productReviews.length)
    }

    // التحقق مما إذا كان المستخدم قد قام بالتقييم بالفعل
    if (isLoggedIn && user) {
      const existingReview = productReviews.find((review) => review.userId === user.email)
      if (existingReview) {
        setUserReview(existingReview)
      }

      // التحقق مما إذا كان المستخدم يمكنه إضافة تقييم (اشترى المنتج وتم توصيله)
      const userCompletedOrders = orders.filter(
        (order) => order.status === "تم التسليم" && order.items.some((item) => item.id === productId),
      )

      if (userCompletedOrders.length > 0) {
        setCanReview(true)
        setReviewMessage("")
      } else {
        setCanReview(false)

        // التحقق مما إذا كان المستخدم قد اشترى المنتج ولكن لم يتم توصيله بعد
        const pendingOrders = orders.filter(
          (order) =>
            (order.status === "قيد المعالجة" || order.status === "قيد الشحن") &&
            order.items.some((item) => item.id === productId),
        )

        if (pendingOrders.length > 0) {
          setReviewMessage("لا يمكنك تقييم هذا المنتج حتى يتم توصيله إليك")
        } else {
          setReviewMessage("يمكنك فقط تقييم المنتجات التي اشتريتها وتم توصيلها")
        }
      }
    }
  }, [productId, isLoggedIn, user, getReviews, orders])

  // إضافة تقييم جديد
  const handleAddReview = () => {
    if (!isLoggedIn || !user) {
      toast({
        title: "يرجى تسجيل الدخول",
        description: "يجب عليك تسجيل الدخول لإضافة تقييم",
        variant: "destructive",
      })
      return
    }

    if (!canReview) {
      toast({
        title: "لا يمكن إضافة تقييم",
        description: "يمكنك فقط تقييم المنتجات التي اشتريتها وتم توصيلها",
        variant: "destructive",
      })
      return
    }

    if (newComment.trim() === "") {
      toast({
        title: "يرجى إضافة تعليق",
        description: "يجب عليك كتابة تعليق للتقييم",
        variant: "destructive",
      })
      return
    }

    const review: Omit<Review, "id"> = {
      productId,
      userId: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      rating: newRating,
      comment: newComment,
      date: new Date().toISOString(),
      helpful: 0,
      userHasMarkedHelpful: false,
      verified: true,
    }

    const newReview = addReview(review)

    if (newReview) {
      setUserReview(newReview)
      setReviews((prev) => [newReview, ...prev.filter((r) => r.userId !== user.email)])
      setNewComment("")
      setIsReviewDialogOpen(false)

      toast({
        title: "تم إضافة التقييم",
        description: "شكراً لك على تقييم المنتج",
      })
    }
  }

  // تحديد تقييم كمفيد
  const handleMarkHelpful = (reviewId: string) => {
    if (!isLoggedIn) {
      toast({
        title: "يرجى تسجيل الدخول",
        description: "يجب عليك تسجيل الدخول لتحديد التقييم كمفيد",
        variant: "destructive",
      })
      return
    }

    const updatedReview = markReviewHelpful(reviewId)
    if (updatedReview) {
      setReviews((prev) => prev.map((review) => (review.id === reviewId ? updatedReview : review)))
    }
  }

  // الإبلاغ عن تقييم
  const handleReportReview = (reviewId: string) => {
    toast({
      title: "تم الإبلاغ",
      description: "شكراً لك. سيتم مراجعة هذا التقييم من قبل فريقنا.",
    })
  }

  // التوجيه إلى صفحة تسجيل الدخول
  const handleLoginRedirect = () => {
    router.push(`/auth/login?redirect=/products/${productId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
                    i < Math.floor(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-bold">{averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({reviews.length} تقييم)</span>
          </div>
        </div>

        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                if (!isLoggedIn) {
                  handleLoginRedirect()
                  return
                }
                if (canReview && !userReview) {
                  setIsReviewDialogOpen(true)
                }
              }}
              disabled={isLoggedIn && (!canReview || userReview !== null)}
              className={userReview ? "" : "animate-pulse"}
            >
              {userReview ? "لقد قمت بالتقييم" : "إضافة تقييم"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>تقييم المنتج</DialogTitle>
              <DialogDescription>شاركنا رأيك في هذا المنتج. تقييمك يساعد العملاء الآخرين.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-center">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      className="focus:outline-none"
                      onMouseEnter={() => setHoveredRating(rating)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setNewRating(rating)}
                    >
                      <Star
                        className={`h-8 w-8 transition-all duration-150 ${
                          rating <= (hoveredRating || newRating)
                            ? "text-yellow-400 fill-yellow-400 scale-110"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="comment" className="text-sm font-medium">
                  تعليقك
                </label>
                <Textarea
                  id="comment"
                  placeholder="اكتب تعليقك هنا..."
                  rows={5}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAddReview}>نشر التقييم</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!isLoggedIn && (
        <div className="bg-muted/50 p-4 rounded-lg text-center">
          <p className="text-muted-foreground">
            يرجى{" "}
            <Button variant="link" className="p-0 h-auto" onClick={handleLoginRedirect}>
              تسجيل الدخول
            </Button>{" "}
            لإضافة تقييم
          </p>
        </div>
      )}

      {isLoggedIn && !canReview && !userReview && reviewMessage && (
        <div className="bg-muted/50 p-4 rounded-lg text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <p className="font-medium text-amber-500">ملاحظة</p>
          </div>
          <p className="text-muted-foreground">{reviewMessage}</p>
        </div>
      )}

      <Separator />

      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.userName}</span>
                      {review.verified && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          مشتري مؤكد
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span>•</span>
                      <span>{new Date(review.date).toLocaleDateString("ar-EG")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => handleMarkHelpful(review.id)}
                    disabled={review.userHasMarkedHelpful}
                  >
                    <ThumbsUp className={`h-3 w-3 mr-1 ${review.userHasMarkedHelpful ? "fill-primary" : ""}`} />
                    مفيد ({review.helpful})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => handleReportReview(review.id)}
                  >
                    <Flag className="h-3 w-3 mr-1" />
                    إبلاغ
                  </Button>
                </div>
              </div>
              <p className="text-sm">{review.comment}</p>
              <Separator className="mt-4" />
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
            <h3 className="mt-4 text-lg font-medium">لا توجد تقييمات بعد</h3>
            <p className="text-muted-foreground">كن أول من يقيم هذا المنتج</p>
          </div>
        )}
      </div>
    </div>
  )
}
