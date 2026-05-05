import { useState, useEffect, useCallback } from 'react'
import { useProductCategories } from '../hook'
import type { Product, CreateProductDTO, UpdateProductDTO } from '../types'
import CloudinaryUpload from './CloudinaryUpload'

interface ProductFormProps {
  initialData?: Product | null
  onSubmit: (data: CreateProductDTO | UpdateProductDTO) => void
  onClose: () => void
}

export const ProductForm = ({ initialData, onSubmit, onClose }: ProductFormProps) => {
  const { data: categories, isLoading: isCategoriesLoading } = useProductCategories()

  const [formData, setFormData] = useState<CreateProductDTO>({
    name: '',
    price: 0,
    description: '',
    categoryId: 0,
    imageUrl: '',
    modelUrl: '',
    dimensions: '',
    weight: 0,
    stock: 0,
  })

  const handleUpload = useCallback((url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }))
  }, [])

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        price: initialData.price,
        description: initialData.description || '',
        categoryId: initialData.categoryId,
        imageUrl: initialData.imageUrl || '',
        modelUrl: initialData.modelUrl || '',
        dimensions: initialData.dimensions || '',
        weight: initialData.weight || 0,
        stock: initialData.stock || 0,
      })
    } else {
      setFormData({
        name: '',
        price: 0,
        description: '',
        categoryId: categories && categories.length > 0 ? categories[0].id : 0,
        imageUrl: '',
        modelUrl: '',
        dimensions: '',
        weight: 0,
        stock: 0,
      })
    }
  }, [initialData])

  useEffect(() => {
    if (!initialData && categories && categories.length > 0 && formData.categoryId === 0) {
      setFormData(prev => ({
        ...prev,
        categoryId: categories[0].id,
      }))
    }
  }, [categories, initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === 'price' || name === 'weight' || name === 'stock') {
      const numValue = value === '' ? 0 : parseFloat(value)
      setFormData(prev => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : numValue,
      }))
    } else if (name === 'categoryId') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">
        {initialData ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Tên <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Giá <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="price"
          value={formData.price || ''}
          onChange={handleChange}
          required
          step="1"
          min="0"
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Danh mục <span className="text-red-500">*</span>
        </label>

        {isCategoriesLoading ? (
          <div className="px-3 py-2 border rounded bg-gray-100">Đang tải...</div>
        ) : (
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          >
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mb-4">
        <label>Mô tả</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">3D Model URL (.gltf)</label>
        <input
          type="text"
          name="modelUrl"
          value={formData.modelUrl}
          onChange={handleChange}
          placeholder="https://example.com/model.gltf"
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Kích thước</label>
          <input
            type="text"
            name="dimensions"
            value={formData.dimensions}
            onChange={handleChange}
            placeholder="VD: 100x50x40 cm"
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Khối lượng (kg)</label>
          <input
            type="number"
            name="weight"
            value={formData.weight || ''}
            onChange={handleChange}
            step="1"
            min="0"
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Số lượng tồn kho <span className="text-red-500">*</span></label>
          <input
            type="number"
            name="stock"
            value={formData.stock || 0}
            onChange={handleChange}
            step="1"
            min="0"
            required
            className="w-full px-3 py-2 border rounded font-semibold text-blue-600"
          />
        </div>
      </div>

      {/*   Upload */}
      <div className="mb-4">
        <CloudinaryUpload onUpload={handleUpload} />

        {formData.imageUrl && (
          <img
            src={formData.imageUrl}
            className="mt-4 h-40 w-full object-cover rounded border"
          />
        )}
      </div>

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
          Hủy
        </button>
        <button
          type="submit"
          disabled={!formData.categoryId}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {initialData ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  )
}