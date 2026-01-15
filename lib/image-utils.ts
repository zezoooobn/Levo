/**
 * وظائف مساعدة لتحويل الصور إلى تنسيق Base64
 */

/**
 * تحويل ملف صورة إلى تنسيق Base64
 * @param file ملف الصورة
 * @returns وعد يحتوي على سلسلة Base64
 */
export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // التحقق من حجم الملف (الحد الأقصى 2 ميجابايت)
    if (file.size > 2 * 1024 * 1024) {
      reject(new Error("حجم الصورة كبير جدًا. الحد الأقصى هو 2 ميجابايت."))
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.onerror = (error) => {
      reject(error)
    }
  })
}

/**
 * تحويل URL صورة إلى تنسيق Base64
 * @param url رابط الصورة
 * @returns وعد يحتوي على سلسلة Base64
 */
export const convertUrlToBase64 = async (url: string): Promise<string> => {
  // إذا كان URL يبدأ بـ data: فهو بالفعل بتنسيق Base64
  if (url.startsWith("data:")) {
    return url
  }

  // إذا كان URL يشير إلى صورة placeholder، نعيده كما هو
  if (url.includes("placeholder.svg")) {
    return url
  }

  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onload = () => {
        resolve(reader.result as string)
      }
      reader.onerror = (error) => {
        reject(error)
      }
    })
  } catch (error) {
    console.error("خطأ في تحويل URL إلى Base64:", error)
    return url // في حالة الفشل، نعيد URL الأصلي
  }
}
