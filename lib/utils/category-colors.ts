export function getCategoryButtonColor(category: string): string {
  const categoryLower = category.toLowerCase()

  // الرجالي - أزرق
  if (categoryLower.includes("رجال") || categoryLower.includes("men") || categoryLower.includes("رجالي")) {
    // لبني (أزرق فاتح)
    return "!bg-[#B3D9FF] hover:!bg-[#9FC9F5] !text-gray-900"
  }

  // النسائي - وردي
  if (
    categoryLower.includes("نساء") ||
    categoryLower.includes("حريم") ||
    categoryLower.includes("women") ||
    categoryLower.includes("نسائي") ||
    categoryLower.includes("female") ||
    categoryLower.includes("ladies")
  ) {
    // وردي أغمق قليلًا
    return "!bg-[#FF7AA6] hover:!bg-[#FF6A98] !text-white"
  }

  // الأطفالي - أصفر
  if (
    categoryLower.includes("أطفال") ||
    categoryLower.includes("kids") ||
    categoryLower.includes("children") ||
    categoryLower.includes("أطفالي")
  ) {
    // أصفر فاتح
    return "!bg-[#FFF3A6] hover:!bg-[#FFEB80] !text-gray-900"
  }

  // افتراضي
  return "bg-primary hover:bg-primary/90 text-primary-foreground"
}
