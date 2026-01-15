import * as admin from "firebase-admin"

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID as string
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL as string
// استبدال \n بأسطر جديدة فعلية
const rawKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY as string) || ""
const privateKey = rawKey.replace(/\\n/g, "\n")

function initAdmin() {
  try {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      })
    }
  } catch (e) {
    // في حال فشل التهيئة، لا نعيد الرمي حتى لا يتوقف الخادم
    console.error("Firebase Admin init error", e)
  }
}

initAdmin()

export const adminAuth = admin.apps.length > 0 ? admin.auth() : {
  async listUsers() {
    throw new Error("Firebase Admin is not initialized")
  },
  async deleteUser() {
    throw new Error("Firebase Admin is not initialized")
  },
  async updateUser() {
    throw new Error("Firebase Admin is not initialized")
  },
} as any
export const adminDb = admin.apps.length > 0 ? admin.firestore() : null as any
export const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp()
