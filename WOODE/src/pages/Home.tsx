import { useNavigate } from "react-router-dom";
import FeaturedSlider from "../components/FeaturedSlider";
import FurnitureGrid from "../components/FurnitureGrid";
import { FeaturedProduct3D } from "../components/3d/FeaturedProduct3D";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-[#1A1A1A] text-[#F5F0EB] font-sans">

      {/* Hero Section with 3D Model */}
      <div className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A]"></div>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#D4A574] via-transparent to-transparent"></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12 mt-16">

          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="font-serif text-5xl lg:text-7xl font-black leading-tight tracking-tight text-[#F5F0EB] drop-shadow-lg">
              Nghệ thuật<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A574] to-[#8B6914]">
                Nội thất đương đại
              </span>
            </h1>
            <p className="mt-6 text-lg text-[#A09890] max-w-xl mx-auto lg:mx-0">
              Khám phá bộ sưu tập nội thất cao cấp WOODÉ, nơi thiết kế tinh tế hòa quyện cùng chất liệu thượng hạng, kiến tạo không gian sống đẳng cấp.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => navigate("/products")}
                className="px-8 py-4 bg-gradient-to-r from-[#8B6914] to-[#D4A574] text-[#1A1A1A] font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Khám phá ngay
              </button>
              <button
                className="px-8 py-4 bg-transparent border border-[#8B6914] text-[#D4A574] font-bold rounded-full hover:bg-[#8B6914] hover:text-[#1A1A1A] transition-all duration-300"
              >
                Về chúng tôi
              </button>
            </div>
          </div>

          {/* 3D Model Display */}
          <div className="flex-1 w-full h-[400px] lg:h-[600px] relative">
            {/* The FeaturedProduct3D component handles the 3D rendering */}
            <FeaturedProduct3D modelUrl="/side_table_01_2k.gltf" className="w-full h-full" />

            {/* Floating badges */}
            <div className="absolute top-10 right-10 bg-[#1A1A1A]/80 backdrop-blur-md border border-[#3A3A3A] px-4 py-2 rounded-2xl animate-bounce" style={{ animationDuration: '3s' }}>
              <p className="text-[#D4A574] font-bold text-sm">Thiết kế Bắc Âu</p>
            </div>
            <div className="absolute bottom-20 left-10 bg-[#1A1A1A]/80 backdrop-blur-md border border-[#3A3A3A] px-4 py-2 rounded-2xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
              <p className="text-[#D4A574] font-bold text-sm">Gỗ sồi nguyên khối</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Slider */}
      <div className="relative z-20 bg-[#1A1A1A] -mt-10 rounded-t-[3rem] shadow-2xl pt-10 pb-20">
        <FeaturedSlider />
      </div>

      {/* Grid Products */}
      <div className="bg-[#151515] pb-24">
        <FurnitureGrid />
      </div>

    </div>
  );
}

export default Home;
