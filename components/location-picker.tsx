"use client"

import { useState } from "react"
import { MapPin, Map, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface LocationPickerProps {
  onLocationSelected: (address: string, buildingNumber?: string) => void
}

const EGYPT_GOVERNORATES = [
  // محافظات الحدود والمناطق الخاصة
  { id: "cairo", name: "القاهرة", type: "special" },
  { id: "giza", name: "الجيزة", type: "upper" }, // غالباً تصنف تبع القاهرة الكبرى ولكن جغرافياً بداية الصعيد
  { id: "alexandria", name: "الإسكندرية", type: "delta" },
  { id: "port_said", name: "بورسعيد", type: "canal" },
  { id: "suez", name: "السويس", type: "canal" },
  { id: "ismailia", name: "الإسماعيلية", type: "canal" },
  
  // الدلتا
  { id: "dakahlia", name: "الدقهلية", type: "delta" },
  { id: "gharbia", name: "الغربية", type: "delta" },
  { id: "kafr_el_sheikh", name: "كفر الشيخ", type: "delta" },
  { id: "sharqia", name: "الشرقية", type: "delta" },
  { id: "monufia", name: "المنوفية", type: "delta" },
  { id: "qalyubia", name: "القليوبية", type: "delta" },
  { id: "beheira", name: "البحيرة", type: "delta" },
  { id: "damietta", name: "دمياط", type: "delta" },

  // الوجه القبلي
  { id: "faiyum", name: "الفيوم", type: "upper" },
  { id: "beni_suef", name: "بني سويف", type: "upper" },
  { id: "minya", name: "المنيا", type: "upper" },
  { id: "asyut", name: "أسيوط", type: "upper" },
  { id: "sohag", name: "سوهاج", type: "upper" },
  { id: "qena", name: "قنا", type: "upper" },
  { id: "luxor", name: "الأقصر", type: "upper" },
  { id: "aswan", name: "أسوان", type: "upper" },

  // الحدود
  { id: "matrouh", name: "مطروح", type: "border" },
  { id: "north_sinai", name: "شمال سيناء", type: "border" },
  { id: "south_sinai", name: "جنوب سيناء", type: "border" },
  { id: "red_sea", name: "البحر الأحمر", type: "border" },
  { id: "new_valley", name: "الوادي الجديد", type: "border" },
]

export function LocationPicker({ onLocationSelected }: LocationPickerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAddress, setSelectedAddress] = useState<string>("")
  const [mapUrl, setMapUrl] = useState<string | null>(null)

  const handleGetLocation = async () => {
    setIsLoading(true)

    try {
      if (!navigator.geolocation) {
        toast({
          title: "غير مدعوم",
          description: "متصفحك لا يدعم تحديد الموقع الجغرافي",
          variant: "destructive",
        })
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // استخدام خدمة Nominatim من OpenStreetMap للحصول على العنوان من الإحداثيات
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1&accept-language=ar`,
            )

            if (!response.ok) {
              throw new Error(`فشل في الحصول على بيانات العنوان: ${response.status}`)
            }

            const data = await response.json()
            
            // استخراج بيانات العنوان من الاستجابة
            const address = {
              road: data.address.road || data.address.pedestrian || data.address.street || "",
              houseNumber: data.address.house_number || "",
              neighbourhood: data.address.neighbourhood || data.address.suburb || data.address.quarter || "",
              city: data.address.city || data.address.town || data.address.village || "",
              state: data.address.state || data.address.governorate || "",
              country: data.address.country || "",
              postcode: data.address.postcode || "",
            }

            // تنسيق العنوان بشكل مفصل
            let formattedAddress = ""

            if (address.road) {
              formattedAddress += address.road
              if (address.houseNumber) formattedAddress += ` ${address.houseNumber}`
              formattedAddress += ", "
            }

            if (address.neighbourhood) formattedAddress += `${address.neighbourhood}, `
            if (address.city) formattedAddress += `${address.city}, `
            if (address.state) formattedAddress += `${address.state}, `
            if (address.country) formattedAddress += address.country

            onLocationSelected(formattedAddress, address.houseNumber)

            toast({
              title: "تم تحديد الموقع",
              description: "تم تحديد موقعك الحالي بنجاح",
            })
          } catch (error) {
            console.error("خطأ في الحصول على العنوان:", error)
            toast({
              title: "خطأ في تحديد العنوان",
              description: "حدث خطأ أثناء محاولة الحصول على عنوانك. يرجى المحاولة مرة أخرى.",
              variant: "destructive",
            })
            setIsDialogOpen(true)
          } finally {
            setIsLoading(false)
          }
        },
        (error) => {
          console.error("خطأ في تحديد الموقع:", error)
          toast({
            title: "خطأ في تحديد الموقع",
            description: "تعذر الوصول لموقعك الحالي.",
            variant: "destructive",
          })
          setIsDialogOpen(true)
          setIsLoading(false)
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      )
    } catch (error) {
      console.error("خطأ غير متوقع:", error)
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    
    // 1. تحديث الخريطة فوراً لتعرض نتيجة البحث من Google Maps مباشرة
    const displayQuery = `${searchQuery}, مصر`
    const googleSearchUrl = `https://www.google.com/maps?q=${encodeURIComponent(displayQuery)}&output=embed&z=15`
    setMapUrl(googleSearchUrl)
    
    // تعيين العنوان المبدئي لما كتبه المستخدم
    setSelectedAddress(searchQuery)

    try {
      // 2. محاولة الحصول على بيانات دقيقة من Nominatim للتوثيق (اختياري)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&accept-language=ar&limit=5&countrycodes=eg`
      )
      
      const data = await res.json()
      
      if (data.length > 0) {
        // إذا وجدنا نتيجة دقيقة، نستخدمها لتحسين العرض ولكن نحتفظ ببحث المستخدم كاسم أساسي إذا أراد
        // أو نعرض الاسم الرسمي. هنا سنستخدم الاسم الرسمي إذا كان متاحاً
        const item = data[0]
        const exactUrl = `https://www.google.com/maps?q=${item.lat},${item.lon}&output=embed&z=15`
        setMapUrl(exactUrl)
        setSelectedAddress(item.display_name)
      } else {
        // إذا لم نجد نتيجة في Nominatim، نعتمد على بحث Google Maps (الذي يظهر في الـ iframe)
        // ونقبل نص المستخدم كعنوان
        toast({ 
            title: "تم العثور على الموقع", 
            description: "تم تحديد الموقع بناءً على بحثك.",
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSearching(false)
    }
  }

  const confirmManual = () => {
    if (!selectedAddress) return
    onLocationSelected(selectedAddress)
    setIsDialogOpen(false)
    toast({ title: "تم اختيار العنوان", description: "تم تحديث العنوان بنجاح" })
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleGetLocation}
        disabled={isLoading}
        className="flex items-center gap-1 text-xs"
      >
        {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
        {isLoading ? "جاري تحديد الموقع..." : "استخدام الموقع الحالي"}
      </Button>

      <Button type="button" variant="outline" size="sm" className="flex items-center gap-1 text-xs" onClick={() => setIsDialogOpen(true)}>
        <Map className="h-3 w-3" />
        اختيار على الخريطة
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>تحديد العنوان على الخريطة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            
            <div className="flex gap-2">
              <Input 
                placeholder="ابحث عن منطقة، شارع، أو علامة مميزة..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button type="button" onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "بحث"}
              </Button>
            </div>
            
            {mapUrl ? (
              <div className="space-y-2">
                <div className="aspect-video w-full border rounded-md overflow-hidden relative bg-muted">
                   <iframe 
                    src={mapUrl} 
                    className="w-full h-full" 
                    loading="lazy" 
                    allowFullScreen
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  تم تحديد: {selectedAddress}
                </p>
              </div>
            ) : (
              <div className="aspect-video w-full border rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground">
                <div className="text-center p-4">
                  {isSearching ? (
                    <Loader2 className="h-10 w-10 mx-auto mb-2 animate-spin text-primary" />
                  ) : (
                    <Map className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  )}
                  <p>{isSearching ? "جاري البحث عن العنوان..." : "ابحث عن منطقتك لتظهر الخريطة"}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
              <Button onClick={confirmManual} disabled={!selectedAddress}>تأكيد العنوان</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
