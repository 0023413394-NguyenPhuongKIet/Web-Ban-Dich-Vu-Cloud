'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Cloud, 
  Server, 
  Tag, 
  Newspaper, 
  Users, 
  LayoutDashboard, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  Sparkles,
  PhoneCall,
  Package,
  Info
} from 'lucide-react';

const navItems = [
  { label: 'Giới Thiệu', href: '/about', icon: Info },
  { label: 'Gói Dịch Vụ', href: '/services', icon: Server },
  { label: 'Khuyến Mãi', href: '/promotions', icon: Tag },
  { label: 'Khách Hàng', href: '/customers', icon: Users },
  { label: 'Tin Tức', href: '/news', icon: Newspaper },
  { label: 'Liên Hệ', href: '/contact', icon: PhoneCall },
  { label: 'Đối Tác Affiliate', href: '/affiliate', icon: Users },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setUsername(localStorage.getItem('username'));
    setRole(localStorage.getItem('role'));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.href = '/';
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-2.5' 
        : 'bg-white border-b border-slate-100 py-3.5'
    }`}>
      {/* Top micro banner */}
      {/* Top micro banner */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Logo - Đẩy sát mép trái */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform duration-200 overflow-hidden">
              <img src="/images/logo.jpg" alt="CloudVerse Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent whitespace-nowrap">
                  CloudVerse
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                  VN
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium -mt-0.5 whitespace-nowrap hidden sm:block">Hạ Tầng Điện Toán Đám Mây</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/70 flex-shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 lg:px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User & Actions */}
          <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0">
            {username ? (
              <div className="flex items-center gap-2">
                {(role === 'Admin' || role === 'Editor') ? (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-sm whitespace-nowrap"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Trang Quản Trị
                  </Link>
                ) : (
                  <Link
                    href="/my-orders"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors border border-slate-200 whitespace-nowrap"
                  >
                    <Package className="w-3.5 h-3.5 text-blue-600" />
                    Đơn Của Tôi
                  </Link>
                )}

                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 max-w-[90px] truncate">{username}</span>
                  <button
                    onClick={handleLogout}
                    title="Đăng xuất"
                    className="p-1.5 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all whitespace-nowrap"
                >
                  Đăng Nhập
                </Link>
                <Link
                  href="/auth/register"
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all shadow-sm whitespace-nowrap"
                >
                  Đăng Ký
                </Link>
                <Link
                  href="/services"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Thuê Cloud
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 px-4 pt-2 pb-6 bg-white border-b border-slate-200 shadow-xl space-y-3">
          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5 text-blue-500" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {username ? (
              <>
                {(role === 'Admin' || role === 'Editor') ? (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-semibold"
                  >
                    <span className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Quản Trị Hệ Thống</span>
                    <ChevronRight className="w-4 h-4 text-indigo-400" />
                  </Link>
                ) : (
                  <Link
                    href="/my-orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 text-slate-800 text-sm font-semibold"
                  >
                    <span className="flex items-center gap-2"><Package className="w-4 h-4 text-blue-600" /> Đơn Hàng Của Tôi</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-sm font-semibold text-left"
                >
                  <LogOut className="w-4 h-4" /> Đăng Xuất ({username})
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl bg-slate-100 text-slate-800 font-semibold text-sm"
                >
                  Đăng Nhập
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-md shadow-blue-500/20"
                >
                  Đăng Ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
