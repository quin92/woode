import { useEffect, useMemo, useState } from "react"
import {
  Bell,
  ClipboardList,
  Truck,
  CheckCircle2,
  Eye,
  BadgeCheck,
  XCircle,
  Loader2,
} from "lucide-react"
import { socket } from "@/lib/socket"
import axios from "@/utils/axios"
import { Button } from "@/components/ui/button"

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED"


type OrderItem = {
  id: number
  productId: number
  quantity: number
  productName: string
  basePrice: number
  product?: {
    imageUrl: string | null
  }
}

type Payment = {
  id: number
  method: string
  status: string
  amount: number
  transactionId?: string | null
  paidAt?: string | null
}

type OrderLog = {
  id: number
  status: OrderStatus
  note?: string | null
  createdAt: string
}

type User = {
  id: number
  name?: string | null
  email: string
  phone: string
  address?: string | null
  role: string
}

type Order = {
  id: number
  userId: number
  total: number
  status: OrderStatus
  phone: string
  address: string
  createdAt: string
  updatedAt: string
  earnedPoint: number
  usedPoint: number
  user: User
  items: OrderItem[]
  payments: Payment[]
  logs: OrderLog[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("vi-VN")
}

function getStatusLabel(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return "Đơn mới"
    case "CONFIRMED":
      return "Đã xác nhận"
    case "SHIPPING":
      return "Đang giao"
    case "COMPLETED":
      return "Hoàn thành"
    case "CANCELLED":
      return "Đã hủy"
    default:
      return status
  }
}

function getStatusClass(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return "bg-blue-100 text-blue-700"
    case "CONFIRMED":
      return "bg-yellow-100 text-yellow-700"
    case "SHIPPING":
      return "bg-purple-100 text-purple-700"
    case "COMPLETED":
      return "bg-green-100 text-green-700"
    case "CANCELLED":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState<OrderStatus | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await axios.get("/orders")
      const fetchedOrders: Order[] = res.data

      setOrders(fetchedOrders)

      setSelectedOrder((prev) => {
        if (!prev) return fetchedOrders[0] || null

        const updatedSelected = fetchedOrders.find((o) => o.id === prev.id)
        return updatedSelected || fetchedOrders[0] || null
      })
    } catch (error) {
      console.error("Fetch orders failed:", error)
      alert("Không thể tải danh sách đơn hàng")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()

    socket.on("connect", () => {
      console.log("  Socket connected:", socket.id)
    })

    socket.on("new-order", (newOrder: Order) => {
      console.log("  New order:", newOrder)

      setOrders((prev) => {
        const existed = prev.some((o) => o.id === newOrder.id)
        if (existed) return prev
        return [newOrder, ...prev]
      })

      setSelectedOrder((prev) => prev ?? newOrder)

      alert(`Có đơn hàng mới #${newOrder.id}`)
    })

    socket.on("order-updated", (updatedOrder: Order) => {
      console.log("  Order updated:", updatedOrder)

      setOrders((prev) =>
        prev.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      )

      setSelectedOrder((prev) =>
        prev?.id === updatedOrder.id ? updatedOrder : prev
      )
    })

    return () => {
      socket.off("connect")
      socket.off("new-order")
      socket.off("order-updated")
    }
  }, [])


  const stats = useMemo(() => {
    return {
      pending: orders.filter((o) => o.status === "PENDING").length,
      confirmed: orders.filter((o) => o.status === "CONFIRMED").length,
      shipping: orders.filter((o) => o.status === "SHIPPING").length,
      completed: orders.filter((o) => o.status === "COMPLETED").length,
    }
  }, [orders])

  const notifications = useMemo(() => {
    return orders.filter((o) => o.status === "PENDING")
  }, [orders])

  const updateOrderStatus = async (id: number, newStatus: OrderStatus) => {
    try {
      setUpdatingStatus(newStatus)

      await axios.patch(`/orders/${id}/status`, {
        status: newStatus,
      })

      const updatedOrders = orders.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )

      setOrders(updatedOrders)

      const found = updatedOrders.find((o) => o.id === id) || null
      setSelectedOrder(found)

      // optional: load lại từ server để đồng bộ logs/payments nếu cần
      await fetchOrders()
    } catch (error: any) {
      console.error("Update status failed:", error)
      alert(error.response?.data?.message || "Cập nhật trạng thái thất bại")
    } finally {
      setUpdatingStatus(null)
    }
  }

  const isAwaitingVNPayPayment = (order?: Order | null) => {
    if (!order) return false

    const latestVNPayPayment = [...(order.payments || [])]
      .filter((payment) => payment.method === "VNPAY")
      .sort((a, b) => b.id - a.id)[0]

    return Boolean(latestVNPayPayment && latestVNPayPayment.status !== "SUCCESS")
  }

  const canMoveToConfirmed =
    selectedOrder?.status === "PENDING" &&
    !isAwaitingVNPayPayment(selectedOrder)
  const canMoveToShipping = selectedOrder?.status === "CONFIRMED"
  const canMoveToCompleted = selectedOrder?.status === "SHIPPING"
  const canCancel =
    selectedOrder?.status === "PENDING" || selectedOrder?.status === "CONFIRMED"

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý đơn hàng, tiếp nhận đơn mới và theo dõi trạng thái xử lý.
          </p>
        </div>

        <div className="rounded-xl border bg-white px-4 py-2 shadow-sm">
          <p className="text-sm text-muted-foreground">Hôm nay</p>
          <p className="font-semibold">
            {new Date().toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Đơn mới</p>
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold">{stats.pending}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cần xác nhận ngay
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Đã xác nhận</p>
            <ClipboardList className="h-5 w-5 text-yellow-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold">{stats.confirmed}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Đang chuẩn bị đơn
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Đang giao</p>
            <Truck className="h-5 w-5 text-purple-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold">{stats.shipping}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Đơn đang vận chuyển
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Hoàn thành</p>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold">{stats.completed}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Đã giao thành công
          </p>
        </div>
      </div>

      {/* Main */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Left */}
        <div className="space-y-6 xl:col-span-2">
          {/* Notifications */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Thông báo đơn mới</h2>
                <p className="text-sm text-muted-foreground">
                  Các đơn hàng cần staff xác nhận và xử lý
                </p>
              </div>
              <Bell className="h-5 w-5 text-slate-500" />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tải đơn hàng...
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.length > 0 ? (
                  notifications.map((order) => {
                    const waitingForVNPay = isAwaitingVNPayPayment(order)

                    return (
                      <div
                        key={order.id}
                        className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="font-semibold">
                            Đơn #{order.id} - {order.user?.name || "Khách hàng"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(order.createdAt)} •{" "}
                            {formatCurrency(order.total)}
                          </p>
                          {waitingForVNPay && (
                            <p className="mt-1 text-xs font-medium text-amber-700">
                              Chờ thanh toán VNPay thành công trước khi nhận đơn
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedOrder(order)
                              setIsDetailOpen(true)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Xem
                          </Button>

                          <Button
                            disabled={updatingStatus !== null || waitingForVNPay}
                            onClick={() => updateOrderStatus(order.id, "CONFIRMED")}
                          >
                            <BadgeCheck className="mr-2 h-4 w-4" />
                            Nhận đơn
                          </Button>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Hiện chưa có đơn mới.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order List */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Danh sách đơn hàng</h2>
              <p className="text-sm text-muted-foreground">
                Theo dõi các đơn gần đây và trạng thái xử lý
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tải dữ liệu...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Mã đơn</th>
                      <th className="pb-3 font-medium">Khách hàng</th>
                      <th className="pb-3 font-medium">Thời gian</th>
                      <th className="pb-3 font-medium">Tổng tiền</th>
                      <th className="pb-3 font-medium">Trạng thái</th>
                      <th className="pb-3 font-medium text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b transition hover:bg-slate-50"
                      >
                        <td className="py-4 font-medium">#{order.id}</td>
                        <td className="py-4">
                          {order.user?.name || "Khách hàng"}
                        </td>
                        <td className="py-4">{formatDate(order.createdAt)}</td>
                        <td className="py-4">{formatCurrency(order.total)}</td>
                        <td className="py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDetailOpen(true);
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {orders.length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Chưa có đơn hàng nào.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/** Order Detail Modal */}
      {isDetailOpen && selectedOrder && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
        <div>
          <h2 className="text-2xl font-bold">Chi tiết đơn hàng #{selectedOrder.id}</h2>
          <p className="text-sm text-muted-foreground">
            Xem đầy đủ thông tin và cập nhật trạng thái đơn hàng
          </p>
        </div>

        <button
          onClick={() => setIsDetailOpen(false)}
          className="rounded-full p-2 transition hover:bg-slate-100"
        >
          <XCircle className="h-6 w-6 text-slate-500" />
        </button>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-3">
        {/* LEFT */}
        <div className="space-y-6 lg:col-span-2">
          {/* Customer Info */}
          <div className="rounded-2xl border bg-slate-50 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Thông tin khách hàng</h3>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                  selectedOrder.status
                )}`}
              >
                {getStatusLabel(selectedOrder.status)}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2 text-sm">
              <div>
                <p className="text-muted-foreground">Khách hàng</p>
                <p className="font-medium">{selectedOrder.user?.name || "Khách hàng"}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Số điện thoại</p>
                <p className="font-medium">{selectedOrder.phone}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-muted-foreground">Địa chỉ giao hàng</p>
                <p className="font-medium">{selectedOrder.address}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Thời gian đặt</p>
                <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Cập nhật gần nhất</p>
                <p className="font-medium">{formatDate(selectedOrder.updatedAt)}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-muted-foreground">Ghi chú đơn hàng</p>
                <p className="font-medium">
                  {"Chưa có ghi chú"}
                </p>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Danh sách sản phẩm</h3>
            <div className="space-y-4">
              {selectedOrder.items.map((item) => {
                const itemPrice = item.basePrice * item.quantity

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border p-4 shadow-sm"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-slate-100 overflow-hidden">
                        {item.product?.imageUrl ? (
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.productName} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="text-xs text-slate-400">Ảnh SP</div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-base font-semibold">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              Số lượng: {item.quantity}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Giá gốc: {formatCurrency(item.basePrice)}
                            </p>
                          </div>

                          <p className="text-base font-bold">
                            {formatCurrency(itemPrice)}
                          </p>
                        </div>


                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Logs */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Lịch sử đơn hàng</h3>
            <div className="space-y-3">
              {selectedOrder.logs?.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{getStatusLabel(log.status)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(log.createdAt)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {log.note || "Không có ghi chú"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* Payment */}
          <div className="rounded-2xl border bg-slate-50 p-5">
            <h3 className="mb-4 text-lg font-semibold">Thanh toán</h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tổng thanh toán</span>
                <span className="text-xl font-bold">
                  {formatCurrency(selectedOrder.total)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Điểm đã dùng</span>
                <span className="font-medium">{selectedOrder.usedPoint}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Điểm tích được</span>
                <span className="font-medium">{selectedOrder.earnedPoint}</span>
              </div>

              {selectedOrder.payments?.[0] && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Phương thức</span>
                    <span className="font-medium">
                      {selectedOrder.payments[0].method}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Trạng thái</span>
                    <span className="font-medium">
                      {selectedOrder.payments[0].status}
                    </span>
                  </div>

                  {selectedOrder.payments[0].transactionId && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Mã giao dịch</span>
                      <span className="font-medium">
                        {selectedOrder.payments[0].transactionId}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-2xl border p-5">
            <h3 className="mb-4 text-lg font-semibold">Cập nhật trạng thái</h3>

            <div className="grid gap-3">
              <Button
                disabled={!canMoveToConfirmed || updatingStatus !== null}
                onClick={() =>
                  updateOrderStatus(selectedOrder.id, "CONFIRMED")
                }
              >
                {updatingStatus === "CONFIRMED" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Xác nhận đơn
              </Button>

              <Button
                variant="outline"
                disabled={!canMoveToShipping || updatingStatus !== null}
                onClick={() =>
                  updateOrderStatus(selectedOrder.id, "SHIPPING")
                }
              >
                {updatingStatus === "SHIPPING" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Chuyển sang Đang giao
              </Button>

              <Button
                variant="outline"
                disabled={!canMoveToCompleted || updatingStatus !== null}
                onClick={() =>
                  updateOrderStatus(selectedOrder.id, "COMPLETED")
                }
              >
                {updatingStatus === "COMPLETED" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Đánh dấu Hoàn thành
              </Button>

              <Button
                variant="destructive"
                disabled={!canCancel || updatingStatus !== null}
                onClick={() =>
                  updateOrderStatus(selectedOrder.id, "CANCELLED")
                }
              >
                {updatingStatus === "CANCELLED" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Hủy đơn
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  )
}