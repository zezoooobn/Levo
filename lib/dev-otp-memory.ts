// تخزين مؤقت لرموز OTP في وضع التطوير عند غياب قاعدة البيانات
// هذا التخزين غير دائم ويُفقد عند إعادة تشغيل الخادم
type OtpItem = { code: string; expiresAt: number; used: boolean; purpose: string }

const store = new Map<string, OtpItem>()

export function setOtp(email: string, item: OtpItem) {
  store.set(email.toLowerCase().trim(), item)
}

export function getOtp(email: string): OtpItem | undefined {
  return store.get(email.toLowerCase().trim())
}

export function markUsed(email: string) {
  const key = email.toLowerCase().trim()
  const current = store.get(key)
  if (current) {
    store.set(key, { ...current, used: true })
  }
}

export function clearOtp(email: string) {
  store.delete(email.toLowerCase().trim())
}

export function hasItems() {
  return store.size > 0
}

export type { OtpItem }