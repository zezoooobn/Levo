export interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  outfits?: OutfitRecommendation[]
}

export interface OutfitRecommendation {
  id: string
  title: string
  items: OutfitItem[]
  colors: string
  why: string
  stylingTip: string
}

export interface OutfitItem {
  label: string
  product?: Product
}

export interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  sizes?: string[]
  colors?: string[]
}

export interface UserPreferences {
  occasion?: string
  style?: string
  weather?: string
  color?: string
  budget?: string
  gender?: string
  fit?: string
  size?: string
  fabric?: string
  opaque?: boolean
}

export interface ChatState {
  messages: ChatMessage[]
  isTyping: boolean
  preferences: UserPreferences
}