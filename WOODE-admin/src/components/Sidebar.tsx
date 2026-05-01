import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Tag, ShoppingCart, Users, Package, TrendingUp, LogOut } from 'lucide-react'
import { useAuthStore } from '@/pages/auth/stores/authStore'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  status?: 'active' | 'soon'
  roles?: string[]
}

const adminNavItems: NavItem[] = [
  {
    label: 'Bảng điều khiển',
    path: '/admin',
    icon: <LayoutDashboard size={20} />,
    status: 'active',
    roles: ['ADMIN'],
  },
  {
    label: 'Danh mục',
    path: '/admin/categories',
    icon: <Tag size={20} />,
    status: 'active',
    roles: ['ADMIN'],
  },
  {
    label: 'Sản phẩm',
    path: '/admin/products',
    icon: <Package size={20} />,
    status: 'active',
    roles: ['ADMIN'],
  },
  {
    label: 'Đơn hàng',
    path: '/admin/orders',
    icon: <ShoppingCart size={20} />,
    status: 'active',
    roles: ['ADMIN'],
  },
  {
    label: 'Doanh thu',
    path: '/admin/revenues',
    icon: <TrendingUp size={20} />,
    status: 'active',
    roles: ['ADMIN'],
  },
  {
    label: 'Người dùng',
    path: '/admin/users',
    icon: <Users size={20} />,
    status: 'active',
    roles: ['ADMIN'],
  },
]

const staffNavItems: NavItem[] = [
  {
    label: 'Bảng điều khiển',
    path: '/StaffDashboard',
    icon: <LayoutDashboard size={20} />,
    status: 'active',
    roles: ['STAFF'],
  },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const navItems = user?.role === 'STAFF' ? staffNavItems : adminNavItems

  return (
    <aside className="w-64 border-r border-gray-200 bg-gradient-to-b from-white to-gray-50 h-screen sticky top-0 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
            <span className="text-white font-bold text-lg">W</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">WOODÉ</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const isDisabled = item.status === 'soon'

          return isDisabled ? (
            <div
              key={item.path}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 cursor-not-allowed opacity-50 transition-all"
            >
              {item.icon}
              <span className="flex-1 text-sm">{item.label}</span>
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">Sắp Tới</span>
            </div>
          ) : (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-md'
                  : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              {item.icon}
              <span className="flex-1 text-sm">{item.label}</span>
              {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
            </Link>
          )
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-gray-200 bg-white p-4 space-y-3">
        {user && (
          <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name || user.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              <p className="text-xs text-gray-600 capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 font-medium text-sm border border-transparent hover:border-red-200"
        >
          <LogOut size={18} />
          <span>Đăng Xuất</span>
        </button>
      </div>
    </aside>
  )
}