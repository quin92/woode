import "dotenv/config"
import { PrismaClient, UserRole, OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Start seeding WOODÉ furniture data...")

  // Xóa dữ liệu cũ
  await prisma.payment.deleteMany()
  await prisma.orderLog.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  const hashedPassword = await bcrypt.hash('123456', 10)

  // =========================
  // USERS
  // =========================
  const admin = await prisma.user.create({
    data: {
      email: "admin@woode.com",
      password: hashedPassword,
      name: "Admin WOODÉ",
      phone: "0900000001",
      phoneVerified: true,
      address: "Quận 1, TP.HCM",
      role: UserRole.ADMIN,
    },
  })

  const staff = await prisma.user.create({
    data: {
      email: "staff@woode.com",
      password: hashedPassword,
      name: "Staff WOODÉ",
      phone: "0900000002",
      phoneVerified: true,
      address: "Thủ Đức, TP.HCM",
      role: UserRole.STAFF,
    },
  })

  const customer = await prisma.user.create({
    data: {
      email: "customer@woode.com",
      password: hashedPassword,
      name: "Nguyễn Văn Phong",
      phone: "0900000003",
      phoneVerified: true,
      address: "Bình Thạnh, TP.HCM",
      role: UserRole.CUSTOMER,
      loyaltyPoint: 500,
      totalOrders: 8,
      totalSpent: 45000000,
    },
  })

  // =========================
  // CATEGORIES
  // =========================
  const chairCategory = await prisma.category.create({
    data: {
      name: 'Ghế',
      slug: 'ghe',
      order: 1,
    },
  })

  const tableCategory = await prisma.category.create({
    data: {
      name: 'Bàn',
      slug: 'ban',
      order: 2,
    },
  })

  const sofaCategory = await prisma.category.create({
    data: {
      name: 'Sofa',
      slug: 'sofa',
      order: 3,
    },
  })

  const shelfCategory = await prisma.category.create({
    data: {
      name: 'Tủ & Kệ',
      slug: 'tu-ke',
      order: 4,
    },
  })

  const lightingCategory = await prisma.category.create({
    data: {
      name: 'Đèn',
      slug: 'den',
      order: 5,
    },
  })

  // =========================
  // PRODUCTS
  // =========================

  // --- Ghế ---
  const chairModern = await prisma.product.create({
    data: {
      name: 'Ghế ăn gỗ sồi Nordic',
      price: 2500000,
      description: 'Ghế ăn phong cách Bắc Âu, chất liệu gỗ sồi tự nhiên, đệm vải bố cao cấp. Thiết kế tối giản, chắc chắn và bền bỉ.',
      categoryId: chairCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=800',
      modelUrl: '/side_table_01_2k.gltf',
      dimensions: '45 x 52 x 82 cm',
      weight: 5.2,
    },
  })

  const chairOffice = await prisma.product.create({
    data: {
      name: 'Ghế văn phòng Ergonomic Pro',
      price: 4800000,
      description: 'Ghế công thái học cao cấp với tựa lưng lưới mesh, hỗ trợ thắt lưng, tay vịn điều chỉnh 4D. Phù hợp cho làm việc dài giờ.',
      categoryId: chairCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800',
      modelUrl: '/side_table_01_2k.gltf',
      dimensions: '66 x 66 x 110-120 cm',
      weight: 14.5,
    },
  })

  const chairLounge = await prisma.product.create({
    data: {
      name: 'Ghế thư giãn Accent Velvet',
      price: 6200000,
      description: 'Ghế bành bọc nhung cao cấp, chân gỗ óc chó. Thiết kế cong ôm trọn cơ thể, mang lại cảm giác thư giãn tuyệt đối.',
      categoryId: chairCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800',
      modelUrl: '/side_table_01_2k.gltf',
      dimensions: '72 x 78 x 85 cm',
      weight: 12.0,
    },
  })

  // --- Bàn ---
  const tableWork = await prisma.product.create({
    data: {
      name: 'Bàn làm việc Minimalist',
      price: 4200000,
      description: 'Bàn làm việc thiết kế tối giản, mặt bàn gỗ MDF phủ melamine chống trầy. Khung chân sắt sơn tĩnh điện vững chắc.',
      categoryId: tableCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800',
      modelUrl: '/side_table_01_2k.gltf',
      dimensions: '120 x 60 x 75 cm',
      weight: 22.0,
    },
  })

  const tableDining = await prisma.product.create({
    data: {
      name: 'Bàn ăn gỗ óc chó Walnut',
      price: 8900000,
      description: 'Bàn ăn 6 người, mặt bàn nguyên tấm gỗ óc chó nhập khẩu. Hoàn thiện tự nhiên, vân gỗ đẹp độc đáo.',
      categoryId: tableCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800',
      modelUrl: '/side_table_01_2k.gltf',
      dimensions: '180 x 90 x 75 cm',
      weight: 45.0,
    },
  })

  const tableCoffee = await prisma.product.create({
    data: {
      name: 'Bàn trà tròn Marble',
      price: 3500000,
      description: 'Bàn trà mặt đá marble tự nhiên, chân sắt mạ vàng sang trọng. Điểm nhấn hoàn hảo cho phòng khách.',
      categoryId: tableCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=800',
      modelUrl: '/side_table_01_2k.gltf',
      dimensions: '80 x 80 x 45 cm',
      weight: 18.0,
    },
  })

  // --- Sofa ---
  const sofaL = await prisma.product.create({
    data: {
      name: 'Sofa góc chữ L Premium',
      price: 12800000,
      description: 'Sofa góc chữ L bọc da PU cao cấp, đệm foam đa lớp. Có thể tháo rời vệ sinh. Chỗ ngồi rộng rãi cho 4-5 người.',
      categoryId: sofaCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      modelUrl: '/side_table_01_2k.gltf',
      dimensions: '270 x 170 x 85 cm',
      weight: 65.0,
    },
  })

  const sofa2Seat = await prisma.product.create({
    data: {
      name: 'Sofa 2 chỗ Scandinavian',
      price: 7500000,
      description: 'Sofa 2 chỗ ngồi phong cách Scandinavian, bọc vải bố chống bám bẩn. Chân gỗ tự nhiên, đệm lò xo túi êm ái.',
      categoryId: sofaCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800',
      modelUrl: '/side_table_01_2k.gltf',
      dimensions: '160 x 85 x 80 cm',
      weight: 35.0,
    },
  })

  // --- Tủ & Kệ ---
  const shelfWall = await prisma.product.create({
    data: {
      name: 'Kệ sách treo tường Floating',
      price: 1800000,
      description: 'Kệ treo tường thiết kế floating ấn tượng, gỗ MDF phủ veneer. Chịu tải lên đến 15kg mỗi tầng.',
      categoryId: shelfCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800',
      modelUrl: '/side_table_01_2k.gltf',
      dimensions: '80 x 20 x 100 cm',
      weight: 8.5,
    },
  })

  const shelfBookcase = await prisma.product.create({
    data: {
      name: 'Tủ sách gỗ thông 5 tầng',
      price: 3200000,
      description: 'Tủ sách 5 tầng chất liệu gỗ thông tự nhiên, sơn PU chống ẩm. Nhiều ngăn tiện dụng, phù hợp phòng làm việc và phòng khách.',
      categoryId: shelfCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=800',
      modelUrl: '/side_table_01_2k.gltf',
      dimensions: '80 x 30 x 180 cm',
      weight: 25.0,
    },
  })

  // --- Đèn ---
  const lampFloor = await prisma.product.create({
    data: {
      name: 'Đèn sàn Scandinavian Arc',
      price: 3500000,
      description: 'Đèn sàn cung vòm phong cách Scandinavian, chao đèn vải linen. Ánh sáng ấm áp, tạo không gian thư giãn.',
      categoryId: lightingCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=800',
      modelUrl: '/side_table_01_2k.gltf',
      dimensions: '40 x 40 x 180 cm',
      weight: 6.0,
    },
  })

  const lampPendant = await prisma.product.create({
    data: {
      name: 'Đèn trần Pendant Rattan',
      price: 2200000,
      description: 'Đèn trần mây tre đan thủ công, phong cách bohemian. Tạo hiệu ứng bóng đổ nghệ thuật trên tường.',
      categoryId: lightingCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800',
      modelUrl: '/side_table_01_2k.gltf',
      dimensions: '45 x 45 x 30 cm',
      weight: 2.5,
    },
  })

  // =========================
  // ORDER 1 - PENDING
  // =========================
  const order1 = await prisma.order.create({
    data: {
      userId: customer.id,
      phone: customer.phone,
      address: customer.address || 'Bình Thạnh, TP.HCM',
      total: 6700000,
      status: OrderStatus.PENDING,
      earnedPoint: 67,
      usedPoint: 0,
    },
  })

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: chairModern.id,
      quantity: 2,
      productName: chairModern.name,
      basePrice: chairModern.price,
    },
  })

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: shelfWall.id,
      quantity: 1,
      productName: shelfWall.name,
      basePrice: shelfWall.price,
    },
  })

  await prisma.orderLog.create({
    data: {
      orderId: order1.id,
      status: OrderStatus.PENDING,
      note: 'Order created',
      updatedById: customer.id,
    },
  })

  await prisma.payment.create({
    data: {
      orderId: order1.id,
      method: PaymentMethod.CASH,
      status: PaymentStatus.PENDING,
      amount: 6700000,
    },
  })

  // =========================
  // ORDER 2 - CONFIRMED
  // =========================
  const order2 = await prisma.order.create({
    data: {
      userId: customer.id,
      phone: customer.phone,
      address: 'Quận 3, TP.HCM',
      total: 12800000,
      status: OrderStatus.CONFIRMED,
      earnedPoint: 128,
      usedPoint: 100,
    },
  })

  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      productId: sofaL.id,
      quantity: 1,
      productName: sofaL.name,
      basePrice: sofaL.price,
    },
  })

  await prisma.orderLog.createMany({
    data: [
      {
        orderId: order2.id,
        status: OrderStatus.PENDING,
        note: 'Order created',
        updatedById: customer.id,
      },
      {
        orderId: order2.id,
        status: OrderStatus.CONFIRMED,
        note: 'Order confirmed by staff',
      },
    ],
  })

  await prisma.payment.create({
    data: {
      orderId: order2.id,
      method: PaymentMethod.VNPAY,
      status: PaymentStatus.SUCCESS,
      amount: 12800000,
      transactionId: 'VNPAY_TXN_001',
      paidAt: new Date(),
    },
  })

  // =========================
  // ORDER 3 - COMPLETED
  // =========================
  const order3 = await prisma.order.create({
    data: {
      userId: customer.id,
      phone: customer.phone,
      address: 'Quận 7, TP.HCM',
      total: 13100000,
      status: OrderStatus.COMPLETED,
      earnedPoint: 131,
      usedPoint: 0,
    },
  })

  await prisma.orderItem.create({
    data: {
      orderId: order3.id,
      productId: tableDining.id,
      quantity: 1,
      productName: tableDining.name,
      basePrice: tableDining.price,
    },
  })

  await prisma.orderItem.create({
    data: {
      orderId: order3.id,
      productId: tableWork.id,
      quantity: 1,
      productName: tableWork.name,
      basePrice: tableWork.price,
    },
  })

  await prisma.orderLog.createMany({
    data: [
      {
        orderId: order3.id,
        status: OrderStatus.PENDING,
        note: 'Order created',
        updatedById: customer.id,
      },
      {
        orderId: order3.id,
        status: OrderStatus.CONFIRMED,
        note: 'Order confirmed by staff',
      },
      {
        orderId: order3.id,
        status: OrderStatus.SHIPPING,
        note: 'Order shipped',
      },
      {
        orderId: order3.id,
        status: OrderStatus.COMPLETED,
        note: 'Order completed',
      },
    ],
  })

  await prisma.payment.create({
    data: {
      orderId: order3.id,
      method: PaymentMethod.BANK_TRANSFER,
      status: PaymentStatus.SUCCESS,
      amount: 13100000,
      transactionId: 'BANK_TXN_001',
      paidAt: new Date(),
    },
  })

  // =========================
  // ORDER 4 - CANCELLED
  // =========================
  const order4 = await prisma.order.create({
    data: {
      userId: customer.id,
      phone: customer.phone,
      address: 'Tân Bình, TP.HCM',
      total: 4800000,
      status: OrderStatus.CANCELLED,
      earnedPoint: 0,
      usedPoint: 0,
    },
  })

  await prisma.orderItem.create({
    data: {
      orderId: order4.id,
      productId: chairOffice.id,
      quantity: 1,
      productName: chairOffice.name,
      basePrice: chairOffice.price,
    },
  })

  await prisma.orderLog.createMany({
    data: [
      {
        orderId: order4.id,
        status: OrderStatus.PENDING,
        note: 'Order created',
        updatedById: customer.id,
      },
      {
        orderId: order4.id,
        status: OrderStatus.CANCELLED,
        note: 'Customer cancelled order',
        updatedById: customer.id,
      },
    ],
  })

  await prisma.payment.create({
    data: {
      orderId: order4.id,
      method: PaymentMethod.CASH,
      status: PaymentStatus.FAILED,
      amount: 4800000,
    },
  })

  console.log('✅ Seed completed!')
  console.log('---------------------------')
  console.log('Admin login:')
  console.log('email: admin@woode.com')
  console.log('password: 123456')
  console.log('---------------------------')
  console.log('Staff login:')
  console.log('email: staff@woode.com')
  console.log('password: 123456')
  console.log('---------------------------')
  console.log('Customer login:')
  console.log('email: customer@woode.com')
  console.log('password: 123456')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
