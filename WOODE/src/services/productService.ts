import axios from "axios";
import { API_BASE_URL } from "../lib/api";

// API public: dùng cho trang sản phẩm, chi tiết sản phẩm
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  categoryId: number;
  imageUrl?: string;
  imageId?: string;
  modelUrl?: string;       // Đường dẫn file .gltf cho 3D viewer
  dimensions?: string;     // Kích thước (VD: "120x60x75 cm")
  weight?: number;         // Cân nặng (kg)
  stock: number;           // Số lượng tồn kho
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  category?: {
    id: number;
    name: string;
    slug?: string;
  };
}

export const productService = {
  getAll: async (): Promise<Product[]> => {
    try {
      const response = await publicApi.get<Product[]>("/products");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch products: ${error}`);
    }
  },

  getById: async (id: number): Promise<Product> => {
    try {
      const response = await publicApi.get<Product>(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch product with ID ${id}: ${error}`);
    }
  },

  getByCategory: async (categoryId: number): Promise<Product[]> => {
    try {
      const allProducts = await productService.getAll();
      return allProducts.filter((p) => p.categoryId === categoryId);
    } catch (error) {
      throw new Error(`Failed to fetch products by category: ${error}`);
    }
  },
};

export default productService;