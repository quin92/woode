import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FurnitureCard from "../components/FurnitureCard";
import PersonalizedProducts from "../components/PersonalizedProducts";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { useBestSellingProducts } from "../hooks/useBestSellingProducts";
import { useAuth } from "../contexts/AuthContext";

const PAGE_SIZE = 6;

function ProductsPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { products, loading, error } = useProducts();
  const { categories } = useCategories();
  const { isAuthenticated } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(category || "all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const { bestSellingProducts } = useBestSellingProducts();
  const bestSellerSet = new Set(bestSellingProducts.map((p) => p.id));

  // FILTER
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter(
        (p) => p.category?.slug === selectedCategory
      );
    }

    if (search) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (minPrice) {
      result = result.filter((p) => p.price >= Number(minPrice));
    }

    if (maxPrice) {
      result = result.filter((p) => p.price <= Number(maxPrice));
    }

    return result;
  }, [products, selectedCategory, search, minPrice, maxPrice]);

  // RESET PAGE WHEN FILTER CHANGE
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, search, minPrice, maxPrice]);

  // PAGINATION
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  return (
    <div className="bg-[#2A261F] min-h-screen text-[#F5F0EB]">
      {/* TITLE */}
      <div className="mb-12 text-center pt-32 px-4">
        <h2 className="mt-1  font-['Noto_Serif'] text-3xl sm:text-5xl font-black text-[#F5F0EB]">
          Bộ Sưu Tập Nội Thất
        </h2>
        <p className="mt-4 text-[#E0B84F] max-w-3xl mx-auto">
          Khám phá những thiết kế đẳng cấp, mang lại vẻ đẹp vượt thời gian cho không gian sống của bạn.
        </p>
      </div>

      {/* LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 pb-24">

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* LEFT FILTER */}
          <div className="lg:col-span-1 bg-[#1A1A1A] rounded-3xl shadow-xl p-6 h-fit w-full border border-[#1F1C18]">
            <h3 className=" font-['Noto_Serif'] font-bold text-xl mb-6 text-[#E0B84F]">Tìm kiếm</h3>

            <input
              type="text"
              placeholder="Tên sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full mb-8 px-4 py-3 bg-[#1F1C18] border border-[#4A4035] rounded-xl text-[#F5F0EB] placeholder:text-[#6A6A6A] focus:outline-none focus:border-[#D8A94A] transition-colors"
            />

            <h3 className=" font-['Noto_Serif'] font-bold text-xl mb-4 text-[#E0B84F]">Danh mục</h3>
            <div className="flex flex-col gap-2 mb-8">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`text-left px-4 py-3 rounded-xl transition-all ${selectedCategory === "all"
                  ? "bg-[#D8A94A] text-[#1A1A1A] font-bold"
                  : "bg-transparent text-[#E0B84F] hover:bg-[#1F1C18] hover:text-[#F5F0EB]"
                  }`}
              >
                Tất cả sản phẩm
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`text-left px-4 py-3 rounded-xl transition-all ${selectedCategory === cat.slug
                    ? "bg-[#D8A94A] text-[#1A1A1A] font-bold"
                    : "bg-transparent text-[#E0B84F] hover:bg-[#1F1C18] hover:text-[#F5F0EB]"
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <h3 className=" font-['Noto_Serif'] font-bold text-xl mb-4 text-[#E0B84F]">Mức giá</h3>
            <div className="flex flex-col gap-3">
              <input
                type="number"
                placeholder="Từ (VNĐ)"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-4 py-3 bg-[#1F1C18] border border-[#4A4035] rounded-xl text-[#F5F0EB] placeholder:text-[#6A6A6A] focus:outline-none focus:border-[#D8A94A] transition-colors"
              />
              <input
                type="number"
                placeholder="Đến (VNĐ)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-4 py-3 bg-[#1F1C18] border border-[#4A4035] rounded-xl text-[#F5F0EB] placeholder:text-[#6A6A6A] focus:outline-none focus:border-[#D8A94A] transition-colors"
              />
            </div>
          </div>

          {/* RIGHT PRODUCT */}
          <div className="lg:col-span-3">

            {loading && (
              <div className="text-center py-20 text-[#E0B84F]">
                Đang tải sản phẩm...
              </div>
            )}

            {error && (
              <div className="text-center py-20 text-[#D4AF37]">
                {error}
              </div>
            )}

            {!loading && !error && filteredProducts.length === 0 && (
              <div className="text-center py-20 text-[#E0B84F] bg-[#1A1A1A] rounded-3xl border border-[#1F1C18]">
                Không tìm thấy sản phẩm phù hợp với tiêu chí của bạn.
              </div>
            )}

            {!loading && !error && filteredProducts.length > 0 && (
              <>
                {/* GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map((item) => (
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
                        isBestSeller={bestSellerSet.has(item.id)}
                      />
                    </div>
                  ))}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-16 flex-wrap">

                    {/* Prev */}
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.max(p - 1, 1))
                      }
                      className="px-4 py-2 bg-[#1F1C18] border border-[#4A4035] text-[#E0B84F] rounded-full disabled:opacity-50 hover:bg-[#4A4035] hover:text-[#F5F0EB] transition-colors"
                      disabled={currentPage === 1}
                    >
                      Trước
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentPage === page
                            ? "bg-[#D8A94A] text-[#1A1A1A] font-bold"
                            : "bg-[#1F1C18] text-[#E0B84F] border border-[#4A4035] hover:bg-[#4A4035] hover:text-[#F5F0EB]"
                            }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    {/* Next */}
                    <button
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(p + 1, totalPages)
                        )
                      }
                      className="px-4 py-2 bg-[#1F1C18] border border-[#4A4035] text-[#E0B84F] rounded-full disabled:opacity-50 hover:bg-[#4A4035] hover:text-[#F5F0EB] transition-colors"
                      disabled={currentPage === totalPages}
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {isAuthenticated && (
          <div className="mt-16">
            <PersonalizedProducts />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;