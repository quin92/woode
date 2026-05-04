// ========================
// BASIC TYPES
// ========================
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED'
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'MOMO' | 'VNPAY'
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'


// ========================
// ORDER ITEM
// ========================
export interface OrderItem {
  id: number
  productId: number
  productName: string
  basePrice: number
  quantity: number
  product?: {
    imageUrl: string | null
  }
}

// ========================
// PAYMENT
// ========================
export interface Payment {
  id: number
  method: PaymentMethod
  status: PaymentStatus
  amount: number
  transactionId?: string
  paidAt?: string
}

// ========================
// ORDER LOG
// ========================
export interface OrderLog {
  id: number
  orderId: number
  status: OrderStatus
  note?: string
  createdAt: string
  updatedBy?: {
    id: number
    name: string | null
  }
}

// ========================
// ADMIN ORDER (GET all, GET by id)
// ========================
export interface AdminOrder {
  id: number
  userId: number
  total: number
  status: OrderStatus
  phone: string
  address: string
  createdAt: string
    updatedAt: string
  earnedPoint?: number
  usedPoint?: number
  items: OrderItem[]
  payments?: Payment[]
  logs?: OrderLog[]
  user?: {
    id: number
    email: string
    name: string | null
    phone: string
    role: 'ADMIN' | 'STAFF' | 'CUSTOMER'
  }
}

