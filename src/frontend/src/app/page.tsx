'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Server, 
  Globe, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Tag, 
  Award, 
  BarChart, 
  Sparkles,
  Database,
  Lock,
  Headphones,
  Check,
  Newspaper,
  Calendar,
  Eye,
  TrendingUp,
  Clock,
  Gift,
  Copy
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { Promotion } from '@/types';

const featuredPlans = [
  {
    name: 'Cloud VPS Start',
    badge: 'Tiết kiệm nhất',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    price: '99.000',
    cycle: '/tháng',
    description: 'Lý tưởng cho trang web cá nhân, blog WordPress hoặc thử nghiệm ứng dụng.',
    specs: [
      { label: 'CPU', value: '1 vCPU Intel Xeon Gold' },
      { label: 'Bộ nhớ RAM', value: '1 GB DDR4 ECC' },
      { label: 'Ổ cứng SSD', value: '25 GB NVMe Siêu Tốc' },
      { label: 'Băng thông', value: '1 Gbps Không Giới Hạn' },
      { label: 'Địa chỉ IPv4', value: '1 IPv4 Riêng Biệt' },
    ],
    buttonText: 'Thuê Ngay',
    buttonClass: 'btn-pill-secondary',
    href: '/order/1',
    popular: false,
  },
  {
    name: 'Cloud VPS Pro',
    badge: 'Khuyên Dùng ★',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    price: '249.000',
    cycle: '/tháng',
    description: 'Dành cho doanh nghiệp vừa và nhỏ, cửa hàng online và ứng dụng web chuyên nghiệp.',
    specs: [
      { label: 'CPU', value: '2 vCPU Intel Xeon Gold' },
      { label: 'Bộ nhớ RAM', value: '4 GB DDR4 ECC' },
      { label: 'Ổ cứng SSD', value: '60 GB NVMe Siêu Tốc' },
      { label: 'Băng thông', value: '1 Gbps Không Giới Hạn' },
      { label: 'Địa chỉ IPv4', value: '1 IPv4 Riêng Biệt' },
    ],
    buttonText: 'Đăng Ký Gói Pro',
    buttonClass: 'btn-pill-primary',
    href: '/order/2',
    popular: true,
  },
  {
    name: 'Cloud VPS Business',
    badge: 'Hiệu Năng Cao',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    price: '499.000',
    cycle: '/tháng',
    description: 'Tối ưu cho cơ sở dữ liệu lớn, hệ thống thương mại điện tử có lượng truy cập cao.',
    specs: [
      { label: 'CPU', value: '4 vCPU Intel Xeon Platinum' },
      { label: 'Bộ nhớ RAM', value: '8 GB DDR4 ECC' },
      { label: 'Ổ cứng SSD', value: '120 GB NVMe Siêu Tốc' },
      { label: 'Băng thông', value: '1 Gbps Không Giới Hạn' },
      { label: 'Backup', value: 'Tự Động Hàng Tuần' },
    ],
    buttonText: 'Thuê Doanh Nghiệp',
    buttonClass: 'btn-pill-secondary',
    href: '/order/3',
    popular: false,
  },
];

const highlights = [
  {
    icon: Zap,
    title: 'Khởi Tạo Trong 30 Giây',
    desc: 'Hệ thống tự động kích hoạt máy chủ và gửi thông tin quản trị qua email ngay sau khi thanh toán.',
    color: 'text-amber-500 bg-amber-50 border-amber-100',
  },
  {
    icon: Database,
    title: '100% Ổ Cứng NVMe U.2',
    desc: 'Sử dụng dòng ổ cứng NVMe Enterprise cho tốc độ đọc ghi IOPS vượt trội gấp 10 lần SSD thông thường.',
    color: 'text-blue-500 bg-blue-50 border-blue-100',
  },
  {
    icon: Lock,
    title: 'Bảo Vệ Anti-DDoS Đa Tầng',
    desc: 'Tự động phát hiện và ngăn chặn các cuộc tấn công Layer 3/4/7 với dung lượng lọc lên tới 500Gbps.',
    color: 'text-emerald-500 bg-emerald-50 border-emerald-100',
  },
  {
    icon: Headphones,
    title: 'Hỗ Trợ Kỹ Thuật 24/7/365',
    desc: 'Đội ngũ kỹ sư mạng và hệ thống giàu kinh nghiệm sẵn sàng phản hồi trong vòng 15 phút qua Livechat & Hotline.',
    color: 'text-indigo-500 bg-indigo-50 border-indigo-100',
  },
];

interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  category: string;
  thumbnailUrl: string;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
}

const defaultFeaturedNews: NewsArticle[] = [
  {
    id: 1,
    title: 'CloudVerse Chính Thức Nâng Cấp Hệ Thống Ổ Cứng NVMe U.2 Enterprise 2026',
    summary: 'Tối ưu hóa tốc độ truy xuất cơ sở dữ liệu và khả năng chịu tải cho hàng chục ngàn máy chủ ảo đám mây.',
    category: 'Hướng Dẫn Kỹ Thuật',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
    viewCount: 1540,
    publishedAt: '2026-08-18T08:00:00Z',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 2,
    title: 'Hướng Dẫn Cấu Hình Bảo Vệ Anti-DDoS Đa Lớp Cho Website Thương Mại Điện Tử',
    summary: 'Cách thiết lập hệ thống tường lửa WAF và chống tấn công Layer 7 giúp website luôn vận hành ổn định 24/7.',
    category: 'Bảo Mật Hệ Thống',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
    viewCount: 890,
    publishedAt: '2026-08-16T10:30:00Z',
    createdAt: '2026-08-16T10:30:00Z',
  },
  {
    id: 3,
    title: 'Bùng Nổ Khuyến Mãi Cloud VPS SSD Giảm 50% Trọn Đời Năm 2026',
    summary: 'Nhận ngay ưu đãi giảm 50% trọn đời khi đăng ký gói Cloud VPS Pro hoặc Business tại hệ thống CloudVerse.',
    category: 'Chương Trình Khuyến Mãi',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800',
    viewCount: 3420,
    publishedAt: '2026-08-15T09:30:00Z',
    createdAt: '2026-08-15T09:30:00Z',
  },
];

const defaultActivePromos: Promotion[] = [
  {
    id: 1,
    code: 'WELCOME2026',
    title: 'Khuyến mãi chào mừng năm mới 2026 - Giảm 20% toàn bộ dịch vụ',
    discountPercent: 20,
    startDate: '2026-08-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    isActive: true,
    isCurrentlyValid: true,
    createdAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 2,
    code: 'CLOUD50',
    title: 'Siêu sale Cloud Server - Giảm ngay 50%',
    discountPercent: 50,
    startDate: '2026-08-01T00:00:00Z',
    endDate: '2026-10-31T23:59:59Z',
    isActive: true,
    isCurrentlyValid: true,
    createdAt: '2026-08-01T00:00:00Z',
  },
];

export default function HomePage() {
  const [latestNews, setLatestNews] = useState<NewsArticle[]>(defaultFeaturedNews);
  const [activePromotions, setActivePromotions] = useState<Promotion[]>(defaultActivePromos);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    // Tải tin tức mới nhất
    async function loadLatestNews() {
      try {
        const res = await fetchApi<any>('/api/News?pageSize=3');
        if (res.data && Array.isArray(res.data.items) && res.data.items.length > 0) {
          setLatestNews(res.data.items.slice(0, 3));
        } else if (Array.isArray(res.data) && res.data.length > 0) {
          setLatestNews(res.data.slice(0, 3));
        }
      } catch {
        // fallback
      }
    }
    loadLatestNews();

    // Tải các mã giảm giá đang chạy có hiệu lực thực tế từ Database
    async function loadActivePromos() {
      try {
        const res = await fetchApi<any>('/api/Promotions/active');
        let fetched: Promotion[] = [];
        if (Array.isArray(res.data) && res.data.length > 0) {
          fetched = res.data;
        } else if (res.data && Array.isArray(res.data.items) && res.data.items.length > 0) {
          fetched = res.data.items;
        }

        if (fetched.length > 0) {
          setActivePromotions(fetched.slice(0, 3));
        } else {
          const localManagedPromos = JSON.parse(localStorage.getItem('admin_managed_promotions') || '[]');
          if (localManagedPromos.length > 0) {
            const activeOnly = localManagedPromos.filter((p: any) => p.isActive);
            setActivePromotions(activeOnly.slice(0, 3));
          } else {
            setActivePromotions(defaultActivePromos);
          }
        }
      } catch {
        const localManagedPromos = JSON.parse(localStorage.getItem('admin_managed_promotions') || '[]');
        if (localManagedPromos.length > 0) {
          const activeOnly = localManagedPromos.filter((p: any) => p.isActive);
          setActivePromotions(activeOnly.slice(0, 3));
        } else {
          setActivePromotions(defaultActivePromos);
        }
      }
    }
    loadActivePromos();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      
      {/* 1. HERO SECTION WITH IMAGE BANNER */}
      <section className="relative overflow-hidden bg-slate-900 border-b border-slate-800 text-white">
        {/* Background Image Container */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transform scale-105"
          style={{ 
            backgroundImage: "url('/images/hero-banner.png')",
            backgroundPosition: 'center 30%'
          }}
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-blue-950/70 backdrop-blur-[1px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 relative z-10">
          <div className="max-w-3xl space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Hạ Tầng Điện Toán Đám Mây Chuẩn Tier III Quốc Tế</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Hạ Tầng Cloud VPS &amp; Hosting{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 block mt-2">
                Tốc Độ Cao Chuẩn NVMe U.2
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl font-normal">
              Triển khai máy chủ đám mây, Web Hosting LiteSpeed và Email doanh nghiệp chỉ trong 30 giây. Băng thông quốc tế 100Gbps, bảo vệ Anti-DDoS đa tầng và cam kết SLA 99.99%.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link 
                href="/services" 
                className="btn-pill btn-pill-primary text-sm w-full sm:w-auto text-center"
              >
                <span>Khám Phá Bảng Giá Dịch Vụ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/contact" 
                className="btn-pill btn-pill-secondary text-sm w-full sm:w-auto text-center"
              >
                <span>Liên Hệ &amp; Đặt Gói Trực Tuyến</span>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-white/10">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono">99.99%</div>
                <div className="text-xs text-slate-300 mt-1 font-medium">Cam Kết Uptime SLA</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">7000MB/s</div>
                <div className="text-xs text-slate-300 mt-1 font-medium">NVMe U.2 Enterprise</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">24/7/365</div>
                <div className="text-xs text-slate-300 mt-1 font-medium">Kỹ Thuật Đồng Hành</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FEATURED PRICING PLANS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="badge-pill bg-blue-50 text-blue-700 border-blue-200">
            Cấu Hình Tiêu Biểu
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Gói Máy Chủ Cloud VPS Phổ Biến Nhất
          </h2>
          <p className="text-sm text-slate-600">
            Khởi tạo tức thì, tài nguyên thực 100% không overcommit, quản lý dễ dàng qua giao diện web hiện đại.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {featuredPlans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                plan.popular
                  ? 'bg-white border-2 border-blue-600 shadow-xl shadow-blue-500/10 ring-4 ring-blue-50'
                  : 'bg-white border border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                  Gói Được Chọn Nhiều Nhất
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${plan.badgeColor}`}>
                    {plan.badge}
                  </span>
                </div>

                <div className="flex items-baseline gap-1 my-6">
                  <span className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">đ{plan.cycle}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  {plan.description}
                </p>

                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Thông số kỹ thuật
                  </span>
                  {plan.specs.map((spec, sIdx) => (
                    <div key={sIdx} className="flex items-center justify-between text-xs py-1">
                      <span className="text-slate-500">{spec.label}</span>
                      <span className="font-bold text-slate-900 font-mono">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-slate-100">
                <Link
                  href={plan.href}
                  className={`w-full py-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <Server className="w-4 h-4" />
                  {plan.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 font-bold text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-6 py-3 rounded-full border border-blue-200 transition-colors"
          >
            <span>Xem đầy đủ bảng giá Hosting, Cloud Server &amp; Tên Miền</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 3. CÁC MÃ GIẢM GIÁ ĐANG CHẠY (KHUYẾN MÃI HOT) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-2">
            <span className="badge-pill bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Gift className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chương Trình Khuyến Mãi Đang Chạy</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Mã Giảm Giá &amp; Voucher Ưu Đãi
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Thu thập mã giảm giá để nhận chiết khấu trực tiếp khi đăng ký máy chủ hoặc gia hạn dịch vụ.
            </p>
          </div>

          <Link
            href="/promotions"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded-full border border-emerald-200 transition-colors self-start sm:self-auto"
          >
            <span>Xem Tất Cả Voucher</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activePromotions.map((promo) => (
            <div
              key={promo.id}
              className="p-6 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
            >
              {/* Badge % giảm */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Giảm -{promo.discountPercent}%
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  HSD: {formatDate(promo.endDate)}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {promo.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Áp dụng trực tiếp khi thanh toán dịch vụ Cloud VPS &amp; Hosting.
                </p>
              </div>

              {/* Box Mã Voucher */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex-1 bg-white border border-dashed border-emerald-400 rounded-xl px-3 py-2 text-center">
                  <span className="font-mono font-extrabold text-emerald-700 text-sm tracking-wider">
                    {promo.code}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(promo.code)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {copiedCode === promo.code ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. KEY HIGHLIGHTS WITH DATACENTER BACKGROUND */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative p-8 sm:p-12 rounded-3xl overflow-hidden shadow-2xl text-white">
          {/* Background image & dark glass overlay */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/datacenter-future.jpg')" }}
          />
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-950/95 via-slate-900/90 to-indigo-950/90 backdrop-blur-[1px]" />

          <div className="relative z-10">
            <div className="max-w-3xl mb-12">
              <span className="badge-pill bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Công Nghệ Vượt Trội
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold mt-4 tracking-tight">
                Lý Do Hơn 10.000+ Khách Hàng Tin Dùng CloudVerse
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">
                Hạ tầng đạt chuẩn quốc tế Tier III với hệ thống làm mát chính xác và nguồn điện kép dự phòng N+1
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {highlights.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="p-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md hover:bg-white/15 transition-all shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. TIN TỨC & BÀI VIẾT NỔI BẬT (MỚI NHẤT) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="space-y-2">
            <span className="badge-pill bg-blue-50 text-blue-700 border-blue-200">
              <Newspaper className="w-3.5 h-3.5" />
              <span>Tin Tức &amp; Kiến Thức Đám Mây</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tin Nổi Bật &amp; Bài Viết Mới Nhất
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Cập nhật các chương trình ưu đãi, thông báo nâng cấp hệ thống và kiến thức quản trị máy chủ.
            </p>
          </div>

          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-full border border-blue-200 transition-colors self-start sm:self-auto"
          >
            <span>Xem Tất Cả Bài Viết</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestNews.map((article) => (
            <Link
              key={article.id}
              href="/news"
              className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail Image */}
                <div className="h-48 overflow-hidden relative bg-slate-100">
                  <img
                    src={article.thumbnailUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-md">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(article.publishedAt || article.createdAt)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {article.viewCount} lượt xem
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2">
                <span className="text-xs font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                  Đọc tiếp <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. AFFILIATE & PROMOTIONS CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Affiliate Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-tr from-amber-50 to-orange-50 border border-amber-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Tiếp Thị Liên Kết (Affiliate)</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Nhận ngay <strong className="text-amber-700">hoa hồng 20%</strong> trọn đời cho mỗi khách hàng bạn giới thiệu. Rút tiền nhanh chóng, minh bạch qua tài khoản ngân hàng.
              </p>
            </div>
            <div className="pt-6">
              <Link
                href="/affiliate"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-colors"
              >
                Đăng Ký Làm Đối Tác <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Promotions Voucher Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-tr from-emerald-50 to-teal-50 border border-emerald-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 mb-6">
                <Tag className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Voucher &amp; Khuyến Mãi Hot</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Tổng hợp hàng chục mã voucher giảm giá 10% - 50% cho người dùng mới và gia hạn máy chủ trong tháng này.
              </p>
            </div>
            <div className="pt-6">
              <Link
                href="/promotions"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
              >
                Lấy Mã Giảm Giá Ngay <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
