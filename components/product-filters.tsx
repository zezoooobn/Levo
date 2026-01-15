"use client"

import type React from "react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { useEffect, useState, useCallback, useMemo } from "react"

interface ProductFiltersProps {
  selectedCategories: string[]
  setSelectedCategories: (categories: string[]) => void
  priceRange: [number, number]
  setPriceRange: (range: [number, number]) => void
  selectedSizes: string[]
  setSelectedSizes: (sizes: string[]) => void
  selectedColors: string[]
  setSelectedColors: (colors: string[]) => void
}

export function ProductFilters({
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange,
  selectedSizes,
  setSelectedSizes,
  selectedColors,
  setSelectedColors,
}: ProductFiltersProps) {
  // استخدام حالة داخلية لعرض القيم أثناء السحب
  const [displayPriceRange, setDisplayPriceRange] = useState<[number, number]>(priceRange)
  const [minPriceInput, setMinPriceInput] = useState(priceRange[0].toString())
  const [maxPriceInput, setMaxPriceInput] = useState(priceRange[1].toString())

  // تحديث القيم المعروضة عند تغير priceRange من الخارج
  useEffect(() => {
    setDisplayPriceRange(priceRange)
    setMinPriceInput(priceRange[0].toString())
    setMaxPriceInput(priceRange[1].toString())
  }, [priceRange])

  const handlePriceChange = useCallback(
    (value: number[]) => {
      // تقريب القيم إلى أقرب 10
      const roundedValue: [number, number] = [Math.round(value[0] / 10) * 10, Math.round(value[1] / 10) * 10]

      // تحديث القيم المعروضة فوراً
      setDisplayPriceRange(roundedValue)
      setMinPriceInput(roundedValue[0].toString())
      setMaxPriceInput(roundedValue[1].toString())

      // تحديث القيم الفعلية فوراً أيضاً
      setPriceRange(roundedValue)
    },
    [setPriceRange],
  )

  const handleMinPriceInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      // السماح فقط بالأرقام
      if (/^\d*$/.test(value)) {
        setMinPriceInput(value)
        const numValue = Number.parseInt(value) || 0
        if (numValue <= displayPriceRange[1] && numValue <= 1000) {
          const newRange: [number, number] = [numValue, displayPriceRange[1]]
          setDisplayPriceRange(newRange)
          setPriceRange(newRange)
        }
      }
    },
    [displayPriceRange, setPriceRange],
  )

  const handleMaxPriceInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      // السماح فقط بالأرقام
      if (/^\d*$/.test(value)) {
        setMaxPriceInput(value)
        const numValue = Number.parseInt(value) || 0
        if (numValue >= displayPriceRange[0] && numValue <= 1000) {
          const newRange: [number, number] = [displayPriceRange[0], numValue]
          setDisplayPriceRange(newRange)
          setPriceRange(newRange)
        }
      }
    },
    [displayPriceRange, setPriceRange],
  )

  // Toggle category selection مع useCallback للأداء
  const toggleCategory = useCallback(
    (category: string) => {
      setSelectedCategories((prev) =>
        prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
      )
    },
    [setSelectedCategories],
  )

  // Toggle size selection مع useCallback للأداء
  const toggleSize = useCallback(
    (size: string) => {
      setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]))
    },
    [setSelectedSizes],
  )

  // Toggle color selection مع useCallback للأداء
  const toggleColor = useCallback(
    (color: string) => {
      setSelectedColors((prev) => (prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]))
    },
    [setSelectedColors],
  )

  // استخدام useMemo للقوائم الثابتة
  const categories = useMemo(
    () => [
      { id: "category-men", value: "رجالي", label: "رجالي" },
      { id: "category-women", value: "نسائي", label: "نسائي" },
      { id: "category-kids", value: "أطفال", label: "أطفال" },
      { id: "category-accessories", value: "إكسسوارات", label: "إكسسوارات" },
    ],
    [],
  )

  const sizes = useMemo(
    () => [
      { id: "size-xs", value: "XS", label: "XS" },
      { id: "size-s", value: "S", label: "S" },
      { id: "size-m", value: "M", label: "M" },
      { id: "size-l", value: "L", label: "L" },
      { id: "size-xl", value: "XL", label: "XL" },
      { id: "size-xxl", value: "XXL", label: "XXL" },
    ],
    [],
  )

  const colors = useMemo(
    () => [
      { id: "color-black", value: "أسود", label: "أسود" },
      { id: "color-white", value: "أبيض", label: "أبيض" },
      { id: "color-red", value: "أحمر", label: "أحمر" },
      { id: "color-blue", value: "أزرق", label: "أزرق" },
      { id: "color-green", value: "أخضر", label: "أخضر" },
    ],
    [],
  )

  return (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={["category", "price", "size", "color"]}>
        <AccordionItem value="category">
          <AccordionTrigger>الفئة</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.value)}
                    onCheckedChange={() => toggleCategory(category.value)}
                  />
                  <Label htmlFor={category.id}>{category.label}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>السعر</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                min={0}
                max={1000}
                step={10}
                value={displayPriceRange}
                onValueChange={handlePriceChange}
                className="mt-6"
                dir="rtl"
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col items-center">
                  <label className="text-xs text-muted-foreground mb-1">الحد الأدنى</label>
                  <Input
                    type="text"
                    value={minPriceInput}
                    onChange={handleMinPriceInputChange}
                    className="w-20 h-8 text-center text-sm"
                    placeholder="0"
                  />
                  <span className="text-xs text-muted-foreground mt-1">ج.م</span>
                </div>
                <div className="text-muted-foreground">-</div>
                <div className="flex flex-col items-center">
                  <label className="text-xs text-muted-foreground mb-1">الحد الأقصى</label>
                  <Input
                    type="text"
                    value={maxPriceInput}
                    onChange={handleMaxPriceInputChange}
                    className="w-20 h-8 text-center text-sm"
                    placeholder="1000"
                  />
                  <span className="text-xs text-muted-foreground mt-1">ج.م</span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="size">
          <AccordionTrigger>المقاس</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {sizes.map((size) => (
                <div key={size.id} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={size.id}
                    checked={selectedSizes.includes(size.value)}
                    onCheckedChange={() => toggleSize(size.value)}
                  />
                  <Label htmlFor={size.id}>{size.label}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="color">
          <AccordionTrigger>اللون</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {colors.map((color) => (
                <div key={color.id} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={color.id}
                    checked={selectedColors.includes(color.value)}
                    onCheckedChange={() => toggleColor(color.value)}
                  />
                  <Label htmlFor={color.id}>{color.label}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
