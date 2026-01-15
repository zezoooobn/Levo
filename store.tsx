import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  id: number
  name: string
  price: number
  originalPrice?: number
  quantity: number
  image: string
  size: string
  color: string
}

export interface WishlistItem {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
}

export interface User {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  location?: { lat: number; lng: number }
  buildingNumber?: string
  floor?: string
  apartment?: string
}

export interface Order {
  id: string
  customer: User
  items: CartItem[]
  total: number
  status: "قيد المعالجة" | "قيد الشحن" | "تم التسليم" | "تم الإلغاء"
  date: string
  notes?: string
}

// إضافة واجهة للتقييمات
export interface Review {
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

// إضافة واجهة لتخزين بيانات المستخدمين
interface UserCredentials {
  email: string
  password: string
  user: User
}

interface StoreState {
  cart: CartItem[]
  wishlist: WishlistItem[]
  user: User | null
  orders: Order[]
  isLoggedIn: boolean
  // إضافة قائمة المستخدمين المسجلين
  registeredUsers: UserCredentials[]
  // إضافة خيار تذكرني
  rememberMe: boolean
  // إضافة التقييمات
  reviews: Review[]
  // إضافة المنتجات التي تم تحديدها كمفيدة
  helpfulReviews: { userId: string; reviewId: string }[]

  // وظائف سلة التسوق
  addToCart: (item: CartItem) => void
  removeFromCart: (id: number) => void
  updateCartItemQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number

  // وظائف المفضلة
  addToWishlist: (item: WishlistItem) => void
  removeFromWishlist: (id: number) => void
  isInWishlist: (id: number) => boolean

  // وظائف المستخدم
  login: (email: string, password: string, remember?: boolean) => boolean
  logout: () => void
  register: (user: User, password: string, remember?: boolean) => void
  setRememberMe: (remember: boolean) => void

  // وظائف الطلبات
  createOrder: () => string | null
  getOrders: () => Order[]
  updateOrderStatus: (orderId: string, status: "قيد المعالجة" | "قيد الشحن" | "تم التسليم" | "تم الإلغاء") => void
  deleteOrder: (orderId: string) => void
  canCancelOrder: (order: Order) => boolean

  // وظائف التقييمات
  addReview: (review: Omit<Review, "id">) => Review | null
  getReviews: (productId: number) => Review[]
  markReviewHelpful: (reviewId: string) => Review | null
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      user: null,
      orders: [],
      isLoggedIn: false,
      registeredUsers: [],
      rememberMe: true, // تفعيل خيار تذكرني افتراضياً
      reviews: [],
      helpfulReviews: [],

      // وظائف سلة التسوق
      addToCart: (item) => {
        const cart = get().cart
        const existingItem = cart.find(
          (cartItem) => cartItem.id === item.id && cartItem.size === item.size && cartItem.color === item.color,
        )

        if (existingItem) {
          set({
            cart: cart.map((cartItem) =>
              cartItem.id === item.id && cartItem.size === item.size && cartItem.color === item.color
                ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                : cartItem,
            ),
          })
        } else {
          set({ cart: [...cart, item] })
        }
      },

      removeFromCart: (id) => {
        set({ cart: get().cart.filter((item) => item.id !== id) })
      },

      updateCartItemQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id)
          return
        }

        set({
          cart: get().cart.map((item) => (item.id === id ? { ...item, quantity } : item)),
        })
      },

      clearCart: () => set({ cart: [] }),

      getCartTotal: () => {
        return get().cart.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getCartCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0)
      },

      // وظائف المفضلة
      addToWishlist: (item) => {
        const wishlist = get().wishlist
        if (!wishlist.some((wishlistItem) => wishlistItem.id === item.id)) {
          set({ wishlist: [...wishlist, item] })
        }
      },

      removeFromWishlist: (id) => {
        set({ wishlist: get().wishlist.filter((item) => item.id !== id) })
      },

      isInWishlist: (id) => {
        return get().wishlist.some((item) => item.id === id)
      },

      // وظائف المستخدم
      login: (email, password, remember = true) => {
        const { registeredUsers } = get()
        const userCredential = registeredUsers.find((cred) => cred.email === email && cred.password === password)

        if (userCredential) {
          set({
            isLoggedIn: true,
            user: userCredential.user,
            rememberMe: remember,
          })
          return true
        }
        return false
      },

      logout: () => {
        // إذا كان خيار تذكرني غير مفعل، قم بتسجيل الخروج بالكامل
        if (!get().rememberMe) {
          set({ isLoggedIn: false, user: null })
        } else {
          // وإلا قم فقط بتسجيل الخروج من الجلسة الحالية
          set({ isLoggedIn: false })
        }
      },

      register: (user, password, remember = true) => {
        const { registeredUsers } = get()

        // التحقق مما إذا كان المستخدم موجود بالفعل
        const existingUser = registeredUsers.find((cred) => cred.email === user.email)

        if (existingUser) {
          // تحديث بيانات المستخدم الموجود
          set({
            registeredUsers: registeredUsers.map((cred) =>
              cred.email === user.email ? { ...cred, user, password } : cred,
            ),
            user,
            isLoggedIn: true,
            rememberMe: remember,
          })
        } else {
          // إضافة مستخدم جديد
          set({
            registeredUsers: [...registeredUsers, { email: user.email, password, user }],
            user,
            isLoggedIn: true,
            rememberMe: remember,
          })
        }
      },

      setRememberMe: (remember) => {
        set({ rememberMe: remember })
      },

      // وظائف الطلبات
      createOrder: () => {
        const user = get().user
        const cart = get().cart

        if (!user || cart.length === 0) {
          return null
        }

        const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`
        const date = new Date().toISOString().split("T")[0]
        const total = get().getCartTotal()

        const newOrder: Order = {
          id: orderId,
          customer: user,
          items: [...cart],
          total,
          status: "قيد المعالجة",
          date,
        }

        set((state) => ({
          orders: [...state.orders, newOrder],
          cart: [], // تفريغ السلة بعد إنشاء الطلب
        }))

        return orderId
      },

      getOrders: () => get().orders,

      // وظيفة تحديث حالة الطلب
      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((order) => (order.id === orderId ? { ...order, status } : order)),
        }))
      },

      // وظيفة حذف الطلب
      deleteOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== orderId),
        }))
      },

      // التحقق مما إذا كان يمكن إلغاء الطلب
      canCancelOrder: (order) => {
        // يمكن إلغاء الطلب فقط إذا كان في حالة "قيد المعالجة"
        return order.status === "قيد المعالجة"
      },

      // وظائف التقييمات
      addReview: (review) => {
        const { user, reviews } = get()

        if (!user) return null

        // التحقق مما إذا كان المستخدم قد قام بالتقييم بالفعل
        const existingReview = reviews.find((r) => r.productId === review.productId && r.userId === user.email)

        if (existingReview) {
          // تحديث التقييم الموجود
          const updatedReview = {
            ...existingReview,
            rating: review.rating,
            comment: review.comment,
            date: new Date().toISOString(),
          }

          set({
            reviews: reviews.map((r) => (r.id === existingReview.id ? updatedReview : r)),
          })

          return updatedReview
        } else {
          // إضافة تقييم جديد
          const newReview: Review = {
            ...review,
            id: `review-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          }

          set({
            reviews: [...reviews, newReview],
          })

          return newReview
        }
      },

      getReviews: (productId) => {
        return get()
          .reviews.filter((review) => review.productId === productId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      },

      markReviewHelpful: (reviewId) => {
        const { user, reviews, helpfulReviews } = get()

        if (!user) return null

        // التحقق مما إذا كان المستخدم قد قام بتحديد التقييم كمفيد بالفعل
        const alreadyMarked = helpfulReviews.some((hr) => hr.reviewId === reviewId && hr.userId === user.email)

        if (alreadyMarked) return null

        // العثور على التقييم
        const review = reviews.find((r) => r.id === reviewId)
        if (!review) return null

        // تحديث التقييم
        const updatedReview = {
          ...review,
          helpful: review.helpful + 1,
          userHasMarkedHelpful: true,
        }

        set({
          reviews: reviews.map((r) => (r.id === reviewId ? updatedReview : r)),
          helpfulReviews: [...helpfulReviews, { userId: user.email, reviewId }],
        })

        return updatedReview
      },
    }),
    {
      name: "anaqati-store",
      // تخزين جميع بيانات المتجر بما في ذلك المستخدمين المسجلين وخيار تذكرني والتقييمات
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        user: state.user,
        orders: state.orders,
        isLoggedIn: state.isLoggedIn,
        registeredUsers: state.registeredUsers,
        rememberMe: state.rememberMe,
        reviews: state.reviews,
        helpfulReviews: state.helpfulReviews,
      }),
    },
  ),
)
