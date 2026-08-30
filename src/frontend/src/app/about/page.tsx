'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Server, 
  Cpu, 
  HardDrive, 
  Globe, 
  Award, 
  CheckCircle2, 
  Clock, 
  Users, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Building2, 
  Lock, 
  Layers,
  MapPin,
  Headphones,
  Check,
  ExternalLink,
  QrCode
} from 'lucide-react';
import { formatCurrency, generateLinkQrUrl } from '@/lib/formatters';

interface AboutPlanItem {
  id: number;
  name: string;
  code: string;
  monthlyPrice: number;
  cpu: string;
  ram: string;
  storage: string;
  redirectLink?: string;
}

const defaultAboutPlans: AboutPlanItem[] = [
  {
    id: 1,
    name: 'Cloud VPS Starter',
    code: 'VPS-STARTER',
    monthlyPrice: 99000,
    cpu: '1 Core Intel Xeon',
    ram: '1 GB DDR4 ECC',
    storage: '25 GB NVMe Enterprise',
    redirectLink: '/order/1',
  },
  {
    id: 2,
    name: 'Cloud VPS Pro',
    code: 'VPS-PRO',
    monthlyPrice: 249000,
    cpu: '2 Core Intel Xeon',
    ram: '4 GB DDR4 ECC',
    storage: '60 GB NVMe Enterprise',
    redirectLink: '/order/2',
  },
  {
    id: 3,
    name: 'Cloud VPS Business',
    code: 'VPS-BUSINESS',
    monthlyPrice: 499000,
    cpu: '4 Core Intel Xeon',
    ram: '8 GB DDR4 ECC',
    storage: '120 GB NVMe Enterprise',
    redirectLink: '/order/3',
  },
];

export default function AboutPage() {
  const [plans, setPlans] = useState<AboutPlanItem[]>(defaultAboutPlans);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
      try {
        const saved = localStorage.getItem('admin_managed_service_plans');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPlans(parsed.slice(0, 3));
          }
        }
      } catch {}
    }
  }, []);
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-900 border-b border-slate-800 text-white">
        {/* Background Image Container */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transform scale-105"
          style={{ 
            backgroundImage: "url('/images/about-banner.webp')",
            backgroundPosition: 'center 40%'
          }}
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-blue-950/80 backdrop-blur-[0.5px]" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Tiên Phong Công Nghệ Điện Toán Đám Mây Thế Hệ Mới</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Về Chúng Tôi – <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">CloudVerse</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            CloudVerse là nền tảng cung cấp giải pháp hạ tầng máy chủ ảo Cloud VPS NVMe, Web Hosting LiteSpeed và Tên miền doanh nghiệp hàng đầu tại Việt Nam, mang đến giải pháp vận hành ổn định, bảo mật cao và chi phí tối ưu nhất.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono">99.99%</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Cam kết Uptime SLA</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">7000 MB/s</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">NVMe U.2 Enterprise</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">100 Gbps</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Băng thông mạng quốc tế</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">24/7/365</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Hỗ trợ kỹ thuật 15 phút</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LỊCH SỬ PHÁT TRIỂN & TẦM NHÌN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
              <Building2 className="w-3.5 h-3.5" />
              <span>Câu Chuyện & Sứ Mệnh</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-snug">
              Kiến Tạo Hạ Tầng Số Vững Chắc Cho Doanh Nghiệp Việt
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              Thành lập với khát vọng đơn giản hóa việc triển khai hệ thống máy chủ và dịch vụ đám mây, <strong>CloudVerse</strong> không ngừng đầu tư nâng cấp phần cứng chuẩn Enterprise và hạ tầng mạng tốc độ cao.
            </p>

            <p className="text-sm text-slate-600 leading-relaxed">
              Chúng tôi tin rằng mọi lập trình viên, startup và doanh nghiệp đều xứng đáng được tiếp cận dịch vụ điện toán đám mây đẳng cấp quốc tế với chi phí minh bạch, khả năng thanh toán trả góp linh hoạt và quy trình tự động hóa 100%.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-slate-800 font-semibold">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Tự động hóa hoàn toàn quy trình khởi tạo máy chủ chỉ trong 60 giây.</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-800 font-semibold">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Chính sách chiết khấu bậc thang theo năm lên tới 35% và trả góp định kỳ 3 tháng.</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-800 font-semibold">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Tích hợp thanh toán QR VietQR tự động khớp đơn tức thì.</span>
              </div>
            </div>
          </div>

          {/* Timeline / Milestones */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Các Cột Mốc Phát Triển</span>
            </h3>

            <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
              
              <div className="relative flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold z-10 flex-shrink-0 shadow-md shadow-blue-500/30">
                  1
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">2024 - Khởi Đầu</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">Xây Dựng Cụm Máy Chủ Đầu Tiên</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Triển khai cụm máy chủ ảo VPS tại Data Center VNPT Tân Thuận với 100% ổ cứng SSD Enterprise.</p>
                </div>
              </div>

              <div className="relative flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold z-10 flex-shrink-0 shadow-md shadow-indigo-500/30">
                  2
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">2025 - Đột Phá</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">Nâng Cấp Chuẩn NVMe U.2 & LiteSpeed</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Mở rộng thêm cụm máy chủ Viettel IDC Hòa Lạc và tích hợp Web Server LiteSpeed Cache bản quyền.</p>
                </div>
              </div>

              <div className="relative flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold z-10 flex-shrink-0 shadow-md shadow-emerald-500/30">
                  3
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">2026 - Toàn Diện</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">Hệ Sinh Thái Điện Toán Đám Mây Đa Năng</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Ra mắt nền tảng CloudVerse v2.0 hỗ trợ Affiliate 20%, chống DDoS đa lớp và hệ thống quản lý chuẩn ISO.</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. HẠ TẦNG DATA CENTER & TIÊU CHUẨN TIER III */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              Hạ Tầng Vật Lý
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold">
              Trung Tâm Dữ Liệu Tiêu Chuẩn Quốc Tế Tier III
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Hệ thống máy chủ của CloudVerse được đặt tại các Data Center hiện đại nhất Việt Nam với đầy đủ cơ chế dự phòng N+1.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-4 hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Server className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Viettel IDC (Hòa Lạc & Tân Bình)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Đạt chuẩn quốc tế ANSI/TIA-942 Rated 3, trang bị hệ thống máy nổ dự phòng, UPS Emerson và làm mát lạnh chính xác Stulz.
              </p>
              <div className="text-xs text-blue-400 font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Hà Nội & TP. Hồ Chí Minh
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-4 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">VNPT IDC (Nam Thăng Long & Tân Thuận)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kết nối trực tiếp vào trục mạng backbone quốc gia với băng thông truyền tải lên đến 100Gbps, độ trễ liên tỉnh dưới 15ms.
              </p>
              <div className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Hà Nội & TP. Hồ Chí Minh
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-4 hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Bảo Vệ Anti-DDoS Đa Lớp</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tích hợp tường lửa WAF Layer 7 và hệ thống lọc lưu lượng tự động, ngăn chặn tức thì các đợt tấn công SYN Flood, HTTP Flood.
              </p>
              <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Bảo vệ 24/7/365
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. CHỨNG CHỈ QUỐC TẾ & CAM KẾT SLA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            Tiêu Chuẩn & Cam Kết
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
            Chứng Chỉ An Toàn & Cam Kết SLA 99.9%
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            CloudVerse tuân thủ nghiêm ngặt các quy chuẩn an toàn thông tin và bảo mật dữ liệu khách hàng.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">ISO 27001:2022</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hệ thống quản lý an toàn thông tin tiêu chuẩn quốc tế, bảo vệ toàn diện dữ liệu khách hàng.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">ISO 9001:2015</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hệ thống quản lý chất lượng dịch vụ vận hành và hỗ trợ khách hàng chuyên nghiệp.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Cam Kết SLA 99.9%</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Đảm bảo thời gian máy chủ hoạt động liên tục (Uptime). Đền bù theo thỏa thuận nếu gián đoạn dịch vụ.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Hỗ Trợ 15 Phút</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Đội ngũ kỹ thuật viên trực ca 24/7/365, tiếp nhận và xử lý sự cố kỹ thuật trong vòng 15 phút.
            </p>
          </div>

        </div>
      </section>

      {/* 4.5. QUÉT MÃ QR TRUY CẬP NHANH & ĐẶT GÓI DỊCH VỤ TRỰC TIẾP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white border border-blue-800/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Trải Nghiệm Tiện Lợi Bằng Điện Thoại</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Quét Mã QR Đặt Gói Máy Chủ Trực Tuyến
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
                Sử dụng camera điện thoại hoặc ứng dụng Zalo/Ngân hàng để quét mã QR bên dưới, hệ thống sẽ chuyển hướng trực tiếp bạn tới trang cấu hình gói máy chủ và điền thông tin thanh toán nhanh chóng.
              </p>
            </div>

            {/* Danh sách các mã QR của từng gói dịch vụ - Tự động cập nhật theo cấu hình Admin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {plans.map((p, idx) => {
                const targetLink = p.redirectLink || `/order/${p.id}`;
                const fullTargetUrl = targetLink.startsWith('http')
                  ? targetLink
                  : (origin ? `${origin}${targetLink}` : `http://localhost:3000${targetLink}`);
                const isPro = idx === 1 || p.code?.includes('PRO');

                return (
                  <div
                    key={p.id || idx}
                    className={`rounded-2xl p-6 backdrop-blur-md transition-all flex flex-col items-center text-center space-y-4 group relative ${
                      isPro
                        ? 'bg-gradient-to-b from-blue-900/70 to-slate-800/90 border-2 border-blue-400 shadow-xl shadow-blue-500/10'
                        : 'bg-slate-800/80 border border-slate-700/80 hover:border-blue-400/60'
                    }`}
                  >
                    {isPro && (
                      <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider shadow">
                        Gói Nổi Bật
                      </div>
                    )}

                    <div className="flex items-center justify-between w-full border-b border-slate-700 pb-3">
                      <span className={`text-xs font-bold ${isPro ? 'text-sky-300' : 'text-blue-400'}`}>
                        {p.name}
                      </span>
                      <span className="text-xs font-mono font-bold text-white bg-blue-600/30 px-2 py-0.5 rounded border border-blue-500/40">
                        {formatCurrency(p.monthlyPrice)}/th
                      </span>
                    </div>

                    <div className="p-3.5 bg-white rounded-2xl shadow-lg group-hover:scale-105 transition-transform flex flex-col items-center">
                      <img
                        src={generateLinkQrUrl(fullTargetUrl)}
                        alt={`QR ${p.name}`}
                        className="w-40 h-40 object-contain"
                      />
                    </div>

                    <div className="space-y-1.5 w-full">
                      <p className="text-xs text-slate-200 font-semibold">
                        {p.cpu} | {p.ram} | {p.storage}
                      </p>
                      <p className="text-[11px] text-slate-400">Quét để chuyển đến trang đặt hàng</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-400">
                💡 Bạn cũng có thể xem toàn bộ bảng giá và thanh toán trực tiếp qua chuyển khoản ngân hàng tự động tại trang{' '}
                <Link href="/services" className="text-blue-400 font-bold hover:underline">
                  Dịch Vụ & Bảng Giá
                </Link>
                .
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-center space-y-6 shadow-xl shadow-blue-500/20">
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            Sẵn Sàng Trải Nghiệm Máy Chủ Tốc Độ Cao Cùng CloudVerse?
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Đăng ký ngay hôm nay để nhận ưu đãi giảm đến <strong>35%</strong> theo năm cùng chính sách thanh toán định kỳ 3 tháng linh hoạt.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/services"
              className="px-6 py-3 rounded-2xl bg-white text-blue-700 font-extrabold text-xs hover:bg-blue-50 shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Xem Bảng Giá Gói Dịch Vụ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-2xl bg-blue-800/60 hover:bg-blue-800 text-white font-extrabold text-xs border border-blue-400/40 transition-all flex items-center justify-center gap-2"
            >
              <span>Liên Hệ Tư Vấn Trực Tiếp</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
