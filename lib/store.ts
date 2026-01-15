import { create } from "zustand"
import { persist } from "zustand/middleware"
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot, doc, getDoc } from "firebase/firestore"
import { db, auth, ensureAuth } from "@/lib/firebase/client"

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
  image?: string
  backgroundImage?: string
}

export interface Notification {
  id: string
  userId: string // email or 'admin'
  title: string
  message: string
  type: "order" | "complaint" | "system"
  read: boolean
  date: string
}

export interface Order {
  id: string
  customer: User
  items: CartItem[]
  total: number
  status: "قيد المعالجة" | "قيد الشحن" | "تم التسليم" | "تم الإلغاء"
  date: string
  notes?: string
  appliedDiscountCode?: string
  discountDetails?: {
    code: string
    type: "percentage" | "shipping"
    value: number
    amount: number
  }
  shippingCost?: number
  governorate?: string
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

// إضافة واجهة لأكواد الخصم
export interface DiscountCode {
  id: string
  code: string
  discountType: "percentage" | "shipping"
  discountValue: number
  active: boolean
  expiryDate?: string
  minOrderValue?: number
  maxUses?: number
  currentUses: number
  oneTimeUse?: boolean // هل الكود للاستخدام مرة واحدة فقط لكل مستخدم
}

// إضافة واجهة لتتبع استخدام أكواد الخصم
export interface DiscountCodeUsage {
  userId: string
  codeId: string
  usedAt: string
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
  // إضافة أكواد الخصم
  discountCodes: DiscountCode[]
  // كود الخصم المطبق حاليًا
  appliedDiscountCode: string | null
  // تتبع استخدام أكواد الخصم
  discountCodeUsages: DiscountCodeUsage[]
  notifications: Notification[]
  notificationSettings: {
    email: boolean
    push: boolean
  }

  language: "ar" | "en"

  // عنصر مفضلة معلّق للإضافة بعد تسجيل الدخول
  pendingWishlistItem: WishlistItem | null
  shippingPricing: Record<string, number>
  setShippingPricing: (map: Record<string, number>) => void

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
  setPendingWishlistItem: (item: WishlistItem | null) => void

  // وظائف الإشعارات
  addNotification: (notification: Omit<Notification, "id" | "date" | "read">) => void
  markNotificationRead: (id: string) => void
  getNotifications: (userId: string) => Notification[]
  clearNotifications: (userId: string) => void
  updateNotificationSettings: (settings: Partial<{ email: boolean; push: boolean }>) => void

  // وظائف المستخدم
  login: (email: string, password: string, remember?: boolean) => boolean
  loginWithGoogle: (user: User) => void
  logout: () => void
  register: (user: User, password: string, remember?: boolean) => void
  setRememberMe: (remember: boolean) => void
  updateUserInfo: (userInfo: Partial<User>) => void

  // وظائف الطلبات
  createOrder: () => Promise<string | null>
  getOrders: () => Order[]
  updateOrderStatus: (orderId: string, status: "قيد المعالجة" | "قيد الشحن" | "تم التسليم" | "تم الإلغاء") => void
  deleteOrder: (orderId: string) => void
  canCancelOrder: (order: Order) => boolean
  subscribeToOrders: () => () => void
  syncOrdersToFirestore: () => Promise<void>

  // وظائف التقييمات
  addReview: (review: Omit<Review, "id">) => Review | null
  getReviews: (productId: number) => Review[]
  markReviewHelpful: (reviewId: string) => Review | null
  canUserReviewProduct: (userId: string, productId: number) => boolean

  // وظائف أكواد الخصم
  addDiscountCode: (code: Omit<DiscountCode, "id" | "currentUses">) => DiscountCode
  removeDiscountCode: (id: string) => void
  updateDiscountCode: (id: string, updates: Partial<DiscountCode>) => DiscountCode | null
  getDiscountCodes: () => DiscountCode[]
  applyDiscountCode: (code: string) => { success: boolean; message: string; discount?: number }
  getAppliedDiscount: () => { code: string; type: "percentage" | "shipping"; value: number } | null
  removeAppliedDiscountCode: () => void
  hasUserUsedCode: (userId: string, codeId: string) => boolean
  setLanguage: (lang: "ar" | "en") => void
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
      discountCodes: [],
      appliedDiscountCode: null,
      discountCodeUsages: [], // إضافة تتبع استخدام أكواد الخصم
      notifications: [],
      notificationSettings: { email: true, push: true },
      pendingWishlistItem: null,
      language: "ar",
      shippingPricing: {
        cairo: 50,
        giza: 60,
        alexandria: 80,
        ismailia: 100,
        port_said: 90,
        suez: 90,
        sharqia: 70,
        qalyubia: 70,
        gharbia: 70,
        monufia: 70,
        dakahlia: 70,
        kafr_el_sheikh: 75,
        beheira: 75,
        damietta: 80,
        faiyum: 85,
        beni_suef: 85,
        minya: 95,
        asyut: 95,
        sohag: 100,
        qena: 110,
        luxor: 120,
        aswan: 130,
        matrouh: 120,
        north_sinai: 140,
        south_sinai: 140,
        red_sea: 130,
        new_valley: 150,
        others: 90,
      },
      setShippingPricing: (map) => {
        set({ shippingPricing: { ...get().shippingPricing, ...map } })
      },

      // وظائف الإشعارات
      addNotification: (notification) => {
        const { notificationSettings } = get()
        
        // التحقق من الإعدادات قبل إضافة الإشعار
        if (!notificationSettings.push) {
          return
        }

        const newNotification: Notification = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          date: new Date().toISOString(),
          read: false,
          ...notification,
        }
        set((state) => ({ notifications: [newNotification, ...state.notifications] }))
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        }))
      },

      getNotifications: (userId) => {
        return get().notifications.filter((n) => n.userId === userId)
      },

      clearNotifications: (userId) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.userId !== userId),
        }))
      },

      updateNotificationSettings: (settings) => {
        set((state) => ({
          notificationSettings: { ...state.notificationSettings, ...settings },
        }))
      },

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

        ;(async () => {
          try {
            await ensureAuth()
            const uid = auth.currentUser?.uid
            if (!uid) return
            const q = query(collection(db, "cart"), where("userId", "==", uid), where("itemId", "==", String(item.id)))
            const snap = await getDocs(q)
            if (!snap.empty) {
              await Promise.all(
                snap.docs.map((d) => updateDoc(d.ref, { quantity: (existingItem ? existingItem.quantity : 0) + item.quantity, addedAt: serverTimestamp() }))
              )
            } else {
              await addDoc(collection(db, "cart"), {
                userId: uid,
                itemId: String(item.id),
                name: item.name,
                image: item.image,
                category: "",
                price: item.price,
                quantity: item.quantity,
                addedAt: serverTimestamp(),
              })
            }
          } catch {}
        })()
      },

      removeFromCart: (id) => {
        set({ cart: get().cart.filter((item) => item.id !== id) })
        ;(async () => {
          try {
            await ensureAuth()
            const uid = auth.currentUser?.uid
            if (!uid) return
            const q = query(collection(db, "cart"), where("userId", "==", uid), where("itemId", "==", String(id)))
            const snap = await getDocs(q)
            await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
          } catch {}
        })()
      },

      updateCartItemQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id)
          return
        }

        set({
          cart: get().cart.map((item) => (item.id === id ? { ...item, quantity } : item)),
        })

        ;(async () => {
          try {
            await ensureAuth()
            const uid = auth.currentUser?.uid
            if (!uid) return
            const q = query(collection(db, "cart"), where("userId", "==", uid), where("itemId", "==", String(id)))
            const snap = await getDocs(q)
            await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { quantity, addedAt: serverTimestamp() })))
          } catch {}
        })()
      },

      clearCart: () => {
        set({ cart: [] })
        ;(async () => {
          try {
            await ensureAuth()
            const uid = auth.currentUser?.uid
            if (!uid) return
            const q = query(collection(db, "cart"), where("userId", "==", uid))
            const snap = await getDocs(q)
            await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
          } catch {}
        })()
      },

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
        ;(async () => {
          try {
            await ensureAuth()
            const uid = auth.currentUser?.uid
            if (!uid) return
            const q = query(collection(db, "favorites"), where("userId", "==", uid), where("itemId", "==", String(item.id)))
            const snap = await getDocs(q)
            if (snap.empty) {
              await addDoc(collection(db, "favorites"), {
                userId: uid,
                itemId: String(item.id),
                name: item.name,
                image: item.image,
                category: item.category,
                addedAt: serverTimestamp(),
              })
            }
          } catch {}
        })()
      },

      removeFromWishlist: (id) => {
        set({ wishlist: get().wishlist.filter((item) => item.id !== id) })
        ;(async () => {
          try {
            await ensureAuth()
            const uid = auth.currentUser?.uid
            if (!uid) return
            const q = query(collection(db, "favorites"), where("userId", "==", uid), where("itemId", "==", String(id)))
            const snap = await getDocs(q)
            await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
          } catch {}
        })()
      },

      isInWishlist: (id) => {
        return get().wishlist.some((item) => item.id === id)
      },

      setPendingWishlistItem: (item) => {
        set({ pendingWishlistItem: item })
      },

      // وظائف المستخدم
      login: (email, password, remember = true) => {
        const { registeredUsers, pendingWishlistItem } = get()
        const userCredential = registeredUsers.find((cred) => cred.email === email && cred.password === password)

        if (userCredential) {
          // تسجيل الدخول
          set({ isLoggedIn: true, user: userCredential.user, rememberMe: remember })
          ;(async () => {
            try {
              await ensureAuth()
              const uid = auth.currentUser?.uid
              if (uid) {
                const cartSnap = await getDocs(query(collection(db, "cart"), where("userId", "==", uid)))
                const loadedCart = cartSnap.docs.map((d) => {
                  const x = d.data() as any
                  return {
                    id: Number(x.itemId),
                    name: x.name || "",
                    price: Number(x.price || 0),
                    originalPrice: Number(x.price || 0),
                    quantity: Number(x.quantity || 1),
                    image: x.image || "/placeholder.svg?height=400&width=300",
                    size: "",
                    color: "",
                  }
                })
                set({ cart: loadedCart })
                const favSnap = await getDocs(query(collection(db, "favorites"), where("userId", "==", uid)))
                const loadedFav = favSnap.docs.map((d) => {
                  const x = d.data() as any
                  return {
                    id: Number(x.itemId),
                    name: x.name || "",
                    price: 0,
                    originalPrice: 0,
                    image: x.image || "/placeholder.svg",
                    category: x.category || "",
                  }
                })
                set({ wishlist: loadedFav })
              }
            } catch {}
          })()
          // إضافة عنصر المفضلة المعلّق إن وجد
          if (pendingWishlistItem) {
            const wishlist = get().wishlist
            if (!wishlist.some((w) => w.id === pendingWishlistItem.id)) {
              set({ wishlist: [...wishlist, pendingWishlistItem] })
            }
            set({ pendingWishlistItem: null })
          }
          return true
        }
        return false
      },

      loginWithGoogle: (user) => {
        const { registeredUsers, pendingWishlistItem } = get()
        const existing = registeredUsers.find((u) => u.email === user.email)
        const placeholderPassword = "__GOOGLE__"
        if (existing) {
          set({
            registeredUsers: registeredUsers.map((cred) =>
              cred.email === user.email ? { ...cred, user, password: placeholderPassword } : cred,
            ),
            user,
            isLoggedIn: true,
            rememberMe: true,
          })
        } else {
          set({
            registeredUsers: [...registeredUsers, { email: user.email, password: placeholderPassword, user }],
            user,
            isLoggedIn: true,
            rememberMe: true,
          })
        }
        if (pendingWishlistItem) {
          const wishlist = get().wishlist
          if (!wishlist.some((w) => w.id === pendingWishlistItem.id)) {
            set({ wishlist: [...wishlist, pendingWishlistItem] })
          }
          set({ pendingWishlistItem: null })
        }
      },

      logout: () => {
        set({
          isLoggedIn: false,
          user: null,
          rememberMe: false,
          cart: [], // حذف السلة
          wishlist: [], // حذف المفضلة
          orders: [], // حذف الطلبات
          appliedDiscountCode: null, // حذف كود الخصم المطبق
          // لا نحذف registeredUsers حتى يتمكن المستخدم من تسجيل الدخول مرة أخرى
        })
      },

      register: (user, password, remember = true) => {
        const { registeredUsers, pendingWishlistItem } = get()

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

        // إضافة عنصر المفضلة المعلّق إن وجد
        if (pendingWishlistItem) {
          const wishlist = get().wishlist
          if (!wishlist.some((w) => w.id === pendingWishlistItem.id)) {
            set({ wishlist: [...wishlist, pendingWishlistItem] })
          }
          set({ pendingWishlistItem: null })
        }
      },

      setRememberMe: (remember) => {
        set({ rememberMe: remember })
      },

      // وظيفة تحديث بيانات المستخدم
      updateUserInfo: (userInfo) => {
        const { user, registeredUsers, isLoggedIn } = get()

        if (!user || !isLoggedIn) return

        const updatedUser = { ...user, ...userInfo }

        // تحديث بيانات المستخدم في الحالة
        set({ user: updatedUser })

        // تحديث بيانات المستخدم في قائمة المستخدمين المسجلين
        set({
          registeredUsers: registeredUsers.map((cred) =>
            cred.email === user.email ? { ...cred, user: updatedUser } : cred,
          ),
        })
      },

      // وظائف الطلبات
      createOrder: () => {
        const user = get().user
        const cart = get().cart
        const appliedDiscountCode = get().appliedDiscountCode
        const discountCodes = get().discountCodes

        if (!user || cart.length === 0) {
          return null
        }

        const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`
        const date = new Date().toISOString() // تاريخ ووقت كامل
        const cartTotal = get().getCartTotal()

        const GOVS: Array<{ id: string; name: string }> = [
          { id: "cairo", name: "القاهرة" },
          { id: "giza", name: "الجيزة" },
          { id: "alexandria", name: "الإسكندرية" },
          { id: "port_said", name: "بورسعيد" },
          { id: "suez", name: "السويس" },
          { id: "ismailia", name: "الإسماعيلية" },
          { id: "dakahlia", name: "الدقهلية" },
          { id: "gharbia", name: "الغربية" },
          { id: "kafr_el_sheikh", name: "كفر الشيخ" },
          { id: "sharqia", name: "الشرقية" },
          { id: "monufia", name: "المنوفية" },
          { id: "qalyubia", name: "القليوبية" },
          { id: "beheira", name: "البحيرة" },
          { id: "damietta", name: "دمياط" },
          { id: "faiyum", name: "الفيوم" },
          { id: "beni_suef", name: "بني سويف" },
          { id: "minya", name: "المنيا" },
          { id: "asyut", name: "أسيوط" },
          { id: "sohag", name: "سوهاج" },
          { id: "qena", name: "قنا" },
          { id: "luxor", name: "الأقصر" },
          { id: "aswan", name: "أسوان" },
          { id: "matrouh", name: "مطروح" },
          { id: "north_sinai", name: "شمال سيناء" },
          { id: "south_sinai", name: "جنوب سيناء" },
          { id: "red_sea", name: "البحر الأحمر" },
          { id: "new_valley", name: "الوادي الجديد" },
        ]

        const addr = (user.address || "").toLowerCase()
        const govId =
          GOVS.find((g) => addr.includes(g.name.toLowerCase()))?.id || "others"

        let shippingCost = 0
        const sp = get().shippingPricing
        if (typeof sp[govId] === "number") {
          shippingCost = sp[govId]
        } else if (typeof sp.others === "number") {
          shippingCost = sp.others
        }

        let finalTotal = cartTotal + shippingCost

        // إنشاء الطلب مع كود الخصم المطبق
        const newOrder: Order = {
          id: orderId,
          customer: user,
          items: [...cart],
          total: finalTotal,
          status: "قيد المعالجة",
          date,
          appliedDiscountCode: appliedDiscountCode || undefined,
          shippingCost,
          governorate: govId,
        }

        // إذا كان هناك كود خصم مطبق، قم بتسجيل استخدامه وتحديث العداد وحفظ تفاصيل الخصم في الطلب
        if (appliedDiscountCode) {
          const discountCode = discountCodes.find((dc) => dc.code === appliedDiscountCode)
          if (discountCode) {
            let discountAmount = 0
            if (discountCode.discountType === "percentage") {
              discountAmount = (cartTotal * discountCode.discountValue) / 100
              finalTotal = cartTotal - discountAmount + shippingCost
            } else if (discountCode.discountType === "shipping") {
              discountAmount = discountCode.discountValue
              const adjusted = Math.max(shippingCost - discountAmount, 0)
              finalTotal = cartTotal + adjusted
            }

            newOrder.discountDetails = {
              code: discountCode.code,
              type: discountCode.discountType,
              value: discountCode.discountValue,
              amount: discountAmount
            }
            newOrder.total = finalTotal

            const newUsage: DiscountCodeUsage = {
              userId: user.email,
              codeId: discountCode.id,
              usedAt: new Date().toISOString(),
            }

            const updatedDiscountCodes = get().discountCodes.map((dc) =>
              dc.id === discountCode.id ? { ...dc, currentUses: dc.currentUses + 1 } : dc
            )

            set((state) => ({
              discountCodeUsages: [...state.discountCodeUsages, newUsage],
              discountCodes: updatedDiscountCodes,
            }))
          }
        }

        set((state) => ({
          orders: [...state.orders, newOrder],
          cart: [], // تفريغ السلة بعد إنشاء الطلب
          appliedDiscountCode: null, // إزالة كود الخصم المطبق بعد إنشاء الطلب
        }))

        // إشعار للمسؤول بطلب جديد
        get().addNotification({
          userId: "admin",
          title: "طلب جديد",
          message: `تم استلام طلب جديد رقم ${orderId} بقيمة ${finalTotal} ج.م من ${user.firstName} ${user.lastName}`,
          type: "order",
        })

        // إشعار للعميل باستلام الطلب
        get().addNotification({
          userId: user.email,
          title: "تم استلام طلبك",
          message: `تم استلام طلبك رقم ${orderId} بنجاح وهو الآن قيد المعالجة`,
          type: "order",
        })

        ;(async () => {
          try {
            await ensureAuth()
            try {
              await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newOrder),
              })
            } catch {}
            await addDoc(collection(db, "orders"), {
              ...newOrder,
              createdAt: serverTimestamp(),
            })
            
            // تحديث مخزون أكواد الخصم في Firebase إذا تم استخدام كود
            if (appliedDiscountCode) {
              const discountCodes = get().discountCodes
              const discountCode = discountCodes.find((dc) => dc.code === appliedDiscountCode)
              if (discountCode) {
                 // تسجيل الاستخدام فقط (لا نقوم بتعديل الحقول في Firestore لإبقاءها مطابقة للخانات المعروضة)
                 await addDoc(collection(db, "discountCodeUsages"), {
                    userId: user.email,
                    codeId: discountCode.id,
                    usedAt: serverTimestamp()
                 })
              }
            }
          } catch (e) {
            console.error("Error saving order to Firebase:", e)
            try {
              await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newOrder),
              })
            } catch {}
          }
        })()

        return orderId
      },

      getOrders: () => get().orders,

      // وظيفة تحديث حالة الطلب
      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((order) => (order.id === orderId ? { ...order, status } : order)),
        }))

        // تحديث الحالة في Firebase
        ;(async () => {
          try {
            await ensureAuth()
            const q = query(collection(db, "orders"), where("id", "==", orderId))
            const snap = await getDocs(q)
            if (!snap.empty) {
              await updateDoc(snap.docs[0].ref, { status })
            }
          } catch (e) {
             console.error("Error updating order status in Firebase:", e)
             try {
               // تحديث في الذاكرة عبر API إن لزم
               await fetch("/api/orders", {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify(
                   get().orders.find((o) => o.id === orderId) || { id: orderId, status, customer: get().user, items: [], total: 0, date: new Date().toISOString() }
                 ),
               })
             } catch {}
          }
        })()

        // إشعار للعميل بتحديث حالة الطلب
        const order = get().orders.find((o) => o.id === orderId)
        if (order) {
          get().addNotification({
            userId: order.customer.email,
            title: "تحديث حالة الطلب",
            message: `تغيرت حالة طلبك رقم ${orderId} إلى ${status}`,
            type: "order",
          })
        }
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

      subscribeToOrders: () => {
        let unsubscribe: () => void = () => {}
        let intervalId: any = null
        
        ;(async () => {
          try {
            await ensureAuth()
            const q = query(collection(db, "orders"))
            
            unsubscribe = onSnapshot(q, (snapshot) => {
              const orders: Order[] = []
              let hasNewOrder = false
              const currentOrders = get().orders
              
              snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                  // التحقق مما إذا كان الطلب جديداً (ليس موجوداً بالفعل في الحالة المحلية)
                  // هذا مهم لتجنب الإشعارات عند التحميل الأولي
                  const isNewLocally = !currentOrders.some(o => o.id === change.doc.data().id)
                  
                  // إذا كان الطلب جديداً وتمت إضافته الآن (وليس قديماً)
                  // يمكننا استخدام timestamp للتحقق بدقة أكبر
                  const data = change.doc.data() as any
                  const orderDate = new Date(data.date).getTime()
                  const now = new Date().getTime()
                  
                  // إذا كان الطلب قد تم إنشاؤه في آخر دقيقة، نعتبره جديداً للإشعار
                  if (isNewLocally && (now - orderDate < 60000)) {
                     hasNewOrder = true
                     // إشعار للمسؤول
                     if (get().user?.email === "admin@anaqati.com" || get().user?.email === "admin") { // افتراض بريد المسؤول
                        get().addNotification({
                          userId: "admin",
                          title: "طلب جديد وصل!",
                          message: `طلب جديد رقم ${data.id} بقيمة ${data.total} ج.م`,
                          type: "order"
                        })
                     }
                  }
                }
                if (change.type === "modified") {
                   const data = change.doc.data() as Order
                   const oldOrder = currentOrders.find(o => o.id === data.id)
                   
                   // إذا تغيرت الحالة
                   if (oldOrder && oldOrder.status !== data.status) {
                     // إشعار للعميل صاحب الطلب
                     if (get().user?.email === data.customer.email) {
                        get().addNotification({
                          userId: data.customer.email,
                          title: "تحديث حالة الطلب",
                          message: `تغيرت حالة طلبك رقم ${data.id} إلى ${data.status}`,
                          type: "order"
                        })
                     }
                   }
                }
              })

               snapshot.forEach((doc) => {
                const data = doc.data() as any
                if (
                  data &&
                  data.customer &&
                  data.customer.email &&
                  Array.isArray(data.items) &&
                  typeof data.total === "number" &&
                  typeof data.status === "string" &&
                  typeof data.date === "string"
                ) {
                  orders.push(data as Order)
                }
              })
              
              ;(async () => {
                try {
                  const res = await fetch("/api/orders")
                  const data = await res.json()
                  const apiOrders: Order[] = (data.orders || []).filter((o: any) => o && o.id && o.customer).map((o: any) => ({
                    id: o.id,
                    customer: o.customer,
                    items: Array.isArray(o.items) ? o.items : [],
                    total: Number(o.total || 0),
                    status: o.status || "قيد المعالجة",
                    date: o.date || new Date().toISOString(),
                    notes: o.notes,
                    appliedDiscountCode: o.appliedDiscountCode,
                    shippingCost: o.shippingCost,
                    governorate: o.governorate,
                  }))
                  const map = new Map<string, Order>()
                  ;[...orders, ...apiOrders].forEach((o) => map.set(o.id, o))
                  const merged = Array.from(map.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  set({ orders: merged })
                } catch {
                  set({ orders: orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) })
                }
              })()
            })
            
            intervalId = setInterval(async () => {
              try {
                const res = await fetch("/api/orders")
                const data = await res.json()
                const apiOrders: Order[] = (data.orders || []).filter((o: any) => o && o.id && o.customer).map((o: any) => ({
                  id: o.id,
                  customer: o.customer,
                  items: Array.isArray(o.items) ? o.items : [],
                  total: Number(o.total || 0),
                  status: o.status || "قيد المعالجة",
                  date: o.date || new Date().toISOString(),
                  notes: o.notes,
                  appliedDiscountCode: o.appliedDiscountCode,
                  shippingCost: o.shippingCost,
                  governorate: o.governorate,
                }))
                const existing = get().orders
                const map = new Map<string, Order>()
                ;[...existing, ...apiOrders].forEach((o) => map.set(o.id, o))
                const merged = Array.from(map.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                set({ orders: merged })
              } catch {}
            }, 5000)
          } catch (e) {
            console.error("Error subscribing to orders:", e)
            try {
              const res = await fetch("/api/orders")
              const data = await res.json()
              const fallback: Order[] = (data.orders || []).filter((o: any) => o && o.id && o.customer).map((o: any) => ({
                id: o.id,
                customer: o.customer,
                items: Array.isArray(o.items) ? o.items : [],
                total: Number(o.total || 0),
                status: o.status || "قيد المعالجة",
                date: o.date || new Date().toISOString(),
                notes: o.notes,
                appliedDiscountCode: o.appliedDiscountCode,
                shippingCost: o.shippingCost,
                governorate: o.governorate,
              }))
              set({ orders: fallback.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) })
            } catch {}
          }
        })()
        
        return () => {
          if (unsubscribe) unsubscribe()
          if (intervalId) clearInterval(intervalId)
        }
      },
      
      // مزامنة الطلبات المخزنة محلياً إلى Firestore لمرة واحدة
      syncOrdersToFirestore: async () => {
        try {
          await ensureAuth()
          const localOrders = get().orders
          for (const order of localOrders) {
            const q = query(collection(db, "orders"), where("id", "==", order.id))
            const snap = await getDocs(q)
            if (snap.empty) {
              await addDoc(collection(db, "orders"), { ...order, createdAt: serverTimestamp() })
            }
          }
        } catch (e) {
          console.error("Error syncing local orders to Firestore:", e)
        }
      },

      // وظيفة للتحقق مما إذا كان المستخدم يمكنه تقييم منتج
      canUserReviewProduct: (userId, productId) => {
        const { orders } = get()

        // التحقق مما إذا كان المستخدم قد اشترى المنتج وتم توصيله
        return orders.some((order) => {
          if (!order || !order.customer || !order.customer.email) return false
          return (
            order.customer.email === userId &&
            order.status === "تم التسليم" &&
            Array.isArray(order.items) &&
            order.items.some((item) => item.id === productId)
          )
        })
      },

      // وظائف التقييمات
      addReview: (review) => {
        const { user, reviews } = get()

        if (!user) return null

        // التحقق مما إذا كان المستخدم يمكنه تقييم المنتج
        const canReview = get().canUserReviewProduct(user.email, review.productId)
        if (!canReview) return null

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

          ;(async () => {
            try {
              await ensureAuth()
              const uid = auth.currentUser?.uid
              await addDoc(collection(db, "comments"), {
                id: newReview.id,
                productId: newReview.productId,
                userId: uid || user.email,
                user_name: newReview.userName,
                rating: newReview.rating,
                comment: newReview.comment,
                helpful: newReview.helpful,
                verified: newReview.verified,
                created_at: serverTimestamp(),
              })
            } catch {}
          })()

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

      // وظيفة للتحقق مما إذا كان المستخدم قد استخدم كود الخصم من قبل
      hasUserUsedCode: (userId, codeId) => {
        const { discountCodeUsages } = get()
        return discountCodeUsages.some((usage) => usage.userId === userId && usage.codeId === codeId)
      },

      // وظائف أكواد الخصم
      subscribeToDiscountCodes: () => {
        let unsubscribe: () => void = () => {}
        
        ;(async () => {
          try {
            await ensureAuth()
            const q = query(collection(db, "Discount Code"))
            
            unsubscribe = onSnapshot(q, (snapshot) => {
              const codes: DiscountCode[] = []
              snapshot.forEach((doc) => {
                const d: any = doc.data()
                const mapped: DiscountCode = {
                  id: doc.id,
                  code: d?.Code ?? d?.code ?? "",
                  discountType: (d?.Type ?? d?.discountType ?? "percentage") as "percentage" | "shipping",
                  discountValue: Number(d?.Value ?? d?.discountValue ?? 0),
                  active: d?.active ?? true,
                  expiryDate: d?.["expire date"]
                    ? (d["expire date"]?.toDate
                        ? d["expire date"].toDate().toISOString()
                        : new Date(d["expire date"]).toISOString())
                    : d?.expiryDate,
                  minOrderValue: d?.["minimum cost"] ?? d?.minOrderValue,
                  maxUses: d?.usage ?? d?.maxUses,
                  currentUses: d?.currentUses ?? 0,
                  oneTimeUse:
                    typeof d?.usage === "number"
                      ? d.usage === 1
                      : d?.oneTimeUse ?? false,
                }
                codes.push(mapped)
              })
              set({ discountCodes: codes })
            })
          } catch (e) {
            console.error("Error subscribing to discount codes:", e)
          }
        })()
        
        return () => unsubscribe()
      },

      addDiscountCode: (code) => {
        const newCode: DiscountCode = {
          ...code,
          id: `discount-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          currentUses: 0,
        }

        set((state) => ({
          discountCodes: [...state.discountCodes, newCode],
        }))

        // حفظ في Firebase
        ;(async () => {
          try {
            await ensureAuth()
            await addDoc(collection(db, "Discount Code"), {
              Code: newCode.code,
              Type: newCode.discountType,
              Value: newCode.discountValue,
              "expire date": newCode.expiryDate ? new Date(newCode.expiryDate) : null,
              "minimum cost": newCode.minOrderValue ?? null,
              usage: typeof newCode.maxUses === "number" ? newCode.maxUses : newCode.oneTimeUse ? 1 : null,
            })
          } catch (e) {
            console.error("Error adding discount code to Firebase:", e)
          }
        })()

        return newCode
      },

      removeDiscountCode: (id) => {
        set((state) => ({
          discountCodes: state.discountCodes.filter((code) => code.id !== id),
        }))

        // حذف من Firebase
        ;(async () => {
          try {
            await ensureAuth()
            // العثور على الكود للحصول على قيمة Code
            const codeObj = get().discountCodes.find((c) => c.id === id)
            const q = codeObj
              ? query(collection(db, "Discount Code"), where("Code", "==", codeObj.code))
              : query(collection(db, "Discount Code"), where("id", "==", id))
            const snap = await getDocs(q)
            snap.forEach(async (doc) => {
              await deleteDoc(doc.ref)
            })
          } catch (e) {
            console.error("Error removing discount code from Firebase:", e)
          }
        })()
      },

      updateDiscountCode: (id, updates) => {
        const { discountCodes } = get()
        const codeToUpdate = discountCodes.find((code) => code.id === id)

        if (!codeToUpdate) return null

        const updatedCode = {
          ...codeToUpdate,
          ...updates,
        }

        set({
          discountCodes: discountCodes.map((code) => (code.id === id ? updatedCode : code)),
        })

        // تحديث في Firebase
        ;(async () => {
          try {
            await ensureAuth()
            const q = query(collection(db, "Discount Code"), where("Code", "==", codeToUpdate.code))
            const snap = await getDocs(q)
            snap.forEach(async (doc) => {
              await updateDoc(doc.ref, {
                Code: updatedCode.code,
                Type: updatedCode.discountType,
                Value: updatedCode.discountValue,
                "expire date": updatedCode.expiryDate ? new Date(updatedCode.expiryDate) : null,
                "minimum cost": updatedCode.minOrderValue ?? null,
                usage: typeof updatedCode.maxUses === "number" ? updatedCode.maxUses : updatedCode.oneTimeUse ? 1 : null,
              })
            })
          } catch (e) {
            console.error("Error updating discount code in Firebase:", e)
          }
        })()

        return updatedCode
      },

      getDiscountCodes: () => get().discountCodes,

      applyDiscountCode: (code) => {
        const { discountCodes, getCartTotal, user, hasUserUsedCode } = get()

        if (!user) {
          return { success: false, message: "يرجى تسجيل الدخول لاستخدام كود الخصم" }
        }

        const foundCode = discountCodes.find((dc) => dc.code.toLowerCase() === code.toLowerCase() && dc.active)

        if (!foundCode) {
          return { success: false, message: "كود الخصم غير صالح" }
        }

        // التحقق مما إذا كان المستخدم قد استخدم هذا الكود من قبل (للكود ذو الاستخدام الواحد)
        if (foundCode.oneTimeUse && hasUserUsedCode(user.email, foundCode.id)) {
          return { success: false, message: "هذا الكود للاستخدام مرة واحدة فقط لكل مستخدم" }
        }

        // التحقق من تاريخ انتهاء الصلاحية
        if (foundCode.expiryDate && new Date(foundCode.expiryDate) < new Date()) {
          return { success: false, message: "كود الخصم منتهي الصلاحية" }
        }

        // التحقق من الحد الأقصى للاستخدام
        if (foundCode.maxUses && foundCode.currentUses >= foundCode.maxUses) {
          return { success: false, message: "تم الوصول إلى الحد الأقصى لاستخدام كود الخصم" }
        }

        // التحقق من الحد الأدنى لقيمة الطلب
        const cartTotal = getCartTotal()
        if (foundCode.minOrderValue && cartTotal < foundCode.minOrderValue) {
          return {
            success: false,
            message: `الحد الأدنى لقيمة الطلب هو ${foundCode.minOrderValue} ج.م`,
          }
        }

        // حساب قيمة الخصم
        let discountAmount = 0
        if (foundCode.discountType === "percentage") {
          discountAmount = (cartTotal * foundCode.discountValue) / 100
        } else if (foundCode.discountType === "shipping") {
          discountAmount = foundCode.discountValue
        }

        // لا نقوم بتحديث عدد مرات الاستخدام هنا، بل عند إتمام الطلب
        set({
          appliedDiscountCode: foundCode.code,
        })

        return {
          success: true,
          message: "تم تطبيق كود الخصم بنجاح",
          discount: discountAmount,
        }
      },

      getAppliedDiscount: () => {
        const { appliedDiscountCode, discountCodes, getCartTotal, user, hasUserUsedCode } = get()

        if (!appliedDiscountCode) return null

        const code = discountCodes.find((dc) => dc.code === appliedDiscountCode)
        if (!code) return null

        // التحقق مما إذا كان المستخدم قد استخدم هذا الكود من قبل في طلب سابق
        if (user && hasUserUsedCode(user.email, code.id)) {
          // إزالة كود الخصم المطبق إذا كان المستخدم قد استخدمه من قبل
          set({ appliedDiscountCode: null })
          return null
        }

        return {
          code: code.code,
          type: code.discountType,
          value: code.discountValue,
        }
      },

      removeAppliedDiscountCode: () => {
        set({ appliedDiscountCode: null })
      },

      setLanguage: (lang) => {
        set({ language: lang })
        if (typeof document !== "undefined") {
          document.documentElement.lang = lang === "ar" ? "ar" : "en"
          document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
        }
      },
    }),
    {
      name: "anaqati-store",
      // تخزين جميع بيانات المتجر بما في ذلك المستخدمين المسجلين وخيار تذكرني والتقييمات وأكواد الخصم
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
        discountCodes: state.discountCodes,
        appliedDiscountCode: state.appliedDiscountCode,
        discountCodeUsages: state.discountCodeUsages,
        language: state.language,
      }),
    },
  ),
)
