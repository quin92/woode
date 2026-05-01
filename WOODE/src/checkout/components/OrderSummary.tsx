import { FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { formatPrice, getToppingNames } from "../utils/checkout.utils";

type SummaryItem = {
  id: number | string;
  title: string;
  price: number;
  quantity: number;
  size?: string;
  toppings?: unknown[];
};

interface OrderSummaryProps {
  cart: SummaryItem[];
  subtotal: number;
  usePointsAmount: number;
  discountFromPoints: number;
  discountFromTier: number;
  discountPercentage: number;
  finalAmount: number;
}

export default function OrderSummary({
  cart,
  subtotal,
  usePointsAmount,
  discountFromPoints,
  discountFromTier,
  discountPercentage,
  finalAmount,
}: OrderSummaryProps) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-28 h-fit rounded-[28px] border border-[#bd992d]/30 bg-[#F8F2E7] p-6 shadow-xl shadow-black/20 sm:p-8">
      <h3 className="mb-6 text-lg font-bold text-[#2A1E13] sm:text-xl">
        Tóm tắt đơn hàng
      </h3>

      <div className="mb-6 space-y-3 rounded-2xl border border-[#D8C79A] bg-white/75 p-4">
        {cart.map((item, index) => {
          const toppingNames = getToppingNames(item.toppings);

          return (
            <div
              key={`${item.id}-${index}`}
              className="flex items-start justify-between gap-4 border-b border-[#E8DDBF] pb-3 last:border-b-0 last:pb-0"
            >
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-[#2A1E13]">
                  {item.title}
                </span>

                {"size" in item && item.size && (
                  <div className="mt-1 text-xs font-medium text-[#6F5A3A]">
                    Size {String(item.size).toUpperCase()}
                  </div>
                )}

                {toppingNames.length > 0 && (
                  <div className="mt-1 text-xs font-medium text-[#6F5A3A]">
                    + {toppingNames.join(", ")}
                  </div>
                )}

                <div className="mt-1 text-xs font-medium text-[#6F5A3A]">
                  x {item.quantity}
                </div>
              </div>

              <span className="shrink-0 text-sm font-bold text-[#7A5C12]">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 border-b border-[#D8C79A] pb-5">
        <div className="flex justify-between gap-4 text-sm text-[#5F5238]">
          <span>Tạm tính:</span>
          <span className="font-semibold text-[#2A1E13]">
            {formatPrice(subtotal)}
          </span>
        </div>

        {usePointsAmount > 0 && (
          <div className="flex justify-between gap-4 text-sm font-semibold text-[#7A5C12]">
            <span>Giảm từ điểm:</span>
            <span>-{formatPrice(discountFromPoints)}</span>
          </div>
        )}

        {discountFromTier > 0 && (
          <div className="flex justify-between gap-4 text-sm font-semibold text-[#7A5C12]">
            <span>Giảm hạng thành viên ({discountPercentage * 100}%):</span>
            <span>-{formatPrice(discountFromTier)}</span>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <span className="font-bold text-[#2A1E13]">Tổng cộng</span>

        <span className="text-2xl font-black text-[#5A3A12] sm:text-3xl">
          {formatPrice(finalAmount)}
        </span>
      </div>

      {usePointsAmount > 0 && (
        <div className="mt-5 rounded-xl border border-[#bd992d]/30 bg-[#FFF8E6] p-4">
          <p className="text-xs font-medium leading-5 text-[#6F5411]">
            <span className="font-bold text-[#2A1E13]">Gợi ý:</span> Bạn sẽ
            nhận {Math.floor(subtotal / 10).toLocaleString()} điểm từ đơn
            hàng này. (10% của giá trị đơn hàng)
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate("/cart")}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#D8C79A] bg-white px-4 py-3 text-sm font-bold text-[#3A2A12] transition hover:border-[#bd992d] hover:bg-[#FFF8E6]"
      >
        <FiX size={16} />
        Quay về giỏ hàng
      </button>
    </div>
  );
}