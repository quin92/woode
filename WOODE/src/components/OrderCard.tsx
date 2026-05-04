import {
  FiTruck,
  FiXCircle,
  FiClock,
} from "react-icons/fi";
import type { Order, OrderStatus } from "../contexts/OrdersContext";

interface Props {
  order: Order;
  onClick?: (order: Order) => void;
}

function OrderCard({ order, onClick }: Props) {
  const formatPrice = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(value) + "đ";

  const formatOrderCode = (id: number) =>
    `ORD-${String(id).padStart(3, "0")}`;

  const MAX_ITEMS = 4;
  const visibleItems = order.items.slice(0, MAX_ITEMS);
  const remaining = order.items.length - MAX_ITEMS;

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return <FiClock />;
      case "CONFIRMED":
      case "SHIPPING":
        return <FiTruck />;
      case "CANCELLED":
        return <FiXCircle />;
      default:
        return <FiClock />;
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "Đang xử lý";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "SHIPPING":
        return "Đang giao";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };
const getStatusCardStyle = (status: OrderStatus) => {
  switch (status) {
    case "PENDING":
      return "bg-gradient-to-t from-amber-200 via-white to-white";
    case "CONFIRMED":
      return "bg-gradient-to-t from-sky-200 via-white to-white";
    case "SHIPPING":
      return "bg-gradient-to-t from-[#7bcb8b]   via-white to-white";
    case "CANCELLED":
      return "bg-gradient-to-t from-[#da9191] via-white to-white";
    default:
      return "bg-white";
  }
};
  return (
    <div
  onClick={() => onClick?.(order)}
  className={`w-full cursor-pointer rounded-2xl border border-neutral-200 p-4 shadow-sm transition hover:shadow-lg hover:-translate-y-1 ${getStatusCardStyle(
    order.status
  )}`}
>
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-neutral-700">Mã đơn</p>
          <p className="font-bold text-neutral-900">
            {formatOrderCode(order.id)}
          </p>
          <p className="text-xs text-neutral-700">
            {new Date(order.createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-neutral-700">Tổng</p>
          <p className="font-bold text-[#D4AF37]">
            {formatPrice(order.total)}
          </p>
        </div>
      </div>

      {/* ITEMS */}
      <div className="mt-3 space-y-1 text-sm">
        {visibleItems.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span className="truncate font-semibold text-[#2A211A]">{item.productName}</span>
            <span className="text-neutral-700">
              {formatPrice(item.basePrice)}
            </span>
          </div>
        ))}

        {remaining > 0 && (
          <div className="text-xs text-neutral-700">
            +{remaining} món khác
          </div>
        )}
      </div>

      {/* FOOT */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-neutral-700">
          {order.items.length} món
        </span>

        <div className="flex items-center gap-1 text-neutral-700">
          {getStatusIcon(order.status)}
          {getStatusText(order.status)}
        </div>
      </div>
    </div>
  );
}

export default OrderCard;