import { UserPreferences, Product, OutfitRecommendation } from '@/types/chat'

export function parseIntent(text: string): UserPreferences {
  const t = text.toLowerCase()
  const prefs: UserPreferences = {}
  
  // حدث
  if (/[wW]edding|زفاف|فرح|خطوبة/.test(t)) prefs.occasion = "زفاف"
  else if (/party|حفلة|عيد|ميلاد/.test(t)) prefs.occasion = "حفلة"
  else if (/work|شغل|عمل|office/.test(t)) prefs.occasion = "عمل"
  else if (/gym|تمرين|رياضة|سبور/.test(t)) prefs.occasion = "جيم"
  else if (/beach|بحر|شاطئ/.test(t)) prefs.occasion = "بحر"
  else if (/travel|سفر/.test(t)) prefs.occasion = "سفر"
  else if (/خروجة|خروج|جامعة|بيت|سهرة/.test(t)) prefs.occasion = "خروجة"

  // ستايل
  if (/(casual|كاجوال|كجوال|كجول|سبور)/.test(t)) prefs.style = "كاجوال"
  else if (/(classy|formal|فورمال|كلاسيكي|كلاسيك|رسمي|smart)/.test(t)) prefs.style = "كلاسيك"
  else if (/(modern|مودرن|حديث|ترندي|عصري)/.test(t)) prefs.style = "مودرن"
  else if (/(street|ستريت|شارع|هيب ?هوب)/.test(t)) prefs.style = "ستريت"
  else if (/(sport|رياضي|سبورت|gym|تمرين)/.test(t)) prefs.style = "رياضي"
  else if (/(سمارت ?كاجوال|smart ?casual)/.test(t)) prefs.style = "كاجوال"

  // لون
  const colorMatch = t.match(/(أسود|أبيض|أزرق|سماوي|أحمر|أخضر|بيج|رمادي|رصاصي|كحلي|نبيتي|خمري|بنفسجي|موف|وردي|زهري|برتقالي|أصفر|بني|زيتوني|زيتي|تركواز|ذهبي|فضي|black|white|blue|sky|red|green|beige|gray|navy|maroon|purple|pink|orange|yellow|brown|olive|turquoise|gold|silver)/)
  if (colorMatch) prefs.color = colorMatch[1]

  // طقس
  if (/حار|hot/.test(t)) prefs.weather = "حار"
  else if (/بارد|cold/.test(t)) prefs.weather = "بارد"
  else if (/معتدل|mild/.test(t)) prefs.weather = "معتدل"
  else if (/صيفي|summer/.test(t)) prefs.weather = "حار"
  else if (/شتوي|winter/.test(t)) prefs.weather = "بارد"

  // ميزانية
  if (/cheap|ميزانية|اقتصادي|رخيص|سعر مناسب|على قد الميزانية/.test(t)) prefs.budget = "اقتصادي"
  else if (/mid|متوسط/.test(t)) prefs.budget = "متوسط"
  else if (/premium|فاخر|عالي/.test(t)) prefs.budget = "فاخر"

  // جنس
  if (/(رجال|رجالي|رجالة|men|شباب|رجالى)/.test(t)) prefs.gender = "رجالي"
  else if (/(نساء|نسائي|حريمي|ستات|بنات|women|حريمى)/.test(t)) prefs.gender = "نسائي"
  else if (/(kids|أطفال|ولادي|ولادى|صغار|بيبي|اطفال)/.test(t)) prefs.gender = "أطفال"

  // القياس/القصّة
  if (/oversize|اوفر ?سايز|واسع|loose/.test(t)) prefs.fit = "أوفر سايز"
  else if (/slim|سليم|ضيق/.test(t)) prefs.fit = "سليم"
  else if (/regular|ريجلر|عادي/.test(t)) prefs.fit = "عادي"
  if (/plus ?size|مقاسات كبيرة|كبير|xl|xxl|3xl/.test(t)) prefs.size = "كبير"
  else if (/small|سمول/.test(t)) prefs.size = "صغير"
  else if (/medium|ميديم|ميديام|مديم/.test(t)) prefs.size = "متوسط"
  else if (/large|لارج/.test(t)) prefs.size = "كبير"
  else if (/size|سايز|مقاس/.test(t)) prefs.size = (t.match(/(xs|s|m|l|xl|xxl|3xl)/) || [])[1] || prefs.size

  // القماش
  if (/(قطن|cotton)/.test(t)) prefs.fabric = "قطن"
  else if (/(بوليستر|polyester)/.test(t)) prefs.fabric = "بوليستر"
  else if (/(ليكرا|lycra)/.test(t)) prefs.fabric = "ليكرا"
  else if (/(صوف)/.test(t)) prefs.fabric = "صوف"
  else if (/(حرير)/.test(t)) prefs.fabric = "حرير"
  else if (/(جينز)/.test(t)) prefs.fabric = "جينز"
  else if (/(مخمل|قطيفة)/.test(t)) prefs.fabric = "قطيفة"
  else if (/(كتان)/.test(t)) prefs.fabric = "كتان"
  else if (/(شيفون)/.test(t)) prefs.fabric = "شيفون"
  else if (/(ستان)/.test(t)) prefs.fabric = "ستان"
  else if (/(فسكوز|viscose)/.test(t)) prefs.fabric = "فسكوز"
  else if (/(ستريتش|stretch|مطاط)/.test(t)) prefs.fabric = "ستريتش"

  // شفافية/راحة
  if (/(مش شفافة|غير شفافة|opaque)/.test(t)) prefs.opaque = true
  if (/(مش لازق|غير ضيق|مريح للحركة)/.test(t)) prefs.fit = prefs.fit || "عادي"

  return prefs
}

export function recommend(prefs: UserPreferences, products: Product[]): OutfitRecommendation[] {
  const isWomen = prefs.gender === "نسائي"
  
  // مرشّحات سريعة حسب الميزانية
  const byBudget = (ps: Product[]) => {
    if (prefs.budget === "اقتصادي") return ps.sort((a, b) => a.price - b.price)
    if (prefs.budget === "فاخر") return ps.sort((a, b) => b.price - a.price)
    return ps
  }

  const topsTokens = isWomen 
    ? ["بلوزة", "تيشيرت", "تي شيرت", "قميص", "شيميز", "فستان", "كنزة", "سويتر", "ترينج", "ترينينج", "سويت بانتس"]
    : ["هودي", "تيشيرت", "تي شيرت", "قميص", "سويت شيرت", "كنزة", "ترينج", "ترينينج", "سويت بانتس"]
  const bottomsTokens = isWomen 
    ? ["تنورة", "جيبة", "بنطلون", "بنطال", "سروال", "جينز", "شورت"] 
    : ["بنطلون", "بنطال", "سروال", "جينز", "شورت", "كارجو", "تشينو"]
  const outerTokens = ["جاكيت", "جاكت", "معطف", "كووت", "كارديجان", "بلوفر"]
  const accessoryTokens = ["حقيبة", "شنطة", "حزام", "كاب", "قبعة", "شرابات", "جوارب", "كلسات"]

  const pickByName = (products: Product[], tokens: string[]): Product | undefined => {
    const lowerTokens = tokens.map((x) => x.toLowerCase())
    return products.find((p) => lowerTokens.some((tk) => p.name.toLowerCase().includes(tk)))
  }

  const top1 = pickByName(byBudget(products), topsTokens)
  const bottom1 = pickByName(byBudget(products), bottomsTokens)
  const outer1 = prefs.weather === "بارد" ? pickByName(products, outerTokens) : undefined
  const acc1 = pickByName(products, accessoryTokens)

  const outfits: OutfitRecommendation[] = []
  
  // 1) مظهر أساسي
  outfits.push({
    id: `outfit-1`,
    title: prefs.style === "كلاسيك" ? "إطلالة أنيقة بسيطة" : prefs.style === "ستريت" ? "ستريت نايت" : "كاجوال نظيف",
    items: [
      { label: top1 ? `${top1.name}` : isWomen ? "بلوزة ناعمة" : "تيشيرت قطني", product: top1 },
      { label: bottom1 ? `${bottom1.name}` : isWomen ? "تنورة مستقيمة" : "بنطلون جينز مستقيم", product: bottom1 },
      ...(outer1 ? [{ label: outer1.name, product: outer1 }] : []),
      ...(acc1 ? [{ label: acc1.name, product: acc1 }] : []),
    ],
    colors: prefs.color ? `${prefs.color} + محايد` : "ألوان محايدة (أسود/أبيض/رمادي)",
    why: prefs.occasion === "زفاف" ? "مثالي للمناسبات؛ نظيف ومريح دون مبالغة"
      : prefs.occasion === "حفلة" ? "جريء وخفيف؛ مناسب لأجواء الحفلات"
      : prefs.occasion === "عمل" ? "مرتب وعملي؛ يناسب المكتب"
      : "إطلالة متوازنة تصلح لمعظم الخروجات",
    stylingTip: "اطوِ الأكمام مرة لإطلالة أنظف، واختر مقاسًا مريحًا."
  })

  // 2) مظهر ثاني مختلف قليلاً
  const top2 = pickByName(products, isWomen ? ["فستان", "قميص"] : ["قميص", "هودي"]) || top1
  const bottom2 = pickByName(products, isWomen ? ["بنطلون", "تنورة"] : ["كارجو", "جينز"]) || bottom1
  outfits.push({
    id: `outfit-2`,
    title: prefs.style === "مودرن" ? "مودرن مريح" : "ستايل يومي مرتب",
    items: [
      { label: top2 ? top2.name : isWomen ? "قميص خفيف" : "هودي خفيف", product: top2 },
      { label: bottom2 ? bottom2.name : "بنطلون مريح", product: bottom2 },
    ],
    colors: prefs.color ? `${prefs.color} مع رمادي فاتح` : "درجات ترابية (بيج/رمادي)",
    why: prefs.weather === "حار" ? "أقمشة خفيفة لتنفس أفضل" 
      : prefs.weather === "بارد" ? "طبقات تحفظ الدفء"
      : "مريح ومناسب للخروجات اليومية",
    stylingTip: "نسق الألوان المتقاربة لإطلالة متناغمة."
  })

  // 3) خيار إضافي عند الحفلات/الجيم
  if (prefs.occasion === "حفلة" || prefs.style === "ستريت" || prefs.occasion === "جيم") {
    const top3 = pickByName(products, ["تيشيرت", "هودي"]) || top1
    const bottom3 = pickByName(products, ["شورت", "كارجو"]) || bottom1
    outfits.push({
      id: `outfit-3`,
      title: prefs.occasion === "جيم" ? "رياضي خفيف" : "ترندي حديث",
      items: [
        { label: top3 ? top3.name : "تيشيرت مريح", product: top3 },
        { label: bottom3 ? bottom3.name : "شورت/بنطلون خفيف", product: bottom3 },
      ],
      colors: prefs.color ? `${prefs.color} أحادي مع لمعة بسيطة` : "داكن مع تفصيلة فضية",
      why: prefs.occasion === "جيم" ? "خفيف ومطاطي للحركة" : "حديث وغير مبالغ فيه",
      stylingTip: "أضف إكسسوار بسيط لإكمال الإطلالة."
    })
  }

  return outfits
}

export function formatReply(userMessage: string, preferences: UserPreferences, outfits: OutfitRecommendation[]): string {
  const hasCompletePreferences = preferences.occasion && preferences.style && preferences.gender
  
  let reply = ""
  
  // تأكيد الطلب
  if (hasCompletePreferences) {
    reply += "تم فهم طلبك! "
    if (preferences.occasion) reply += `لمناسبة ${preferences.occasion}، `
    if (preferences.style) reply += `بستايل ${preferences.style}، `
    if (preferences.gender) reply += `لل${preferences.gender}. `
    if (preferences.fit) reply += `بقصّة ${preferences.fit}. `
    if (preferences.size) reply += `مقاس مبدئي: ${preferences.size}. `
    if (preferences.color) reply += `لون مفضل: ${preferences.color}. `
    if (preferences.fabric) reply += `خامة: ${preferences.fabric}. `
    if (preferences.opaque) reply += `غير شفافة. `
  } else {
    reply += "أحتاج لبعض التفاصيل لمساعدتك بشكل أفضل. "
  }
  
  // عرض التوصيات
  if (outfits.length > 0) {
    reply += `إليك ${outfits.length} اقتراحات متنوعة: `
  }
  
  // سؤال المتابعة
  if (!preferences.occasion) {
    reply += "ما المناسبة التي تبحث عنها؟ (عمل، حفلة، زفاف، إلخ)"
  } else if (!preferences.style) {
    reply += "ما الستايل المفضل لديك؟ (كاجوال، كلاسيك، مودرن، ستريت)"
  } else if (!preferences.gender) {
    reply += "هل تبحث عن ملابس رجالية أم نسائية؟"
  } else if (!preferences.fit) {
    reply += "تفضّل قصّة معينة؟ (أوفر سايز، سليم، عادي)"
  } else if (!preferences.color) {
    reply += "هل لديك لون مفضل؟"
  } else if (!preferences.budget) {
    reply += "ما الميزانية المتوقعة؟ (اقتصادي، متوسط، فاخر)"
  } else if (!preferences.fabric) {
    reply += "تفضّل خامة معينة؟ (قطن، بوليستر، ليكرا، كتان، شيفون...)"
  } else {
    reply += "هل ترغب في تعديل الألوان أو إضافة قطع أخرى؟"
  }
  
  return reply
}