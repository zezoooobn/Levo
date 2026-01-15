import { initializeApp, getApps, getApp } from "firebase/app"
import { getAnalytics, isSupported } from "firebase/analytics"
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signInAnonymously, signInWithRedirect, getRedirectResult } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// نقرأ الإعدادات من متغيرات البيئة (آمنة للعميل لأنها NEXT_PUBLIC)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID as string,
}

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = typeof window !== "undefined" ? getAuth(app) : ({} as any)
export const db = getFirestore(app)

export async function ensureAuth() {
  if (typeof window === "undefined" || !auth) return
  await new Promise<void>((resolve) => {
    onAuthStateChanged(auth, async (u) => {
      if (!u) {
        try {
          await signInAnonymously(auth)
        } catch {}
      }
      resolve()
    })
  })
}

export async function signInWithGoogle() {
  if (typeof window === "undefined" || !auth) return null
  const provider = new GoogleAuthProvider()
  try {
    const result = await signInWithPopup(auth, provider)
    const u = result.user
    return {
      uid: u.uid,
      email: u.email || "",
      firstName: u.displayName?.split(" ")[0] || "",
      lastName: u.displayName?.split(" ").slice(1).join(" ") || "",
      phone: u.phoneNumber || "",
      address: "",
    }
  } catch {
    await signInWithRedirect(auth, provider)
    return null
  }
}

export async function getGoogleRedirectUser() {
  if (typeof window === "undefined" || !auth) return null
  const result = await getRedirectResult(auth)
  if (!result) return null
  const u = result.user
  return {
    uid: u.uid,
    email: u.email || "",
    firstName: u.displayName?.split(" ")[0] || "",
    lastName: u.displayName?.split(" ").slice(1).join(" ") || "",
    phone: u.phoneNumber || "",
    address: "",
  }
}
// Analytics يعمل فقط على المتصفح
export const analyticsPromise = typeof window !== "undefined"
  ? isSupported().then((ok) => (ok ? getAnalytics(app) : null))
  : Promise.resolve(null)
