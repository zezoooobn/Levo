"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/lib/store"

type Product = {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  sizes?: string[]
  colors?: string[]
}

type Preferences = {
  event?: string
  gender?: "رجالي" | "نسائي" | "أطفال" | "غير محدد"
  style?: "كاجوال" | "كلاسيك" | "مودرن" | "ستريت" | "رياضي" | "غير محدد"
  color?: string
  budget?: "اقتصادي" | "متوسط" | "فاخر" | undefined
  weather?: "حار" | "بارد" | "معتدل" | undefined
}

type Outfit = {
  title: string
  items: { label: string; product?: Product }[]
  colors: string
  why: string
}

function loadProducts(): Product[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("admin-products")
  if (!stored) {
    // مجموعة افتراضية بسيطة للتجربة
    return [
      {
        id: 1,
        name: "قميص كاجوال",
        price: 299,
        originalPrice: 399,
        image: "/placeholder.svg?height=400&width=300",
        category: "رجالي",
        sizes: ["S", "M", "L", "XL"],
        colors: ["أسود", "أبيض", "أزرق"],
      },
      {
        id: 2,
        name: "فستان أنيق",
        price: 499,
        originalPrice: 599,
        image: "/placeholder.svg?height=400&width=300",
        category: "نسائي",
        sizes: ["S", "M", "L"],
        colors: ["أحمر", "أسود"],
      },
      {
        id: 3,
        name: "بنطلون جينز",
        price: 349,
        originalPrice: 449,
        image: "/placeholder.svg?height=400&width=300",
        category: "رجالي",
        sizes: ["30", "32", "34", "36"],
        colors: ["أزرق", "أسود"],
      },
      {
        id: 4,
        name: "تيشيرت قطني",
        price: 149,
        originalPrice: 199,
        image: "/placeholder.svg?height=400&width=300",
        category: "رجالي",
        sizes: ["S", "M", "L", "XL"],
        colors: ["أسود", "أبيض"],
      },
    ]
  }
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

function parseIntent(text: string): Preferences {
  const t = text.toLowerCase()
  const prefs: Preferences = {}
  // حدث
  if (/[wW]edding|زفاف|فرح/.test(t)) prefs.event = "زفاف"
  else if (/party|حفلة|عيد/.test(t)) prefs.event = "حفلة"
  else if (/work|شغل|عمل|office/.test(t)) prefs.event = "عمل"
  else if (/gym|تمرين|رياضة/.test(t)) prefs.event = "جيم"
  else if (/beach|بحر|شاطئ/.test(t)) prefs.event = "بحر"
  else if (/travel|سفر/.test(t)) prefs.event = "سفر"

  // ستايل
  if (/casual|كاجوال/.test(t)) prefs.style = "كاجوال"
  else if (/classy|formal|كلاسيك|رسمي/.test(t)) prefs.style = "كلاسيك"
  else if (/modern|مودرن/.test(t)) prefs.style = "مودرن"
  else if (/street|ستريت/.test(t)) prefs.style = "ستريت"
  else if (/sport|رياضي/.test(t)) prefs.style = "رياضي"

  // لون
  const colorMatch = t.match(/(أسود|أبيض|أزرق|أحمر|أخضر|بيج|رمادي|black|white|blue|red|green|beige|gray)/)
  if (colorMatch) prefs.color = colorMatch[1]

  // طقس
  if (/حار|hot/.test(t)) prefs.weather = "حار"
  else if (/بارد|cold/.test(t)) prefs.weather = "بارد"
  else if (/معتدل|mild/.test(t)) prefs.weather = "معتدل"

  // ميزانية
  if (/cheap|ميزانية|اقتصادي|رخيص/.test(t)) prefs.budget = "اقتصادي"
  else if (/mid|متوسط/.test(t)) prefs.budget = "متوسط"
  else if (/premium|فاخر|عالي/.test(t)) prefs.budget = "فاخر"

  // جنس
  if (/رجال|رجالي|men/.test(t)) prefs.gender = "رجالي"
  else if (/نساء|نسائي|women/.test(t)) prefs.gender = "نسائي"
  else if (/kids|أطفال/.test(t)) prefs.gender = "أطفال"
  else prefs.gender = "غير محدد"

  return prefs
}

function pickByName(products: Product[], tokens: string[]): Product | undefined {
  const lowerTokens = tokens.map((x) => x.toLowerCase())
  return products.find((p) => lowerTokens.some((tk) => p.name.toLowerCase().includes(tk)))
}

function buildOutfits(products: Product[], prefs: Preferences): Outfit[] {
  const isWomen = prefs.gender === "نسائي"

  // مرشّحات سريعة حسب الميزانية
  const byBudget = (ps: Product[]) => {
    if (prefs.budget === "اقتصادي") return ps.sort((a, b) => a.price - b.price)
    if (prefs.budget === "فاخر") return ps.sort((a, b) => b.price - a.price)
    return ps
  }

  const topsTokens = isWomen ? ["بلوزة", "تيشيرت", "قميص", "فستان"] : ["هودي", "تيشيرت", "قميص"]
  const bottomsTokens = isWomen ? ["تنورة", "بنطلون"] : ["بنطلون", "جينز", "شورت", "كارجو"]
  const outerTokens = ["جاكيت", "معطف", "كارديجان"]
  const accessoryTokens = ["حقيبة", "حزام", "قبعة"]

  const top1 = pickByName(byBudget(products), topsTokens)
  const bottom1 = pickByName(byBudget(products), bottomsTokens)
  const outer1 = prefs.weather === "بارد" ? pickByName(products, outerTokens) : undefined
  const acc1 = pickByName(products, accessoryTokens)

  const outfits: Outfit[] = []
  // 1) مظهر أساسي
  outfits.push({
    title: prefs.style === "كلاسيك" ? "إطلالة أنيقة بسيطة" : prefs.style === "ستريت" ? "ستريت نايت" : "كاجوال نظيف",
    items: [
      { label: top1 ? `${top1.name}` : isWomen ? "بلوزة ناعمة" : "تيشيرت قطني", product: top1 },
      { label: bottom1 ? `${bottom1.name}` : isWomen ? "تنورة مستقيمة" : "بنطلون جينز مستقيم", product: bottom1 },
      ...(outer1 ? [{ label: outer1.name, product: outer1 }] : []),
      ...(acc1 ? [{ label: acc1.name, product: acc1 }] : []),
    ],
    colors: prefs.color ? `${prefs.color} + محايد` : "ألوان محايدة (أسود/أبيض/رمادي)",
    why:
      prefs.event === "زفاف"
        ? "مثالي للمناسبات؛ نظيف ومريح دون مبالغة"
        : prefs.event === "حفلة"
          ? "جريء وخفيف؛ مناسب لأجواء الحفلات"
          : prefs.event === "عمل"
            ? "مرتب وعملي؛ يناسب المكتب"
            : "إطلالة متوازنة تصلح لمعظم الخروجات",
  })

  // 2) مظهر ثاني مختلف قليلاً
  const top2 = pickByName(products, isWomen ? ["فستان", "قميص"] : ["قميص", "هودي"]) || top1
  const bottom2 = pickByName(products, isWomen ? ["بنطلون", "تنورة"] : ["كارجو", "جينز"]) || bottom1
  outfits.push({
    title: prefs.style === "مودرن" ? "مودرن مريح" : "ستايل يومي مرتب",
    items: [
      { label: top2 ? top2.name : isWomen ? "قميص خفيف" : "هودي خفيف", product: top2 },
      { label: bottom2 ? bottom2.name : "بنطلون مريح", product: bottom2 },
    ],
    colors: prefs.color ? `${prefs.color} مع رمادي فاتح` : "درجات ترابية (بيج/رمادي)",
    why: prefs.weather === "حار" ? "أقمشة خفيفة لتنفس أفضل" : prefs.weather === "بارد" ? "طبقات تحفظ الدفء"
      : "مريح ومناسب للخروجات اليومية",
  })

  // 3) خيار إضافي عند الحفلات/الجيم
  if (prefs.event === "حفلة" || prefs.style === "ستريت" || prefs.event === "جيم") {
    const top3 = pickByName(products, ["تيشيرت", "هودي"]) || top1
    const bottom3 = pickByName(products, ["شورت", "كارجو"]) || bottom1
    outfits.push({
      title: prefs.event === "جيم" ? "رياضي خفيف" : "ترندي حديث",
      items: [
        { label: top3 ? top3.name : "تيشيرت مريح", product: top3 },
        { label: bottom3 ? bottom3.name : "شورت/بنطلون خفيف", product: bottom3 },
      ],
      colors: prefs.color ? `${prefs.color} أحادي مع لمعة بسيطة` : "داكن مع تفصيلة فضية",
      why: prefs.event === "جيم" ? "خفيف ومطاطي للحركة" : "حديث وغير مبالغ فيه",
    })
  }

  return outfits
}

export function FashionAssistant() {
  const [input, setInput] = useState("")
  const [prefs, setPrefs] = useState<Preferences>({ gender: "غير محدد" })
  const [products, setProducts] = useState<Product[]>([])
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [needsMore, setNeedsMore] = useState<string[]>([])
  const { addToWishlist } = useStore()

  useEffect(() => {
    setProducts(loadProducts())
  }, [])

  const missingKeys = useMemo(() => {
    const req: string[] = []
    if (!prefs.event) req.push("الحدث")
    if (!prefs.style || prefs.style === "غير محدد") req.push("الستايل")
    if (!prefs.gender || prefs.gender === "غير محدد") req.push("الجنس")
    return req
  }, [prefs])

  const onSubmit = () => {
    const parsed = parseIntent(input)
    const merged: Preferences = { ...prefs, ...parsed }
    setPrefs(merged)

    const needs: string[] = []
    if (!merged.event) needs.push("هل المناسبة رسمية أم كاجوال؟")
    if (!merged.style || merged.style === "غير محدد") needs.push("تفضل كاجوال، كلاسيك، مودرن، أم ستريت؟")
    if (!merged.gender || merged.gender === "غير محدد") needs.push("هل تبحث عن رجالي أم نسائي؟")
    setNeedsMore(needs)

    if (needs.length === 0) {
      setOutfits(buildOutfits(products, merged))
    } else {
      setOutfits([])
    }
  }

  const quickSet = (field: keyof Preferences, value: any) => setPrefs((p) => ({ ...p, [field]: value }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>مساعد الأزياء الذكي</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            أخبرني سريعًا عن المناسبة والستايل والطقس، وسأقترح لك أطقم جاهزة من المتجر.
          </p>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="مثال: عايز لبس حفلة ستريت بالأسود وبميزانية قليلة"
            />
            <Button onClick={onSubmit}>اقترح لي</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => quickSet("event", "زفاف")}>زفاف</Button>
            <Button variant="outline" onClick={() => quickSet("event", "حفلة")}>حفلة</Button>
            <Button variant="outline" onClick={() => quickSet("event", "عمل")}>عمل</Button>
            <Button variant="outline" onClick={() => quickSet("event", "جيم")}>جيم</Button>
            <Separator orientation="vertical" className="mx-1" />
            <Button variant="outline" onClick={() => quickSet("style", "كاجوال")}>كاجوال</Button>
            <Button variant="outline" onClick={() => quickSet("style", "كلاسيك")}>كلاسيك</Button>
            <Button variant="outline" onClick={() => quickSet("style", "مودرن")}>مودرن</Button>
            <Button variant="outline" onClick={() => quickSet("style", "ستريت")}>ستريت</Button>
            <Button variant="outline" onClick={() => quickSet("style", "رياضي")}>رياضي</Button>
            <Separator orientation="vertical" className="mx-1" />
            <Button variant="outline" onClick={() => quickSet("gender", "رجالي")}>رجالي</Button>
            <Button variant="outline" onClick={() => quickSet("gender", "نسائي")}>نسائي</Button>
            <Separator orientation="vertical" className="mx-1" />
            <Button variant="outline" onClick={() => quickSet("weather", "حار")}>طقس حار</Button>
            <Button variant="outline" onClick={() => quickSet("weather", "بارد")}>طقس بارد</Button>
            <Button variant="outline" onClick={() => quickSet("budget", "اقتصادي")}>اقتصادي</Button>
            <Button variant="outline" onClick={() => quickSet("budget", "فاخر")}>فاخر</Button>
          </div>

          {needsMore.length > 0 && (
            <div className="bg-yellow-50 text-yellow-700 p-3 rounded-md text-sm">
              {needsMore.map((q) => (
                <div key={q}>• {q}</div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {outfits.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm">
            تم! بناءً على طلبك، هذه أفضل الاقتراحات لك:
          </div>

          {outfits.map((o, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-lg">{idx + 1}. {o.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  {o.items.map((it, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span>• {it.label}</span>
                      {it.product && (
                        <div className="flex items-center gap-2">
                          <Link className="text-primary hover:underline" href={`/products/${it.product.id}`}>
                            المنتج الموصى به: {it.product.name} – كود {it.product.id}
                          </Link>
                          <Button size="sm" variant="outline" onClick={() => addToWishlist({
                            id: it.product!.id,
                            name: it.product!.name,
                            price: it.product!.price,
                            originalPrice: it.product!.originalPrice || it.product!.price,
                            image: it.product!.image,
                            category: it.product!.category,
                          })}>قلب</Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">تناسق الألوان: {o.colors}</div>
                <div className="text-sm">لماذا يناسبك: {o.why}</div>
                <div className="text-xs text-muted-foreground">نصيحة: اطوِ الأكمام مرة لإطلالة أنظف، واختر مقاسًا مريحًا.</div>
              </CardContent>
            </Card>
          ))}

          <div className="text-sm">
            تحب ألوان أخرى أو خيار أكثر كاجوال؟ أخبرني، أعد التوصيات فورًا.
          </div>
        </div>
      )}
    </div>
  )
}