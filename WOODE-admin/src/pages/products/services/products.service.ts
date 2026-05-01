import axiosClient from '@/utils/axios'
import type { Product, CreateProductDTO, UpdateProductDTO } from '../types'

// get all
export const getProducts = async (): Promise<Product[]> => {
  const response = await axiosClient.get<Product[]>('/products/admin/list')
  return response.data
}

// get by id
export const getProductById = async (id: number): Promise<Product> => {
  const res = await axiosClient.get(`/products/${id}`)
  return res.data
}

// create
export const createProduct = async (data: CreateProductDTO): Promise<Product> => {
  const response = await axiosClient.post<Product>('/products', data)
  return response.data
}

// update
export const updateProduct = async (id: number, data: UpdateProductDTO): Promise<Product> => {
  const response = await axiosClient.patch<Product>(`/products/${id}`, data)
  return response.data
}

// delete (soft delete)
export const deleteProduct = async (id: number): Promise<void> => {
  await axiosClient.delete(`/products/${id}`)
}

// toggle active
export const toggleActiveProduct = async (id: number): Promise<Product> => {
  const response = await axiosClient.patch<Product>(`/products/${id}/toggle-active`)
  return response.data
}
