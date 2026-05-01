import { useState, useMemo } from 'react'
import { useProducts, useDeleteProduct, useCreateProduct, useUpdateProduct, useToggleActiveProduct } from '../hook'
import { ProductForm } from './ProductForm'
import type { Product, CreateProductDTO, UpdateProductDTO } from '../types'

export const ProductsList = () => {
  // 1️⃣ FETCH DỮ LIỆU PRODUCTS
  const { data, isLoading } = useProducts()
  const { mutate: deleteProduct } = useDeleteProduct()
  const { mutate: createProduct } = useCreateProduct()
  const { mutate: toggleActive } = useToggleActiveProduct()

  // 2️⃣ STATE QUẢN LÝ MODAL & FORM
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // 3️⃣ SETUP UPDATE MUTATION
  const updateMutation = useUpdateProduct(editing?.id ?? 0)
  const { mutate: updateProduct } = updateMutation

  // 4️⃣ MEMOIZED FILTERED DATA - Search by name or description
  const filteredData = useMemo(() => {
    if (!data) return []
    
    const searchLower = searchTerm.toLowerCase()
    
    return data.filter(product => {
      // Search in name or description
      return (
        product.name.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower))
      )
    })
  }, [data, searchTerm])

  // 4️⃣ XỬ LÝ LOADING STATE
  if (isLoading) return <p>Đang tải...</p>

  // 5️⃣ HÀM DELETE
  const handleDelete = (id: number) => {
    if (confirm('Xóa sản phẩm này?')) {
      deleteProduct(id)
    }
  }

  // 5️⃣ HÀM TOGGLE ACTIVE VỚI CONFIRMATION
  const handleToggleActive = (product: Product) => {
    toggleActive(product.id)
  }

  // 6️⃣ HÀM EDIT
  const handleEdit = (product: Product) => {
    setEditing(product)
    setOpen(true)
  }

  // 7️⃣ HÀM CREATE
  const handleCreate = () => {
    setEditing(null)
    setOpen(true)
  }

  // 8️⃣ HÀM SUBMIT
  const handleSubmit = (data: CreateProductDTO | UpdateProductDTO) => {
    if (editing) {
      updateProduct(data as UpdateProductDTO)
    } else {
      createProduct(data as CreateProductDTO)
    }
    setOpen(false)
  }

  return (
    <div className="p-6">
      {/* =================== NOTIFICATION TOAST =================== */}
      {notification && (
        <div className={`mb-4 p-4 rounded-lg flex items-center justify-between ${
          notification.type === 'success'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          <span className="font-medium">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-4 text-lg font-bold hover:opacity-70"
          >
            ✕
          </button>
        </div>
      )}

      {/* =================== HEADER =================== */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sản phẩm</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Thêm sản phẩm
        </button>
      </div>

      {/* =================== SEARCH BAR =================== */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc mô tả..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchTerm && (
          <p className="text-sm text-gray-600 mt-2">
            Tìm thấy {filteredData.length} kết quả cho "{searchTerm}"
          </p>
        )}
      </div>

      {/* =================== BẢNG PRODUCTS =================== */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-6 py-3 text-left text-sm font-semibold">#</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Tên</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Giá</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Danh mục</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Mô tả</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Hình ảnh</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  {searchTerm ? `Không tìm thấy sản phẩm nào phù hợp với "${searchTerm}"` : 'Chưa có sản phẩm nào'}
                </td>
              </tr>
            ) : (
              filteredData.map((product, index) => (
                <tr key={product.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">${product.price}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">ID: {product.categoryId}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">
                    {product.description || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-400">Không có hình ảnh</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      product.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive ? '📺 Đang bán' : '🚫 Đã ẩn'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2 justify-center flex-wrap">
                    <button
                      onClick={() => handleToggleActive(product)}
                      className={`text-white px-3 py-1 rounded text-xs ${
                        product.isActive 
                          ? 'bg-orange-500 hover:bg-orange-600' 
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {product.isActive ? '🔓 Ẩn' : '🔓 Hiện'}
                    </button>
                    <button
                      onClick={() => handleEdit(product)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* =================== MODAL =================== */}
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96 max-h-screen overflow-y-auto">
            <ProductForm
              initialData={editing}
              onSubmit={handleSubmit}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
