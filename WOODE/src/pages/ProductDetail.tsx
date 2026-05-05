import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiPlus, FiMinus, FiShoppingCart, FiCheck } from "react-icons/fi";
import { useCart } from "../contexts/CartContext";
import { useProductById, useProducts } from "../hooks/useProducts";
import FurnitureCard from "../components/FurnitureCard";
import { ProductViewer3D } from "../components/3d/ProductViewer3D";

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const parsedId = Number(id);
  const productId = Number.isNaN(parsedId) ? undefined : parsedId;

  const { product, loading, error } = useProductById(productId);
  const { products } = useProducts();

  const [quantity, setQuantity] = useState(1);
  const [showAddedMessage, setShowAddedMessage] = useState(false);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(value) + "đ";

  const totalItemPrice = product?.price || 0;
  const totalPrice = totalItemPrice * quantity;

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product.id,
      title: product.name,
      image: product.imageUrl || "",
      price: totalItemPrice,
      quantity,
    });

    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 2000);
  };

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((item) => item.id !== product.id && item.categoryId === product.categoryId)
      .slice(0, 3);
  }, [product, products]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-12 text-center text-[#F5F0EB]">
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-12 text-center text-[#F5F0EB]">
        <h1 className="mb-4 text-2xl font-bold">Không tìm thấy sản phẩm</h1>
        <button
          onClick={() => navigate("/")}
          className="rounded-full bg-[#D8A94A] px-6 py-3 font-semibold transition hover:bg-[#E0B84F]"
        >
          Quay về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-20">
      <section className="rounded-[36px] bg-[#1A1A1A] p-6 shadow-2xl sm:p-8 lg:p-10 border border-[#1F1C18]">
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_1fr]">
          
          {/* 3D Viewer / Image Left Side */}
          <div className="relative h-[400px] w-full lg:h-[600px] rounded-[32px] overflow-hidden shadow-2xl border border-[#1F1C18]">
            <ProductViewer3D 
              modelUrl={product.modelUrl} 
              imageUrl={product.imageUrl} 
              alt={product.name}
            />
            <div className="absolute left-5 top-5 rounded-full bg-[#D8A94A]/90 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-white shadow-md">
              {product.category?.name || "Nội thất"}
            </div>
          </div>

          {/* Product Info Right Side */}
          <div className="flex flex-col text-[#F5F0EB]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E0B84F]">
              Chi tiết sản phẩm
            </p>

            <h1 className="mt-3  font-['Noto_Serif'] text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>

            <div className="mt-6 rounded-[24px] border border-[#4A4035] bg-[#1F1C18] p-5">
              <p className="text-sm leading-8 text-[#E0B84F] sm:text-base">
                {product.description || "Sản phẩm nội thất cao cấp từ WOODÉ, mang lại sự sang trọng cho không gian sống của bạn."}
              </p>
              
              {(product.dimensions || product.weight) && (
                <div className="mt-4 pt-4 border-t border-[#4A4035] grid grid-cols-2 gap-4 text-sm">
                  {product.dimensions && (
                    <div>
                      <span className="text-[#E0B84F] block text-xs uppercase mb-1">Kích thước</span>
                      <span className="font-semibold">{product.dimensions}</span>
                    </div>
                  )}
                  {product.weight && (
                    <div>
                      <span className="text-[#E0B84F] block text-xs uppercase mb-1">Cân nặng</span>
                      <span className="font-semibold">{product.weight} kg</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-end justify-between gap-4 border-b border-[#4A4035] pb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#E0B84F]">Giá sản phẩm</p>
                <p className="mt-2 text-3xl font-bold text-[#E0B84F] sm:text-4xl">
                  {formatPrice(product.price)}
                </p>
              </div>

              <div className="rounded-2xl bg-[#1F1C18] px-4 py-3 text-right border border-[#4A4035]">
                <p className="text-xs uppercase tracking-wide text-[#E0B84F]">Danh mục</p>
                <p className="mt-1 font-bold text-[#F5F0EB]">{product.category?.name || "N/A"}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-[auto_1fr]">
              <div>
                <p className="mb-3 text-sm font-semibold text-[#F5F0EB]">Số lượng</p>
                <div className="flex items-center gap-2 rounded-full border border-[#4A4035] bg-[#1F1C18] px-4 py-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stock === 0}
                    className="flex h-6 w-6 items-center justify-center text-[#E0B84F] transition hover:text-[#E0B84F] disabled:opacity-30"
                  >
                    <FiMinus size={18} />
                  </button>
                  <span className="w-6 text-center font-semibold text-[#F5F0EB]">
                    {product.stock === 0 ? 0 : quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={product.stock === 0 || quantity >= product.stock}
                    className="flex h-6 w-6 items-center justify-center text-[#E0B84F] transition hover:text-[#E0B84F] disabled:opacity-30"
                  >
                    <FiPlus size={18} />
                  </button>
                </div>
                {product.stock > 0 && (
                  <p className="mt-2 text-xs text-[#E0B84F]">
                    Còn lại {product.stock} sản phẩm
                  </p>
                )}
              </div>

              <div className="rounded-[24px] border border-[#4A4035] bg-[#1F1C18] p-5">
                <div className="space-y-2 text-sm text-[#E0B84F]">
                  <div className="flex justify-between">
                    <span>
                      {product.name} x {quantity}
                    </span>
                    <span>{formatPrice(product.price * quantity)}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#4A4035] pt-4">
                  <span className="text-base font-semibold text-[#F5F0EB]">Tổng cộng</span>
                  <span className="text-2xl font-bold text-[#E0B84F]">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`relative flex-1 rounded-full px-6 py-4 text-sm font-bold shadow-md transition-all ${
                  product.stock === 0
                    ? "bg-[#333] text-gray-500 cursor-not-allowed border border-gray-600"
                    : "bg-gradient-to-r from-[#D8A94A] to-[#E0B84F] text-[#1A1A1A] hover:scale-[1.02] hover:shadow-lg"
                }`}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <FiShoppingCart size={18} />
                  {product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                </span>

                {showAddedMessage && product.stock > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-[#E0B84F]">
                    <div className="flex items-center gap-2 text-white">
                      <FiCheck size={18} />
                      Đã thêm
                    </div>
                  </div>
                )}
              </button>

              <button
                onClick={() => navigate("/cart")}
                className="flex-1 rounded-full border border-[#4A4035] bg-[#1F1C18] px-6 py-4 text-sm font-bold text-[#F5F0EB] transition-all hover:bg-[#4A4035]"
              >
                Kiểm tra giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-12 border-t border-[#1F1C18]">
          <h2 className="mb-8  font-['Noto_Serif'] text-3xl font-black text-[#F5F0EB] sm:text-4xl text-center">
            Sản phẩm liên quan
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mx-auto max-w-5xl">
            {relatedProducts.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/product/${item.id}`)}
                className="cursor-pointer"
              >
                <FurnitureCard
                  name={item.name}
                  description={item.description}
                  categoryName={item.category?.name}
                  image={item.imageUrl || ""}
                  price={item.price}
                  isActive={false}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductDetail;