import { FiLock, FiEye, FiShield, FiUserCheck } from "react-icons/fi";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 mt-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black text-[#D4AF37] mb-4">Chính sách bảo mật</h1>
        <p className="text-neutral-300">Sự riêng tư của bạn là ưu tiên hàng đầu của chúng tôi tại WOODÉ.</p>
      </div>

      <div className="space-y-12">
        <section>
          <div className="flex items-center gap-3 mb-4">
            <FiUserCheck className="text-[#8B6F47] text-2xl" />
            <h2 className="text-2xl font-bold">1. Thu thập thông tin</h2>
          </div>
          <p className="text-neutral-300 leading-relaxed pl-9">
            Chúng tôi thu thập các thông tin cơ bản bao gồm: Tên, Số điện thoại, Email và Địa chỉ giao hàng khi bạn đăng ký tài khoản hoặc đặt hàng. Mục đích là để xử lý đơn hàng và cung cấp các dịch vụ chăm sóc khách hàng tốt nhất.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <FiEye className="text-[#D4AF37] text-2xl" />
            <h2 className="text-2xl font-bold">2. Sử dụng thông tin</h2>
          </div>
          <p className="text-neutral-300 leading-relaxed pl-9">
            Thông tin của bạn sẽ được sử dụng để xác nhận đơn hàng, liên lạc giao hàng, tích lũy điểm thưởng và gửi thông báo về các ưu đãi mới nhất từ WOODÉ (nếu bạn đồng ý nhận thông báo).
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <FiShield className="text-[#8B6F47] text-2xl" />
            <h2 className="text-2xl font-bold">3. Cam kết bảo mật</h2>
          </div>
          <p className="text-neutral-300 leading-relaxed pl-9">
            WOODÉ cam kết tuyệt đối không bán, chia sẻ hay trao đổi thông tin khách hàng cho bất kỳ bên thứ ba nào vì mục đích thương mại. Mọi giao dịch thanh toán trực tuyến đều được bảo mật qua cổng thanh toán tiêu chuẩn quốc tế.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <FiLock className="text-[#D4AF37] text-2xl" />
            <h2 className="text-2xl font-bold">4. Quyền của khách hàng</h2>
          </div>
          <p className="text-neutral-300 leading-relaxed pl-9">
            Bạn có quyền yêu cầu truy cập, chỉnh sửa hoặc xóa thông tin cá nhân của mình bất kỳ lúc nào thông qua trang Hồ sơ cá nhân hoặc liên hệ trực tiếp với đội ngũ hỗ trợ của chúng tôi.
          </p>
        </section>
      </div>

      <div className="mt-16 p-8 border-t border-neutral-100 text-center text-xs text-neutral-200">
        Cập nhật lần cuối: Tháng 4, 2026
      </div>
    </div>
  );
}
