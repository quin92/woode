import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "../contexts/OrdersContext";
import { useAuth } from "../contexts/AuthContext";
import OrderCard from "../components/OrderCard";
import { getSocket } from "../lib/socket";
import type {
  Order,
  OrderItem,
  OrderStatus,
} from "../contexts/OrdersContext";

// Retry Payment Button Component
interface RetryPaymentButtonProps {
  orderId: number;
}

function RetryPaymentButton({ orderId }: RetryPaymentButtonProps) {
  const { retryPayment, fetchOrders } = useOrders();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRetryVNPay = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await retryPayment(orderId, "VNPAY");
      
      if (result.nextAction === "REDIRECT" && result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        alert("Không thể tạo liên kết thanh toán. Vui lòng thử lại.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lỗi khi thử lại thanh toán";
      setError(message);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryCOD = async () => {
    setLoading(true);
    setError(null);
    try {
      await retryPayment(orderId, "CASH");
      await fetchOrders();
      alert("Chuyển sang phương thức COD thành công");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lỗi khi thay đổi phương thức thanh toán";
      setError(message);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 mt-4 border-t border-[#4A4035] pt-4">
      <p className="text-sm text-[#E0B84F] mb-3">Phương thức thanh toán thất bại. Vui lòng thử lại:</p>
      <div className="flex gap-3">
        <button
          onClick={handleRetryVNPay}
          disabled={loading}
          className="flex-1 bg-[#1F1C18] border border-[#D8A94A] text-[#E0B84F] hover:bg-[#D8A94A] hover:text-[#1A1A1A] disabled:opacity-50 font-semibold py-2.5 rounded-xl transition"
        >
          {loading ? "Đang xử lý..." : "Thử lại VNPAY"}
        </button>
        <button
          onClick={handleRetryCOD}
          disabled={loading}
          className="flex-1 bg-[#1F1C18] border border-[#4A4035] text-[#F5F0EB] hover:bg-[#4A4035] disabled:opacity-50 font-semibold py-2.5 rounded-xl transition"
        >
          {loading ? "Đang xử lý..." : "Chuyển sang COD"}
        </button>
      </div>
      {error && <p className="text-[#D4AF37] text-sm mt-2">{error}</p>}
    </div>
  );
}

function MyOrders() {
  const navigate = useNavigate();
  const { orders, fetchOrders, loading } = useOrders();
  const { user, fetchMe } = useAuth();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    if (!user?.id) return;

    fetchOrders();

    const socket = getSocket();

    const handleNewOrder = (order: { userId?: number }) => {
      if (!user?.id || order.userId !== user.id) return;
      fetchOrders();
    };

    const handleOrderUpdated = (order: { userId?: number }) => {
      if (!user?.id || order.userId !== user.id) return;
      fetchOrders();
      fetchMe();
    };

    socket.on("new-order", handleNewOrder);
    socket.on("order-updated", handleOrderUpdated);

    const handleFocus = () => {
      fetchOrders();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchOrders();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      socket.off("new-order", handleNewOrder);
      socket.off("order-updated", handleOrderUpdated);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!selectedOrder) return;

    const latestOrder = orders.find((order) => order.id === selectedOrder.id);
    if (!latestOrder) {
      setSelectedOrder(null);
      return;
    }

    if (latestOrder !== selectedOrder) {
      setSelectedOrder(latestOrder);
    }
  }, [orders, selectedOrder]);

  const userOrders = user
    ? orders.filter((order) => order.userId === user.id)
    : [];

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(value) + "đ";

  const getOrderItemTotal = (item: OrderItem) => {
    return item.basePrice * item.quantity;
  };

  const getOrderSubtotal = (order: Order) => {
    return order.items.reduce((sum, item) => sum + (item.basePrice * item.quantity), 0);
  };

  const getEarnedPoints = (order: Order) => {
    const subtotal = getOrderSubtotal(order);
    return Math.floor(subtotal * 0.1); // 10% của giá gốc
  };

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getTimelineStatusText = (status: OrderStatus) => {
    switch (status) {
      case "PENDING": return "Đã đặt hàng";
      case "CONFIRMED": return "Đã xác nhận";
      case "PREPARING": return "Đang chuẩn bị";
      case "SHIPPING": return "Đang giao";
      case "COMPLETED":
      case "DELIVERED": return "Đã giao thành công";
      case "CANCELLED": return "Đã hủy đơn";
      default: return status;
    }
  };

  const getTimelineDotColor = (status: OrderStatus) => {
    switch (status) {
      case "PENDING": return "border-amber-500 bg-amber-900";
      case "CONFIRMED": return "border-sky-500 bg-sky-900";
      case "PREPARING": return "border-violet-500 bg-violet-900";
      case "SHIPPING": return "border-[#D4AF37] bg-[#8B6F47]/20";
      case "COMPLETED":
      case "DELIVERED": return "border-[#D4AF37] bg-[#8B6F47]/20";
      case "CANCELLED": return "border-[#D4AF37] bg-[#8B6F47]/10";
      default: return "border-neutral-500 bg-neutral-800";
    }
  };

  const removeVietnameseTones = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  };

  const normalizedSearch = removeVietnameseTones(search);

  const filteredOrders = userOrders.filter((order) => {
    const matchSearch =
      search === "" ||
      order.items.some((item) =>
        removeVietnameseTones(item.productName).includes(normalizedSearch)
      );

    const orderDate = new Date(order.createdAt).getTime();
    const matchFrom = fromDate ? orderDate >= new Date(fromDate).getTime() : true;
    const matchTo = toDate ? orderDate <= new Date(toDate).getTime() : true;

    return matchSearch && matchFrom && matchTo;
  });

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  if (!user) {
    return (
      <div className="mx-auto mt-24 w-full max-w-5xl px-4 py-14 text-center">
        <h1 className="mb-4 text-3xl  font-['Noto_Serif'] font-bold text-[#F5F0EB]">Vui lòng đăng nhập</h1>
        <button
          onClick={() => navigate("/login")}
          className="rounded-full bg-gradient-to-r from-[#D8A94A] to-[#E0B84F] px-8 py-3 text-[#1A1A1A] font-bold"
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="mx-auto w-full max-w-5xl px-4 py-24 text-center text-[#E0B84F]">Đang tải...</div>;
  }

  return (
    <div className="mx-auto mt-24 w-full max-w-6xl px-4 py-8 text-[#F5F0EB]">
      {/* HEADER */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-4xl  font-['Noto_Serif'] font-black text-[#F5F0EB]">Đơn hàng của tôi</h1>
        <p className="text-[#E0B84F] mt-2">
          {filteredOrders.length} đơn hàng
        </p>
      </div>

      {/* FILTER */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between bg-[#1A1A1A] p-6 rounded-2xl border border-[#1F1C18] shadow-lg">
        {/* Search */}
        <div className="w-full sm:w-1/2">
          <label className="text-sm text-[#E0B84F] mb-2 block">Tìm kiếm sản phẩm</label>
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Tên sản phẩm..."
            className="w-full rounded-xl border border-[#4A4035] bg-[#1F1C18] px-4 py-3 text-sm text-[#F5F0EB] placeholder:text-[#6A6A6A] focus:border-[#D8A94A] outline-none transition-colors"
          />
        </div>

        {/* Date filters */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div>
            <label className="text-sm text-[#E0B84F] mb-2 block">Từ ngày</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setPage(1);
                setFromDate(e.target.value);
              }}
              className="w-full sm:w-auto rounded-xl border border-[#4A4035] bg-[#1F1C18] px-4 py-3 text-sm text-[#F5F0EB] outline-none transition-colors focus:border-[#D8A94A] color-scheme-dark"
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <div>
            <label className="text-sm text-[#E0B84F] mb-2 block">Đến ngày</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setPage(1);
                setToDate(e.target.value);
              }}
              className="w-full sm:w-auto rounded-xl border border-[#4A4035] bg-[#1F1C18] px-4 py-3 text-sm text-[#F5F0EB] outline-none transition-colors focus:border-[#D8A94A]"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>
      </div>

      {/* EMPTY */}
      {paginatedOrders.length === 0 ? (
        <div className="text-center py-16 text-[#E0B84F] bg-[#1A1A1A] rounded-2xl border border-[#1F1C18]">
          Không có đơn hàng nào
        </div>
      ) : (
        <>
          {/* GRID */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={(o) => setSelectedOrder(o)}
              />
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    page === i + 1
                      ? "bg-[#D8A94A] text-[#1A1A1A] font-bold"
                      : "bg-[#1F1C18] text-[#E0B84F] border border-[#4A4035] hover:bg-[#4A4035] hover:text-[#F5F0EB]"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* POPUP */}
      {selectedOrder && (
        <div 
          onClick={() => setSelectedOrder(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/80 backdrop-blur-sm px-4" 
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] bg-[#1A1A1A] border border-[#4A4035] shadow-2xl custom-scrollbar" 
          >
            {/* HEADER */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#4A4035] bg-[#1A1A1A]/95 backdrop-blur px-8 py-5">
              <div>
                <h2 className="text-xl  font-['Noto_Serif'] font-bold text-[#F5F0EB]"> 
                  Đơn hàng #{selectedOrder.id}
                </h2>
                <p className="text-sm text-[#E0B84F] mt-1">
                  {new Date(selectedOrder.createdAt).toLocaleDateString("vi-VN", { hour: '2-digit', minute: '2-digit' })} 
                </p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="h-10 w-10 rounded-full bg-[#1F1C18] text-[#E0B84F] hover:bg-[#4A4035] hover:text-[#F5F0EB] flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div> 
            
            <div className="p-8 space-y-8">
              {/* TIMELINE */}
              <div>
                <h3 className="mb-6  font-['Noto_Serif'] font-bold text-lg text-[#E0B84F]">Tiến trình đơn hàng</h3>
                <div className="flex overflow-x-auto justify-center items-center text-center pb-4 custom-scrollbar">
                  {selectedOrder.logs?.map((log, index, arr) => {
                    const isLast = index === arr.length - 1;
                    return (
                      <div key={log.id} className="relative flex min-w-[120px] flex-col items-center text-center" >
                        <div className={`z-10 h-10 w-10 rounded-full border-[3px] shadow-lg ${getTimelineDotColor(log.status)}`} />
                        {!isLast && (
                          <div className="absolute top-5 left-1/2 h-0.5 w-full bg-[#4A4035]" />
                        )}
                        <p className="mt-3 text-sm font-semibold text-[#F5F0EB]"> 
                          {getTimelineStatusText(log.status)}
                        </p>
                        <span className="text-xs text-[#E0B84F] mt-1"> 
                          {formatTime(log.createdAt)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ITEMS */}
              <div>
                <h3 className="mb-4  font-['Noto_Serif'] font-bold text-lg text-[#E0B84F]">Sản phẩm</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-2xl bg-[#1F1C18] border border-[#4A4035] p-4"
                    >
                      <img
                        src={item.product?.imageUrl || "/placeholder.png"}
                        alt={item.productName}
                        className="h-20 w-20 rounded-xl object-cover border border-[#1A1A1A]"
                      />
                      <div className="flex-1 text-left">
                        <p className="font-bold text-[#F5F0EB] text-lg">{item.productName}</p>
                        <p className="text-sm text-[#E0B84F] mt-1">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-[#E0B84F] text-lg">
                        {formatPrice(getOrderItemTotal(item))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* INFO */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#1F1C18] border border-[#4A4035] p-6">
                  <p className="text-xs uppercase tracking-wider text-[#E0B84F] mb-3">Thông tin nhận hàng</p>
                  <p className="font-bold text-[#F5F0EB] text-lg">{selectedOrder.user?.name}</p>
                  <p className="text-sm text-[#E0B84F] mt-1 mb-2">{selectedOrder.phone}</p> 
                  <p className="text-sm text-[#E0B84F] leading-relaxed">
                    {selectedOrder.address}
                  </p> 
                </div> 
                
                <div className="rounded-2xl bg-[#1F1C18] border border-[#4A4035] p-6">
                  <p className="text-xs uppercase tracking-wider text-[#E0B84F] mb-4">Điểm thưởng</p>
                  <div className="space-y-3">
                    {selectedOrder.usedPoint > 0 && (
                      <div className="flex justify-between items-center pb-3 border-b border-[#4A4035]">
                        <span className="text-sm text-[#E0B84F]">Điểm đã sử dụng</span>
                        <span className="font-semibold text-[#F5F0EB]">-{selectedOrder.usedPoint}</span>
                      </div>
                    )}
                    {getEarnedPoints(selectedOrder) > 0 && (
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[#E0B84F]">Sẽ tích lũy thêm</span>
                          <span className="font-bold text-[#4A7C59]">+{getEarnedPoints(selectedOrder)}</span>
                        </div>
                        <p className="text-xs text-[#E0B84F] mt-1">(10% giá gốc = {formatPrice(getEarnedPoints(selectedOrder))})</p>
                      </div>
                    )}
                    {selectedOrder.status === "COMPLETED" && (
                      <div className="pt-2 border-t border-[#4A4035] text-xs text-green-500">
                        ✓ Điểm đã được cộng vào tài khoản
                      </div>
                    )}
                    {selectedOrder.status !== "COMPLETED" && (
                      <div className="pt-2 border-t border-[#4A4035] text-xs text-yellow-600">
                        ⏳ Điểm sẽ được cộng khi đơn hàng hoàn thành
                      </div>
                    )}
                  </div>
                </div> 
              </div> 

              {/* PAYMENT STATUS */}
              {selectedOrder.payments && selectedOrder.payments.length > 0 && (
                <div className="rounded-2xl bg-[#1F1C18] border border-[#4A4035] p-6">
                  <p className="text-xs uppercase tracking-wider text-[#E0B84F] mb-4">Lịch sử thanh toán</p>
                  <div className="space-y-4">
                    {selectedOrder.payments.map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center bg-[#1A1A1A] p-4 rounded-xl border border-[#4A4035]">
                        <div>
                          <p className="text-sm font-bold text-[#F5F0EB]">
                            {payment.method === "CASH" ? "Thanh toán khi nhận hàng (COD)" : payment.method}
                          </p>
                          <p className="text-xs text-[#E0B84F] mt-1">{payment.amount.toLocaleString("vi-VN")}đ</p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                          payment.status === "SUCCESS" ? "bg-[#8B6F47]/20 text-[#D4AF37] border border-[#D4AF37]/30" :
                          payment.status === "FAILED" ? "bg-[#8B6F47]/10 text-[#D4AF37] border border-[#D4AF37]/30" :
                          payment.status === "PENDING" ? "bg-amber-900/30 text-amber-500 border border-amber-500/30" :
                          "bg-[#4A4035] text-[#E0B84F]"
                        }`}>
                          {payment.status === "SUCCESS" ? "Thành công" :
                           payment.status === "FAILED" ? "Thất bại" :
                           payment.status === "PENDING" ? "Chờ xử lý" :
                           payment.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* RETRY PAYMENT BUTTON */}
                  {selectedOrder.status === "PENDING" && 
                   selectedOrder.payments?.some(p => p.status === "FAILED") && (
                    <RetryPaymentButton orderId={selectedOrder.id} />
                  )}
                </div>
              )}

              {/* TOTAL */} 
              <div className="flex justify-between items-center border-t border-[#4A4035] pt-6 pb-2">
                <span className="text-xl  font-['Noto_Serif'] text-[#F5F0EB]">Tổng cộng</span> 
                <span className="text-3xl font-bold text-[#D8A94A]"> {formatPrice(selectedOrder.total)} </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}

export default MyOrders;