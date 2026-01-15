type ComplaintStatus = "pending" | "in_progress" | "resolved" | "rejected"

export interface Complaint {
  id: string
  userId: string
  title: string
  description: string
  images?: string[]
  status: ComplaintStatus
  createdAt: string
  updatedAt: string
}

interface GlobalComplaintsStore {
  complaints: Complaint[]
}

const getStore = (): GlobalComplaintsStore => {
  const g = globalThis as any
  if (!g.__complaintsStore) {
    g.__complaintsStore = { complaints: [] } as GlobalComplaintsStore
  }
  return g.__complaintsStore as GlobalComplaintsStore
}

const genId = () => Math.random().toString(36).slice(2, 10)

export const listComplaintsByUser = (userId?: string): Complaint[] => {
  const { complaints } = getStore()
  if (!userId) return complaints
  return complaints.filter((c) => c.userId === userId)
}

export const createComplaint = (data: {
  userId: string
  title: string
  description: string
  images?: string[]
}): Complaint => {
  const store = getStore()
  const now = new Date().toISOString()
  const complaint: Complaint = {
    id: genId(),
    userId: data.userId,
    title: data.title,
    description: data.description,
    images: data.images ?? [],
    status: "pending",
    createdAt: now,
    updatedAt: now,
  }
  store.complaints.unshift(complaint)
  return complaint
}

export const updateComplaintStatus = (
  id: string,
  status: ComplaintStatus
): Complaint | null => {
  const store = getStore()
  const idx = store.complaints.findIndex((c) => c.id === id)
  if (idx === -1) return null
  const updated: Complaint = {
    ...store.complaints[idx],
    status,
    updatedAt: new Date().toISOString(),
  }
  store.complaints[idx] = updated
  return updated
}