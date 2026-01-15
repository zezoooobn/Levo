"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"
import { useStore } from "@/lib/store"

export function SiteFooter() {
  const { isLoggedIn, user } = useStore()
  const canSeeAdmin = isLoggedIn && user?.email === "yazeedmohamed098@gmail.com"

  return (
    <footer className="bg-background border-t">
      <div className="container px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">ليڤو</h3>
            <p className="text-sm text-gray-600">متجر ليڤو للملابس العصرية والأنيقة بأسعار مناسبة وجودة عالية.</p>
            <div className="flex space-x-4 space-x-reverse">
              <Link href="#" className="text-gray-600 hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-600 hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-600 hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">تسوق</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-gray-600 hover:text-primary">
                  جميع المنتجات
                </Link>
              </li>
              <li>
                <Link href="/products?category=رجالي" className="text-gray-600 hover:text-primary">
                  رجالي
                </Link>
              </li>
              <li>
                <Link href="/products?category=نسائي" className="text-gray-600 hover:text-primary">
                  نسائي
                </Link>
              </li>
              <li>
                <Link href="/products?category=أطفال" className="text-gray-600 hover:text-primary">
                  أطفال
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">المساعدة</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/complaints" className="text-gray-600 hover:text-primary">
                  الشكاوي
                </Link>
              </li>
              <li>
                <Link href="/terms#shipping" className="text-gray-600 hover:text-primary">
                  الشحن والتوصيل
                </Link>
              </li>
              <li>
                <Link href="/terms#returns" className="text-gray-600 hover:text-primary">
                  الإرجاع والاستبدال
                </Link>
              </li>
              <li>
                <Link href="/terms#faq" className="text-gray-600 hover:text-primary">
                  الأسئلة الشائعة
                </Link>
              </li>
              {canSeeAdmin && (
                <li>
                  <Link href="/admin" className="text-gray-600 hover:text-primary">
                    المسؤول
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">معلومات</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-primary">
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="/terms#privacy" className="text-gray-600 hover:text-primary">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-primary">
                  الشروط والأحكام
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600">
          <p>© 2024 Levo. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  )
}
