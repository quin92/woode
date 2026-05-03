import { FiTruck, FiCreditCard, FiShoppingBag, FiRotateCcw } from "react-icons/fi";

export default function PurchasePolicy() {
  const sections = [
    {
      title: "1. Quy trình đặt hàng",
      icon: <FiShoppingBag className="text-[#8B6F47]" />,
      content: "Khách hàng có thể đặt hàng trực tuyến thông qua Website hoặc Ứng dụng của WOODÉ. Sau khi xác nhận đơn hàng, hệ thống sẽ gửi thông báo và bắt đầu chuẩn bị sản phẩm."
    },
    {
      title: "2. Phương thức thanh toán",
      icon: <FiCreditCard className="text-[#D4AF37]" />,
      content: "Chúng tôi hỗ trợ đa dạng phương thức thanh toán: Thanh toán tiền mặt khi nhận hàng (COD), Ví điện tử, hoặc chuyển khoản qua cổng VNPAY để đảm bảo tính tiện lợi và an toàn."
    },
    {
      title: "3. Chính sách giao hàng",
      icon: <FiTruck className="text-[#8B6F47]" />,
      content: "Woodé cam kết giao hàng trong vòng 15-30 phút tùy khoảng cách. Phí vận chuyển sẽ được tính dựa trên quãng đường từ cửa hàng gần nhất đến vị trí của khách hàng."
    },
    {
      title: "4. Hoàn trả và hủy đơn",
      icon: <FiRotateCcw className="text-[#D4AF37]" />,
      content: "Quý khách có thể hủy đơn hàng trước khi cửa hàng bắt đầu chuẩn bị món. Trường hợp sản phẩm không đúng mô tả hoặc gặp vấn đề chất lượng, Woodé sẽ hỗ trợ đổi trả hoặc hoàn tiền ngay lập tức."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 mt-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black text-[#D4AF37] mb-4">Chính sách mua hàng</h1>
        <p className="text-neutral-300">Những hướng dẫn và quy định giúp bạn có trải nghiệm mua sắm tốt nhất tại Woodé.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 mb-12">
        {sections.map((sec, idx) => (
          <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100 flex gap-6 hover:shadow-md transition">
            <div className="text-3xl shrink-0 mt-1">{sec.icon}</div>
            <div>
              <h3 className="text-xl font-bold mb-3 text-[#3c2718]">{sec.title}</h3>
              <p className="text-neutral-500 leading-relaxed">{sec.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 bg-neutral-100 rounded-3xl text-sm text-neutral-600 space-y-4">
        <p className="font-bold">Lưu ý quan trọng:</p>
        <p>- Woodé có quyền từ chối các đơn hàng có dấu hiệu giả mạo hoặc không thể liên lạc được với người nhận.</p>
        <p>- Mọi vấn đề phát sinh trong quá trình mua hàng sẽ được giải quyết dựa trên tinh thần hợp tác và quyền lợi của khách hàng.</p>
      </div>
    </div>
  );
}
