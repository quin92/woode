import { FiAward } from "react-icons/fi";
import React from "react";
import { Modal } from "../../profile/components/Modal";
import { useAuth } from "../../contexts/AuthContext";
import {
  getTierBySpent,
  getNextTier,
  getAmountToNextTier,
  getProgressToNextTier,
} from "../../constants/tiers.constants";

export default function Loyalty() {
  const [open, setOpen] = React.useState(false);
  const { user } = useAuth();

  // Use real user data from context, fallback to defaults if not logged in
  const userData = user ? {
    totalSpent: user.totalSpent || 0,
    totalOrders: user.totalOrders || 0,
    loyaltyPoint: user.loyaltyPoint || 0,
  } : {
    totalSpent: 0,
    totalOrders: 0,
    loyaltyPoint: 0,
  };

  const formatPrice = (value: number) => {
    return value.toLocaleString("vi-VN");
  };

  const spent = userData.totalSpent;
  const currentTier = getTierBySpent(spent);
  const nextTier = getNextTier(spent);
  const progress = getProgressToNextTier(spent);
  const remaining = getAmountToNextTier(spent);

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 mt-20">
      <div className="w-full rounded-2xl bg-[#d6d3cf] p-8 shadow-xl text-[#2A1E13]">
        {/* ===== HEADER (CENTER) ===== */}
        <div className="flex flex-col items-center mb-8">
          <FiAward className="text-4xl mb-2 drop-shadow-lg text-[#8F6418]" />

          <h1 className="text-4xl font-extrabold tracking-wide drop-shadow-lg text-[#2A1E13]">
            {currentTier.displayName.toUpperCase()}
          </h1>

          <p className="text-[#6F5A3A] text-sm mt-2">
            Hạng thành viên
            {currentTier.discount > 0 && (
              <span className="ml-2 text-[#A87822] font-bold">
                • Giảm {currentTier.discount}%
              </span>
            )}
          </p>

          <button onClick={() => setOpen(true)} className="text-[#A87822] font-semibold">
            Xem chi tiết
          </button>
        </div>

        {/* ===== CARD ===== */}
        <div className="w-full bg-gray-50 rounded-2xl p-6 shadow-lg">
          <div className="text-[#2A1E13]">
            {/* ===== TEXT MỤC TIÊU ===== */}
            {nextTier ? (
              <p className="text-sm font-semibold text-[#5A4328] mb-4 text-center">
                Còn{" "}
                <span className="text-[#A87822] font-bold">
                  {formatPrice(remaining)}
                </span>{" "}
                để lên hạng <span className="font-bold">{nextTier.displayName}</span>
              </p>
            ) : (
              <p className="text-sm font-semibold text-[#A87822] mb-4 text-center">
                👑 Bạn đã đạt hạng cao nhất!
              </p>
            )}

            {/* ===== PROGRESS BAR ===== */}
            <div className="relative h-4 w-full bg-[#e1ddd0] rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-[#d6b658] via-[#c1a242] to-[#bd992d] transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />

              {/* TEXT Ở GIỮA */}
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#2A1E13] drop-shadow">
                {formatPrice(spent)} /{" "}
                {nextTier ? formatPrice(nextTier.min) : "MAX"}
              </div>
            </div>

            {/* ===== MỐC ===== */}
            <div className="flex justify-between text-xs text-[#6F5A3A] mb-5">
              <span>{formatPrice(currentTier.min)}</span>
              <span>{nextTier ? formatPrice(nextTier.min) : "MAX"}</span>
            </div>

            {/* ===== STATS ===== */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-[#6F5A3A] font-medium">Đơn hàng</p>
                <p className="font-bold text-lg text-[#A87822] mt-1">
                  {userData.totalOrders || 0}
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-[#6F5A3A] font-medium">Điểm</p>
                <p className="font-bold text-lg text-[#A87822] mt-1">
                  {userData.loyaltyPoint || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="max-w-md text-[#2A1E13]">
          {/* TITLE */}
          <h2 className="text-xl font-bold text-center mb-4 text-[#2A1E13]">
            🎁 Quy tắc tích điểm
          </h2>

          {/* ===== CÁCH TÍNH ĐIỂM ===== */}
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <p className="font-semibold mb-1 text-[#2A1E13]">Cách tính điểm</p>
            <p className="text-sm text-[#6F5A3A]">
              Với mỗi đơn hàng, bạn sẽ nhận được điểm thưởng dựa trên giá trị
              đơn:
            </p>
            <p className="text-sm mt-1 text-[#2A1E13]">
              💰{" "}
              <span className="font-bold text-[#A87822]">
                1.000 điểm = 1.000 vnđ
              </span>
            </p>
          </div>

          {/* ===== HẠNG THÀNH VIÊN ===== */}
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <p className="font-semibold mb-2 text-[#2A1E13]">Hạng thành viên & Giảm giá</p>

            <div className="space-y-1 text-sm text-[#5A4328]">
              <p>
                <span className="font-medium text-[#2A1E13]">Thường:</span> dưới 10.000.000đ{" "}
                <span className="text-[#A87822] font-bold">- 0%</span>
              </p>
              <p>
                <span className="font-medium text-[#2A1E13]">Bạc:</span> 10.000.000đ – dưới 50.000.000đ{" "}
                <span className="text-[#A87822] font-bold">- 0%</span>
              </p>
              <p>
                <span className="font-medium text-[#2A1E13]">Vàng:</span> 50.000.000đ – dưới 200.000.000đ{" "}
                <span className="text-[#A87822] font-bold">- 5%</span>
              </p>
              <p>
                <span className="font-medium text-[#2A1E13]">Bạch Kim:</span> từ 200.000.000đ trở lên{" "}
                <span className="text-[#A87822] font-bold">- 10%</span>
              </p>
            </div>
          </div>

          {/* ===== QUYỀN LỢI ===== */}
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <p className="font-semibold mb-1 text-[#2A1E13]">Quyền lợi</p>

            <ul className="text-sm text-[#6F5A3A] space-y-1">
              <li>💰 Tích điểm từ mỗi đơn hàng (10% giá gốc, trước discount)</li>
              <li>🎁 Dùng điểm để giảm giá (1.000 điểm = 1.000đ)</li>
              <li>📈 VÀNG: giảm 5% cho mỗi đơn</li>
              <li>👑 BẠCH KIM: giảm 10% cho mỗi đơn</li>
            </ul>
          </div>

          {/* ===== LƯU Ý ===== */}
          <div className="text-xs text-[#6F5A3A] mb-4 text-center">
            * Giảm giá theo hạng được tính trên tổng tiền hóa đơn (trước khi dùng điểm)</div>


          {/* BUTTON */}
          <button
            onClick={() => setOpen(false)}
            className="w-full bg-[#645b42] text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Đóng
          </button>
        </div>
      </Modal>
    </div>
  );
}
