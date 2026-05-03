import { FiAlertCircle, FiCheckCircle, FiFileText } from "react-icons/fi";

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 mt-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black text-[#D4AF37] mb-4">Điều khoản & Lưu ý</h1>
        <p className="text-neutral-300">Những quy định chung khi sử dụng dịch vụ của WOODÉ.</p>
      </div>

      <div className="space-y-8 bg-[#f2ebe0] p-8 rounded-3xl shadow-sm border border-neutral-100">
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#3c2718]">
            <FiFileText className="text-[#8B6F47]" /> Quy định chung
          </h2>
          <div className="space-y-4 text-[#3c2718] text-sm leading-relaxed">
            <p>1. Bằng việc truy cập và đặt hàng tại WOODÉ, bạn đồng ý tuân thủ các điều khoản dịch vụ mà chúng tôi đưa ra.</p>
            <p>2. WOODÉ có quyền thay đổi thực đơn, giá cả và các chương trình khuyến mãi mà không cần thông báo trước, tuy nhiên chúng tôi sẽ luôn cố gắng cập nhật sớm nhất trên Website.</p>
            <p>3. Người dùng có trách nhiệm bảo mật tài khoản cá nhân và số điện thoại dùng để đăng nhập.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#3c2718]">
            <FiAlertCircle className="text-[#8B6F47]" /> Lưu ý về sản phẩm
          </h2>
          <div className="space-y-4 text-[#3c2718] text-sm leading-relaxed">
            <p>- Các hình ảnh sản phẩm trên website chỉ mang tính chất minh họa. Sản phẩm thực tế có thể có sự khác biệt nhỏ về cách trang trí.</p>
            <p>- Đối với các sản phẩm có đá, chất lượng tốt nhất khi được sử dụng ngay sau khi nhận hàng.</p>
            <p>- Quý khách vui lòng thông báo cho chúng tôi nếu có bất kỳ dị ứng nào với các thành phần thực phẩm (sữa, các loại hạt, v.v.).</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#3c2718]">
            <FiCheckCircle className="text-[#8B6F47]" /> Bản quyền & Thương hiệu
          </h2>
          <div className="space-y-4 text-[#3c2718] text-sm leading-relaxed">
            <p>Mọi nội dung, hình ảnh, logo trên website này đều thuộc bản quyền của WOODÉ. Nghiêm cấm mọi hành vi sao chép, sử dụng cho mục đích thương mại khi chưa có sự đồng ý bằng văn bản từ chúng tôi.</p>
          </div>
        </section>
      </div>

      <div className="mt-12 p-6 bg-[#f2ebe0] rounded-2xl flex items-start gap-4">
        <FiAlertCircle className="text-[#8B6F47] shrink-0 mt-1" />
        <p className="text-sm text-[#745542]">Mọi thắc mắc về điều khoản dịch vụ, quý khách vui lòng liên hệ trực tiếp với bộ phận chăm sóc khách hàng qua Hotline 0123 456 789 để được giải đáp.</p>
      </div>
    </div>
  );
}
