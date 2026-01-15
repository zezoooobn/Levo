"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Heart, Send, ShoppingCart, ExternalLink } from "lucide-react"
import { useStore } from "@/lib/store"
import { ChatMessage, OutfitRecommendation } from "@/types/chat"
import { parseIntent, recommend, formatReply } from "@/lib/chat-functions"
import { searchWeb } from "@/lib/web-search"
import { useRouter } from "next/navigation"

interface ChatInterfaceProps {
  onHeightChange?: (height: number) => void
}

function loadProducts() {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("admin-products")
  if (!stored) return []
  try {
    const adminProducts = JSON.parse(stored)
    return adminProducts.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice || p.price,
      image: p.images?.[0] || "/placeholder.svg?height=400&width=300",
      category: p.category,
      sizes: p.sizes || [],
      colors: p.colors || [],
    }))
  } catch {
    return []
  }
}

function OutfitCard({ outfit, onWishlistClick, isInWishlist }: { 
  outfit: OutfitRecommendation
  onWishlistClick: (product: any) => void
  isInWishlist: (id: number) => boolean
}) {
  return (
    <Card className="p-4 mb-3">
      <div className="space-y-3">
        <h4 className="font-semibold text-lg">{outfit.title}</h4>
        <div className="space-y-2">
          {outfit.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-sm">• {item.label}</span>
              {item.product && (
                <div className="flex items-center gap-2">
                  <a 
                    href={`/products/${item.product.id}`}
                    className="text-primary hover:underline text-sm"
                  >
                    عرض المنتج
                  </a>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onWishlistClick(item.product)}
                    className={isInWishlist(item.product.id) ? "text-red-500" : ""}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist(item.product.id) ? "fill-current" : ""}`} />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          <div>تناسق الألوان: {outfit.colors}</div>
          <div>لماذا يناسبك: {outfit.why}</div>
          <div className="text-xs mt-2">نصيحة: {outfit.stylingTip}</div>
        </div>
      </div>
    </Card>
  )
}

function isGreeting(text: string) {
  return /(مرحبا|اهلا|أهلاً|هلا|السلام عليكم|سلام|هاي|hello|hi)/i.test(text.trim())
}

function wantsRecommendations(text: string) {
  const base = /(توصيات|اقترح|رشح|اختيارات|اقتراحات|ساعدني اختار|اختارلي|اختر لي|نسق|تنسيق|طقم|outfit|لوكات|look|pick|ارشحلي|عايز هدوم|فرجيني|وريني|مش لاقي|ابعتلي صور|عايز لبس|set)/i.test(text)
  if (!(window as any).__intentsCache && typeof window !== 'undefined') {
    ;(window as any).__intentsCache = null
    fetch('/ai/intents.json').then(r => r.json()).then(j => { (window as any).__intentsCache = j }).catch(() => {})
  }
  const intents = (typeof window !== 'undefined' ? (window as any).__intentsCache : null)
  return base || !!intents?.recommend_outfit?.some((p: string) => text.includes(p))
}

function isOnTopic(text: string, prefs: any) {
  const hasPrefs = prefs.occasion || prefs.style || prefs.gender || prefs.color || prefs.budget
  const topicMatch = /(ملابس|قميص|شميز|تيشيرت|بنطلون|فستان|حذاء|جاكيت|موضة|ستايل|طقم|تنسيق|لوك|outfit|look|مقاس|مقاسات|لون|سعر|أسعار|منتج|صورة|شراء|متجر|موقع|طلب|شحن|مرتجع|ارجاع|سياسة|خصم|عروض|دفع|فيزا|كاش|تواصل|دعم|خدمة|واتساب|مين|من أنت|انت مين|مساعد|اوفر ?سايز|oversize|سليم|slim|ريجلر|regular|xl|xxl|large|small|medium|login|تسجيل|نسيت الباسورد|لينك المنتج|فروع|مكانكم|الموقع|بيعلق|مشكلة في الطلب|كمل طلب الشراء|سلة|اضافة للسلة)/i.test(text)
  return topicMatch || hasPrefs || wantsRecommendations(text) || /منتج|product/i.test(text)
}

function mentionsProduct(text: string) {
  const base = /(قميص|شميز|تيشيرت|تي شيرت|هودي|سويت ?شيرت|كنزة|سويتر|بلوزة|بنطلون|بنطال|سروال|جينز|شورت|كارجو|تشينو|فستان|تنورة|جيبة|جاكيت|جاكت|معطف|كووت|كارديجان|بلوفر|حذاء|جزمة|كوتشي|حقيبة|شنطة|حزام|كاب|قبعة|ترينج|عباية|جلابية|set|outfit)/i.test(text)
  if (!(window as any).__dictCache && typeof window !== 'undefined') {
    ;(window as any).__dictCache = null
    fetch('/ai/product_dictionary.json').then(r => r.json()).then(j => { (window as any).__dictCache = j }).catch(() => {})
  }
  const dict = (typeof window !== 'undefined' ? (window as any).__dictCache : null)
  const all = dict ? Object.values(dict).flat() as string[] : []
  return base || all.some((t: string) => text.includes(t))
}

function isFiller(text: string) {
  return /(بقولك ايه|بص|اسمع|طيب|تمام|اوكي|ماشي|ايوه|طب)/i.test(text.trim())
}

function wantsWeb(text: string) {
  return /(ابحث|بحث|جوجل|google|search|دور)/i.test(text)
}

function wantsNavigate(text: string) {
  return /(افتح صفحة|افتح قسم|فين القسم|اعرض صفحة|اعرض قسم|افتح القمصان|القميص|الترينجات|الفساتين|الجاكيتات)/i.test(text)
}

function normalize(text: string) {
  let s = text.toLowerCase()
  s = s.replace(/([\u0621-\u064A])\1{2,}/g, '$1')
  s = s.replace(/[\u064B-\u0652]/g, '')
  return s
}

function getTemplate(intent: string) {
  const key = intent
  const cacheKey = '__templatesCache'
  const w: any = typeof window !== 'undefined' ? window : {}
  const cached = w[cacheKey]
  const fallback: any = {
    greeting: "أهلاً! كيف أقدر أساعدك؟",
    help_request: "أكيد هساعدك! تحب أساعدك في إيه: اختيار مقاس، ترشيحات طقم، أو معلومات القماش/الألوان/الأسعار؟",
    choose_size: "قلّي طولك ووزنك والموديل اللي تفضّله (أوفر سايز/سليم/عادي).",
    outfit_recommendation: "تمام، هرشّح لك اختيارات مناسبة من منتجاتنا.",
    ask_fabric: "الخامات المتاحة: قطن، بوليستر، ليكرا، كتان، شيفون، فسكوز، ستريتش.",
    ask_colors: "الألوان المتاحة حسب المنتج. تفضّل فاتح، غامق، أو ترابي؟",
    ask_price: "الأسعار موجودة بكل صفحة منتج. تحب أفلتر لك اقتصادي/متوسط/فاخر؟",
    availability: "اذكر اسم المنتج أو وصفه وسأتحقق من التوفر بالمقاس واللون.",
    shipping: "وقت الشحن يعتمد على موقعك. تحب أعرف الوقت التقريبي لمدينتك؟",
    returns: "الاسترجاع متاح ضمن المدة وبحالة المنتج الأصلية. تحب الخطوات؟",
    site_issue: "جرّب تحديث الصفحة. لو المشكلة مستمرة، قلّي التفاصيل وسأساعدك.",
    unclear: "وضّح أكثر: مقاس، قماش، لون، ميزانية، أو ترشيحات طقم؟"
  }
  if (!cached && typeof window !== 'undefined') {
    w[cacheKey] = null
    fetch('/ai/response_templates.json').then(r => r.json()).then(j => { w[cacheKey] = j }).catch(() => {})
  }
  const data = w[cacheKey] || {}
  return data[key] || fallback[key] || fallback['unclear']
}

function detectIntent(text: string): string {
  const t = normalize(text)
  if (isGreeting(t)) return 'greeting'
  if (wantsRecommendations(t) || mentionsProduct(t)) return 'outfit_recommendation'
  if (/(ساعدني|محتاج مساعده|مش عارف اختار|اختارلي|انا تايه)/i.test(t)) return 'help_request'
  if (/(مقاس|سايز|size|جدول المقاسات|ضيق|واسع)/i.test(t)) return 'choose_size'
  if (/(خامة|القماش|قطن|بوليستر|ليكرا|كتان|شيفون|ستان|فسكوز|ستريتش|بيعرق|يمدد|ينكمش|بيتكسر|طري|ناشف)/i.test(t)) return 'ask_fabric'
  if (/(لون|ألوان|يبهت|فاتح|غامق|ترابي)/i.test(t)) return 'ask_colors'
  if (/(سعر|بكام|رخيص|غالي|خصم|عرض|كود)/i.test(t)) return 'ask_price'
  if (/(متوفر|available|في منه)/i.test(t)) return 'availability'
  if (/(شحن|يوصل|مدة|مندوب|متابعة)/i.test(t)) return 'shipping'
  if (/(ارجاع|استبدال|شروط|فلوس|مش مناسب|عيب)/i.test(t)) return 'returns'
  if (/(الموقع|بيعلق|مش فاتح|السلة|الدفع|فشل|مش عارف اكمل|refresh|لينك)/i.test(t)) return 'site_issue'
  return 'unclear'
}

function answerGeneral(text: string): string | null {
  if (/(مين|من أنت|انت مين|who are you)/i.test(text)) {
    return "أنا مساعد ذكي لمتجر الملابس، أساعدك في اختيار وتنسيق الأطقم والإجابة عن أسئلة الموقع." 
  }
  if (/(سعر|أسعار|رخيص|غالي|ارخص|price)/i.test(text)) {
    return "عندنا خيارات اقتصادية ومتوسطة وفاخرة. الأسعار واضحة بكل صفحة منتج، وتقدر تشوف العروض والخصومات في قسم العروض." 
  }
  if (/(شحن|توصيل|delivery)/i.test(text)) {
    return "نوفر شحن سريع. تفاصيل التكلفة ومدة الشحن موجودة في صفحة الشحن داخل الموقع." 
  }
  if (/(مرتجع|ارجاع|استرجاع|سياسة)/i.test(text)) {
    return "سياسة الاسترجاع مبينة في صفحة السياسات. تقدر ترجع المنتجات ضمن المدة المحددة إذا كانت بحالتها الأصلية." 
  }
  if (/(خصم|كوبون|عرض|عروض|promo|coupon)/i.test(text)) {
    return "تابع صفحة العروض للحصول على أحدث الخصومات والكوبونات المتاحة." 
  }
  if (/(دفع|payment|visa|ماستر|كاش)/i.test(text)) {
    return "ندعم طرق دفع متعددة مثل البطاقات والدفع عند الاستلام حيثما يتوفر. تفاصيل الدفع موجودة أثناء إتمام الطلب." 
  }
  if (/(مقاس|مقاسات|size|متوفر|available|نفد)/i.test(text)) {
    return "المقاسات والتوفر يظهران داخل صفحة المنتج. إن احتجت مساعدة بالمقاس، أخبرني بطولك ووزنك والستايل المفضل لأقترح الأنسب." 
  }
  if (/(تواصل|دعم|خدمة|واتساب|support|contact)/i.test(text)) {
    return "تقدر تتواصل مع خدمة العملاء عبر نموذج التواصل بالموقع أو الواتساب إن كان متاحاً." 
  }
  if (/(login|تسجيل|ادخل الحساب|سجلني|نسيت الباسورد|password)/i.test(text)) {
    return "تقدر تدخل حسابك من صفحة تسجيل الدخول، ولو نسيت الباسورد استخدم خيار الاستعادة." 
  }
  if (/(فروع|مكانكم|عنوان|location)/i.test(text)) {
    return "معلومات الفروع والعناوين موجودة في صفحة من نحن/التواصل إن كانت متاحة." 
  }
  if (/(لينك المنتج|ابعتلي لينك|الرابط)/i.test(text)) {
    return "اذكر اسم المنتج أو صفه وسأرسل لك رابط صفحته إن كان متوفراً." 
  }
  if (/(الموقع|بيعلق|مش بيفتح|مشكلة في الطلب|كمل طلب الشراء)/i.test(text)) {
    return "لو واجهت مشكلة تقنية، جرّب تحديث الصفحة أو استخدام متصفح مختلف. أبلغني بالمشكلة وسأساعدك خطوة بخطوة." 
  }
  return null
}

export function ChatInterface({ onHeightChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [preferences, setPreferences] = useState({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { addToWishlist, isInWishlist, isLoggedIn, addToCart } = useStore()

  useEffect(() => {
    const savedMessages = localStorage.getItem("assistant-chat")
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages)
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })))
      } catch {
        setWelcomeMessage()
      }
    } else {
      setWelcomeMessage()
    }
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("assistant-chat", JSON.stringify(messages))
    }
  }, [messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function setWelcomeMessage() {
    setMessages([{
      id: "welcome-1",
      type: "assistant",
      content: "أهلاً وسهلاً! أنا مساعدك الذكي لاختيار الملابس. أخبرني عن المناسبة، الستايل، والألوان المفضلة لديك، وسأقترح لك أطقم مميزة من متجرنا.",
      timestamp: new Date()
    }])
  }

  const handleSend = async () => {
    if (!input.trim()) return
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: input,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsTyping(true)
    setTimeout(async () => {
      const lower = normalize(input)
      const intent = detectIntent(lower)
      if (isGreeting(lower)) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          type: "assistant",
          content: getTemplate('greeting'),
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
        setIsTyping(false)
        return
      }
      const parsedPrefs = parseIntent(input)
      if (intent === 'help_request') {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: getTemplate('help_request'),
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
        setIsTyping(false)
        return
      }
      if (!isOnTopic(lower, parsedPrefs) && !isFiller(lower)) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          type: "assistant",
          content: "أنا فقط أتحدث في أسئلتك الخاصة بالموقع والملابس.",
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
        setIsTyping(false)
        return
      }
      if (wantsWeb(lower)) {
        const results = await searchWeb(input)
        const text = results.length > 0 
          ? `بحثت لك ووجدت ${results.length} نتائج مفيدة. هل تحب أقدّم لك ملخصًا أو أفتح الروابط؟\n- ${results.map(r => r.title).slice(0,3).join("\n- ")}`
          : "حاولت البحث ولكن لم أستطع الوصول لنتائج الآن. أخبرني بالقطعة أو الستايل المطلوب وسأرشّح اختيارات من متجرنا."
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          type: "assistant",
          content: text,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
        setIsTyping(false)
        return
      }
      if (wantsNavigate(lower)) {
        router.push('/products')
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: 'تم فتح صفحة المنتجات؛ تقدر تختار القسم المناسب وتفلتر على راحتك.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
        setIsTyping(false)
        return
      }
      const general = answerGeneral(lower)
      if (general) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          type: "assistant",
          content: general,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
        setIsTyping(false)
        return
      }
      const mergedPrefs = { ...preferences, ...parsedPrefs }
      setPreferences(mergedPrefs)
      const products = loadProducts()
      const doRecommend = intent === 'outfit_recommendation' || wantsRecommendations(lower) || mentionsProduct(lower)
      const outfits = doRecommend ? recommend(mergedPrefs, products) : []
      const replyContent = intent === 'ask_fabric' ? getTemplate('ask_fabric')
        : intent === 'ask_colors' ? getTemplate('ask_colors')
        : intent === 'ask_price' ? getTemplate('ask_price')
        : intent === 'choose_size' ? getTemplate('choose_size')
        : intent === 'returns' ? getTemplate('returns')
        : intent === 'shipping' ? getTemplate('shipping')
        : formatReply(input, mergedPrefs, outfits)
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content: replyContent,
        timestamp: new Date(),
        outfits: doRecommend ? outfits : undefined
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleWishlistClick = (product: any) => {
    if (!isLoggedIn) {
      router.push("/login?redirect=/assistant")
      return
    }
    addToWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      image: product.image,
      category: product.category,
    })
  }

  const handleAddToCart = (product: any) => {
    if (!isLoggedIn) {
      router.push("/login?redirect=/assistant")
      return
    }
    const size = product.sizes?.[0] || "افتراضي"
    const color = product.colors?.[0] || "افتراضي"
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      quantity: 1,
      image: product.image,
      size,
      color,
    })
  }

  return (
    <div className="flex flex-col h-[600px] bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] ${message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <div className="px-4 py-2 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.type === "assistant" && message.outfits && (
                  <div className="mt-3 space-y-2">
                    {(message.outfits || []).flatMap((o) => o.items)
                      .filter((it) => it.product)
                      .map((it, idx) => (
                        <ProductChip
                          key={`${message.id}-p-${idx}`}
                          product={it.product}
                          onAddToCart={handleAddToCart}
                          onWishlistClick={handleWishlistClick}
                          isInWishlist={isInWishlist}
                        />
                      ))}
                  </div>
                )}
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب رسالتك هنا... (Enter للإرسال، Shift+Enter للسطر الجديد)"
            className="flex-1"
            disabled={isTyping}
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isTyping}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
function ProductChip({ product, onAddToCart, onWishlistClick, isInWishlist }: {
  product: any
  onAddToCart: (product: any) => void
  onWishlistClick: (product: any) => void
  isInWishlist: (id: number) => boolean
}) {
  if (!product) return null
  return (
    <div className="flex items-center justify-between gap-3 bg-card rounded-md p-2 border">
      <div className="flex items-center gap-2">
        <img src={product.image} alt={product.name} className="w-14 h-14 object-cover rounded" />
        <div>
          <div className="text-sm font-medium">{product.name}</div>
          <div className="text-xs text-muted-foreground">{product.price} ج.م</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <a href={`/products/${product.id}`} className="text-sm" aria-label="عرض المنتج">
          <ExternalLink className="h-4 w-4" />
        </a>
        <Button size="sm" variant="default" onClick={() => onAddToCart(product)} aria-label="أضف للسلة">
          <ShoppingCart className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onWishlistClick(product)}
          className={isInWishlist(product.id) ? "text-red-500" : ""}
          aria-label="أضف للمفضلة"
        >
          <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
        </Button>
      </div>
    </div>
  )
}