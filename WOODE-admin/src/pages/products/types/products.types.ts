export interface Product {
  id: number
  name: string
  price: number
  description?: string
  categoryId: number
  imageUrl?: string
  modelUrl?: string
  dimensions?: string
  weight?: number
  stock: number
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateProductDTO {
  name: string
  price: number
  description?: string
  categoryId: number
  imageUrl?: string
  modelUrl?: string
  dimensions?: string
  weight?: number
  stock: number
}

export interface UpdateProductDTO {
  name?: string
  price?: number
  description?: string
  categoryId?: number
  imageUrl?: string
  modelUrl?: string
  dimensions?: string
  weight?: number
  stock?: number
}
