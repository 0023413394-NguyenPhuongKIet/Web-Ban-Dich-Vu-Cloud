'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Cloud, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Server, 
  Cpu, 
  Headphones, 
  ArrowUpRight,
  Heart
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      {/* Top Value Proposition Banner */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-slate-50/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/80 border border-blue-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Hạ Tầng 100% NVMe Enterprise</h4>
                <p className="text-xs text-slate-500 mt-0.5">Tốc độ đọc ghi lên đến 7000MB/s</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/80 border border-emerald-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Cam Kết Uptime 99.99%</h4>
                <p className="text-xs text-slate-500 mt-0.5">Bảo vệ Anti-DDoS tự động đa lớp</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/80 border border-indigo-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Hỗ Trợ Kỹ Thuật 24/7/365</h4>
                <p className="text-xs text-slate-500 mt-0.5">Phản hồi sự cố trong vòng 15 phút</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Company Brief */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-md shadow-blue-500/10 overflow-hidden">
                <img src="/images/logo.jpg" alt="CloudVerse Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold text-slate-900">
                CloudVerse
              </span>
            </Link>
            <p className="text-sm text-slate-600 leading-relaxed pr-6">
              Hệ thống cung cấp dịch vụ hạ tầng đám mây tối tân dành cho cá nhân, nhà phát triển phần mềm và doanh nghiệp tại Việt Nam.
            </p>
            <div className="pt-2 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>Hotline: 1900 6868 (Hỗ trợ 24/7)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-500" />
                <span>support@cloudverse.vn</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Dịch Vụ Nổi Bật
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/services" className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1 group">
                  <span>Cloud VPS NVMe</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Web Hosting LiteSpeed
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Dedicated Server
                </Link>
              </li>
              <li>
                <Link href="/promotions" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Voucher Khuyến Mãi
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Khách Hàng
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/my-orders" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Tra Cứu Đơn Hàng
                </Link>
              </li>
              <li>
                <Link href="/affiliate" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Tiếp Thị Liên Kết 20%
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Tin Tức Công Nghệ
                </Link>
              </li>
              <li>
                <Link href="/customers" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Khách Hàng & Đánh Giá
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Về Chúng Tôi (Giới Thiệu)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Liên Hệ & Tư Vấn
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Cổng Đăng Nhập
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Chứng Nhận & An Toàn
            </h4>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>ISO 27001 Certified</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Hệ thống quản lý an toàn thông tin tiêu chuẩn quốc tế.</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Trạng thái máy chủ: 100% Bình thường</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CloudVerse Technology Corporation. Bảo lưu mọi quyền.</p>
          <div className="flex items-center gap-6">
            <Link href="/news" className="hover:text-slate-800">Điều khoản sử dụng</Link>
            <Link href="/news" className="hover:text-slate-800">Chính sách bảo mật</Link>
            <Link href="/news" className="hover:text-slate-800">Quy định dịch vụ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
