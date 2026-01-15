"use client"

import { useEffect, useState } from "react"
import { ShoppingCart, Check } from "lucide-react"

interface CartAnimationProps {
  isVisible: boolean
  productName: string
  onComplete: () => void
}

export function CartAnimation({ isVisible, productName, onComplete }: CartAnimationProps) {
  const [showCheck, setShowCheck] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    if (isVisible) {
      // إنشاء الجسيمات
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        delay: Math.random() * 0.5,
      }))
      setParticles(newParticles)

      // إظهار علامة الصح بعد تأخير
      const checkTimer = setTimeout(() => {
        setShowCheck(true)
      }, 800)

      // إنهاء الأنيميشن
      const completeTimer = setTimeout(() => {
        onComplete()
        setShowCheck(false)
        setParticles([])
      }, 3000)

      return () => {
        clearTimeout(checkTimer)
        clearTimeout(completeTimer)
      }
    }
  }, [isVisible, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* خلفية blur */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" />

      {/* محتوى الأنيميشن */}
      <div className="relative z-10 flex flex-col items-center">
        {/* أيقونة السلة */}
        <div className="relative">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center animate-bounce shadow-2xl">
            <ShoppingCart className="w-12 h-12 text-white" />
          </div>

          {/* علامة الصح */}
          {showCheck && (
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
              <Check className="w-5 h-5 text-white" />
            </div>
          )}

          {/* الجسيمات المتطايرة */}
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping"
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                animationDelay: `${particle.delay}s`,
                animationDuration: "1s",
              }}
            />
          ))}

          {/* دوائر متحركة إضافية */}
          <div className="absolute inset-0 w-24 h-24 border-4 border-green-300 rounded-full animate-ping opacity-75" />
          <div className="absolute inset-0 w-32 h-32 -m-4 border-2 border-green-200 rounded-full animate-pulse opacity-50" />
        </div>

        {/* النص */}
        <div className="mt-6 text-center animate-in slide-in-from-bottom-4 duration-500 delay-300">
          <h3 className="text-xl font-bold text-green-600 mb-2">تم الإضافة بنجاح!</h3>
          <p className="text-gray-600 max-w-xs">{productName}</p>
          <p className="text-sm text-gray-500 mt-1">تم إضافته إلى سلة التسوق</p>
        </div>
      </div>
    </div>
  )
}
