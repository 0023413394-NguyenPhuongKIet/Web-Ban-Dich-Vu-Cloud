'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  ShieldAlert,
  FileText,
  Cloud,
  LogOut,
  ChevronRight,
  ExternalLink,
  Settings,
  Eye,
  Server,
  Star
} from 'lucide-react';

// Danh sách menu hiển thị cho cả Admin & Editor
const navItemsAll = [
  { label: 'Bảng Điều Khiển', href: '/admin/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Editor'] },
  { label: 'Quản Lý Người Dùng', href: '/admin/users', icon: Users, roles: ['Admin'] },
  { label: 'Quản Lý Đơn Hàng', href: '/admin/orders', icon: ShoppingBag, roles: ['Admin', 'Editor'] },
  { label: 'Gói Dịch Vụ & Bảng Giá', href: '/admin/services', icon: Server, roles: ['Admin', 'Editor'] },
  { label: 'Quản Lý Đánh Giá', href: '/admin/reviews', icon: Star, roles: ['Admin', 'Editor'] },
  { label: 'Quản Lý Mã Khuyến Mãi', href: '/admin/promotions', icon: Cloud, roles: ['Admin', 'Editor'] },
  { label: 'Quản Lý Tin Tức / Blog', href: '/admin/news', icon: FileText, roles: ['Admin', 'Editor'] },
  { label: 'Xem Hồ Sơ Affiliate', href: '/admin/affiliates', icon: Eye, roles: ['Editor'] },
  { label: 'Duyệt Đối Tác Affiliate', href: '/admin/affiliates', icon: Users, roles: ['Admin'] },
  { label: 'Nhật Ký Audit Logs', href: '/admin/audit-logs', icon: ShieldAlert, roles: ['Admin', 'Editor'] },
  { label: 'Xuất Báo Cáo CSV', href: '/admin/reports', icon: FileText, roles: ['Admin', 'Editor'] },
  { label: 'Đổi Mật Khẩu', href: '/admin/change-password', icon: Settings, roles: ['Admin', 'Editor'] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const checked = useRef(false);
  const [role, setRole] = useState<string>('');
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    const r = localStorage.getItem('role') || '';
    const u = localStorage.getItem('username') || localStorage.getItem('email') || '';
    setRole(r);
    setUsername(u);
    if (r !== 'Admin' && r !== 'Editor') {
      router.replace('/auth/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/auth/login');
  };

  // Lọc menu theo role
  const navItems = navItemsAll.filter((item) => item.roles.includes(role));

  const isAdmin = role === 'Admin';
  const isEditor = role === 'Editor';

  return (
    <div className="flex min-h-[calc(100vh-70px)] bg-slate-50">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          
          {/* Role Badge */}
          <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
            isAdmin
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
              : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100'
          }`}>
            <div className={`w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold text-xs shadow-sm ${
              isAdmin ? 'bg-blue-600' : 'bg-amber-500'
            }`}>
              {isAdmin ? 'AD' : 'ED'}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                {isAdmin ? 'Quản Trị Viên' : 'Biên Tập Viên'}
              </p>
              <p className={`text-[10px] font-semibold flex items-center gap-1 ${
                isAdmin ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {role || 'Đang tải...'}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-2">
              Phân Hệ Quản Trị
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <Link
            href="/"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
              Xem Trang Chủ Khách
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            Đăng Xuất Khỏi Admin
          </button>
        </div>
      </aside>

      {/* Main Admin View Content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>

    </div>
  );
}
