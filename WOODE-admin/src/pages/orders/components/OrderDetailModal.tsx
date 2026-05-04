import { useOrder } from "../hooks/orders"
import {
  formatDate,
  formatPrice,
  getStatusColor,
  getStatusLabel,
  getStatusIcon,
} from "../utils/index"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Loader2 } from "lucide-react"

interface OrderDetailModalProps {
  orderId: number | null
  isOpen: boolean
  onClose: () => void
}

export function OrderDetailModal({
  orderId,
  isOpen,
  onClose,
}: OrderDetailModalProps) {
  const { data: order, isLoading, error } = useOrder(orderId ?? 0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Đơn hàng #{orderId}</h2>
            <p className="text-blue-100 mt-1">Chi tiết đơn hàng</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-blue-500 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="animate-spin mr-2" size={24} />
            <span>Đang tải chi tiết đơn hàng...</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-6 bg-red-50 text-red-700 border border-red-200 rounded-lg m-4">
            Lỗi khi tải chi tiết đơn hàng
          </div>
        )}

        {/* Content */}
        {order && !isLoading && (
          <div className="p-6 space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">ID đơn hàng</p>
                <p className="text-lg font-semibold text-blue-600">
                  #{order.id}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Ngày tạo</p>
                <p className="text-lg font-semibold">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Trạng thái</p>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    <span>{getStatusIcon(order.status)}</span>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Tổng cộng</p>
                <p className="text-lg font-bold text-green-600">
                  {formatPrice(order.total)}
                </p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Thông tin khách hàng
              </h3>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Tên khách hàng</p>
                  <p className="font-semibold">{order.user?.name || "N/A"}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{order.user?.email || "N/A"}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Số điện thoại</p>
                  <p className="font-semibold">{order.phone}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Vai trò</p>
                  <p className="font-semibold">{order.user?.role || "N/A"}</p>
                </div>

                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                  <p className="font-semibold">{order.address || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Sản phẩm trong đơn hàng
              </h3>

              <div className="space-y-3">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 bg-gray-50 flex gap-4"
                    >
                      {item.product?.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.productName}
                          className="h-20 w-20 object-cover rounded-md border bg-white"
                        />
                      ) : (
                        <div className="h-20 w-20 flex items-center justify-center bg-gray-200 rounded-md text-[10px] text-gray-400">
                          No image
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{item.productName}</p>
                            <p className="text-sm text-gray-600">
                              ID: {item.productId}
                            </p>
                          </div>

                          <p className="font-semibold text-blue-600">
                            x{item.quantity}
                          </p>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Giá cơ bản:</span>
                          <span>{formatPrice(item.basePrice)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Không có sản phẩm
                  </p>
                )}
              </div>
            </div>

            {/* Payment Info */}
            {order.payments && order.payments.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Thông tin thanh toán
                </h3>

                <div className="space-y-3">
                  {order.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Phương thức</p>
                          <p className="font-semibold">{payment.method}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Trạng thái</p>
                          <p
                            className={`font-semibold ${
                              payment.status === "SUCCESS"
                                ? "text-green-600"
                                : payment.status === "FAILED"
                                ? "text-red-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {payment.status}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Số tiền</p>
                          <p className="font-semibold">
                            {formatPrice(payment.amount)}
                          </p>
                        </div>

                        {payment.transactionId && (
                          <div>
                            <p className="text-sm text-gray-600">
                              ID Giao dịch
                            </p>
                            <p className="font-semibold text-xs">
                              {payment.transactionId}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Points Info */}
            {((order.earnedPoint ?? 0) > 0 ||
              (order.usedPoint ?? 0) > 0) && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Điểm thưởng</h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    {(order.earnedPoint ?? 0) > 0 && (
                      <div>
                        <p className="text-sm text-gray-600">
                          Điểm sẽ tích lũy
                        </p>

                        <p className="text-lg font-semibold text-green-600">
                          +{(order.earnedPoint ?? 0).toLocaleString("vi-VN")}{" "}
                          điểm
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          Tích 10% trên tổng giá trị đơn hàng
                        </p>
                      </div>
                    )}

                    {(order.usedPoint ?? 0) > 0 && (
                      <div>
                        <p className="text-sm text-gray-600">
                          Điểm đã sử dụng
                        </p>

                        <p className="text-lg font-semibold text-red-600">
                          -{(order.usedPoint ?? 0).toLocaleString("vi-VN")}{" "}
                          điểm
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          Giảm {formatPrice(order.usedPoint ?? 0)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div
                    className={`p-3 rounded-lg text-sm ${
                      order.status === "COMPLETED"
                        ? "bg-green-50 border border-green-200 text-green-700"
                        : "bg-yellow-50 border border-yellow-200 text-yellow-700"
                    }`}
                  >
                    {order.status === "COMPLETED" ? (
                      <p>
                        ✓ Điểm tích lũy đã được cộng vào tài khoản khách hàng
                      </p>
                    ) : (
                      <p>
                        ⏳ Điểm tích lũy sẽ được cộng khi đơn hàng hoàn thành
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Order Logs */}
            {order.logs && order.logs.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Lịch sử đơn hàng
                </h3>

                <div className="space-y-2">
                  {order.logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 border-l-4 border-blue-500 pl-4 py-2"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                              log.status
                            )}`}
                          >
                            {getStatusLabel(log.status)}
                          </span>

                          <span className="text-sm text-gray-600">
                            {formatDate(log.createdAt)}
                          </span>
                        </div>

                        {log.updatedBy && (
                          <p className="text-sm text-gray-600 mt-1">
                            Cập nhật bởi:{" "}
                            <span className="font-semibold">
                              {log.updatedBy.name || "N/A"}
                            </span>
                          </p>
                        )}

                        {log.note && (
                          <p className="text-sm text-gray-700 mt-1">
                            Ghi chú: {log.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </Card>
    </div>
  )
}