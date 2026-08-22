'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Zap, 
  Globe, 
  ArrowRight, 
  QrCode, 
  Sparkles,
  X
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { formatCurrency, generateVietQrUrl } from '@/lib/formatters';

interface Category { id: number; name: string; slug: string; }
interface Plan {
  id: number;
  name: string;
  code?: string;
  categoryId: number;
  description: string;
  cpu: string;
  ram: string;
  storage: string;
  bandwidth: string;
  monthlyPrice: number;
  yearlyPrice: number;
}

const defaultCategories: Category[] = [
  { id: 1, name: 'VPS / Cloud Server', slug: 'vps' },
  { id: 2, name: 'Web Hosting LiteSpeed', slug: 'hosting' },
  { id: 3, name: 'Tên Miền & SSL', slug: 'domain' },
  { id: 4, name: 'Email Doanh Nghiệp', slug: 'email' },
];

const defaultPlans: Plan[] = [
  {
    id: 1,
    name: 'Cloud VPS Starter',
    categoryId: 1,
    description: 'Phù hợp cho blog cá nhân, website WordPress và thử nghiệm ứng dụng nhỏ.',
    cpu: '1 Core Intel Xeon',
    ram: '1 GB DDR4 ECC',
    storage: '25 GB NVMe Enterprise',
    bandwidth: '1 Gbps Không Giới Hạn',
    monthlyPrice: 99000,
    yearlyPrice: 79000 * 12,
  },
  {
    id: 2,
    name: 'Cloud VPS Pro',
    categoryId: 1,
    description: 'Cấu hình tối ưu cho cửa hàng online, website doanh nghiệp và API hiệu năng cao.',
    cpu: '2 Core Intel Xeon',
    ram: '4 GB DDR4 ECC',
    storage: '60 GB NVMe Enterprise',
    bandwidth: '1 Gbps Không Giới Hạn',
    monthlyPrice: 249000,
    yearlyPrice: 199000 * 12,
  },
  {
    id: 3,
    name: 'Cloud VPS Business',
    categoryId: 1,
    description: 'Sức mạnh vượt trội cho hệ thống thương mại điện tử và cơ sở dữ liệu lớn.',
    cpu: '4 Core Intel Xeon',
    ram: '8 GB DDR4 ECC',
    storage: '120 GB NVMe Enterprise',
    bandwidth: '1 Gbps Không Giới Hạn',
    monthlyPrice: 499000,
    yearlyPrice: 399000 * 12,
  },
  {
    id: 4,
    name: 'Hosting LiteSpeed Basic',
    categoryId: 2,
    description: 'Tăng tốc độ tải trang gấp 5 lần với Web Server LiteSpeed Cache bản quyền.',
    cpu: '1 vCPU Share',
    ram: '1 GB RAM',
    storage: '10 GB SSD NVMe',
    bandwidth: 'Không giới hạn',
    monthlyPrice: 49000,
    yearlyPrice: 39000 * 12,
  },
  {
    id: 5,
    name: 'Hosting LiteSpeed Pro',
    categoryId: 2,
    description: 'Hỗ trợ không giới hạn tên miền phụ, chứng chỉ SSL miễn phí trọn đời.',
    cpu: '2 vCPU Share',
    ram: '2 GB RAM',
    storage: '30 GB SSD NVMe',
    bandwidth: 'Không giới hạn',
    monthlyPrice: 99000,
    yearlyPrice: 79000 * 12,
  },
  {
    id: 6,
    name: 'Domain Quốc Tế .COM / .NET',
    categoryId: 3,
    description: 'Khẳng định thương hiệu trực tuyến với tên miền quốc tế phổ biến nhất thế giới.',
    cpu: 'DNS Anycast',
    ram: 'Khóa Tên Miền',
    storage: 'Ẩn Thông Tin WHOIS',
    bandwidth: 'Quản trị tự động 24/7',
    monthlyPrice: 280000,
    yearlyPrice: 280000,
  }
];

export default function ServicesPage() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [activeCategory, setActiveCategory] = useState<number>(1);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanQr, setSelectedPlanQr] = useState<Plan | null>(null);

  // Đọc promo code và % giảm từ URL params (ví dụ: /services?promo=CLOUD50&discount=50)
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoDiscount, setPromoDiscount] = useState<number>(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('promo') || '';
    const disc = parseInt(params.get('discount') || '0', 10);
    if (code) {
      setPromoCode(code);
      setPromoDiscount(isNaN(disc) ? 0 : disc);
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      const localSavedPlans = JSON.parse(localStorage.getItem('admin_managed_service_plans') || '[]');
      const localSavedCats = JSON.parse(localStorage.getItem('admin_managed_service_categories') || '[]');

      if (localSavedPlans.length > 0) {
        setPlans(
          localSavedPlans.map((p: any) => ({
            id: p.id,
            name: p.name,
            categoryId: p.serviceCategoryId || p.categoryId || 1,
            description: p.description,
            cpu: p.cpu,
            ram: p.ram,
            storage: p.storage,
            bandwidth: p.bandwidth,
            monthlyPrice: p.monthlyPrice,
            yearlyPrice: p.yearlyPrice,
          }))
        );
      }

      if (localSavedCats.length > 0) {
        setCategories(localSavedCats);
      } else {
        try {
          const catsRes = await fetchApi<any>('/api/categories');
          if (catsRes.data && Array.isArray(catsRes.data.items) && catsRes.data.items.length > 0) {
            setCategories(catsRes.data.items);
          }
        } catch {
          // Fallback sang dữ liệu mẫu
        }
      }
    }
    loadData();
  }, []);

  const filteredPlans = plans.filter((p) => p.categoryId === activeCategory);

  // Tính giá sau khi áp dụng mã giảm giá
  const getDiscountedPrice = (original: number) => {
    if (!promoDiscount) return original;
    return Math.round(original * (1 - promoDiscount / 100));
  };

  // Xây dựng link đặt hàng kèm promo code nếu có
  const buildOrderLink = (planId: number) => {
    const params = new URLSearchParams();
    params.set('cycle', billingCycle);
    if (promoCode) {
      params.set('promo', promoCode);
      params.set('discount', String(promoDiscount));
    }
    return `/order/${planId}?${params.toString()}`;
  };

  const hasDiscount = promoDiscount > 0 && !!promoCode;

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Header With Background Image */}
      <div className="relative overflow-hidden bg-slate-900 border-b border-slate-800 text-white">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/services-hero-bg.jpg"
            alt="Data Center Cloud Background"
            className="w-full h-full object-cover object-center opacity-40 filter brightness-90"
          />
          {/* Gradients Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/60 via-transparent to-indigo-950/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center space-y-6">
          <span className="badge-pill bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hạ Tầng Điện Toán Đám Mây Chuẩn Tier III</span>
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-md">
            Bảng Giá &amp; Cấu Hình Dịch Vụ
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed drop-shadow-sm font-medium">
            Lựa chọn gói Cloud VPS, Web Hosting và Tên Miền tối ưu với ổ cứng NVMe Enterprise, cổng mạng 100Gbps và hỗ trợ kỹ thuật 24/7.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex items-center bg-slate-900/80 backdrop-blur-md p-1.5 rounded-full border border-slate-700/80 shadow-2xl">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Thanh Toán Hàng Tháng
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Thanh Toán 1 Năm</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-extrabold">
                  -20%
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

      {/* Banner promo khi đến từ trang Khuyến Mãi */}
      {hasDiscount && (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 shadow-sm">
          <div className="p-2.5 rounded-xl bg-emerald-500 text-white flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-emerald-900">
              Mã giảm giá{' '}
              <span className="font-mono bg-white px-2 py-0.5 rounded-lg border border-emerald-300 text-blue-700">
                {promoCode}
              </span>{' '}
              đã được áp dụng — Giảm <strong>{promoDiscount}%</strong> cho tất cả gói!
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Giá hiển thị dưới đây đã được tính sau khi áp dụng mã. Nhấn đặt hàng để thanh toán với giá ưu đãi.
            </p>
          </div>
          <button
            onClick={() => { setPromoCode(''); setPromoDiscount(0); }}
            className="p-1.5 rounded-full hover:bg-emerald-200 text-emerald-600 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Plan Cards Grid */}
      {filteredPlans.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-sm max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Server className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Danh Mục Đang Được Cập Nhật</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Hiện chưa có gói dịch vụ nào trong danh mục này hoặc quản trị viên đang cập nhật bảng giá mới.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlans.map((plan) => {
            const originalPrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const discountedPrice = getDiscountedPrice(originalPrice);
            return (
              <div
                key={plan.id}
                className={`flex flex-col justify-between p-8 rounded-3xl bg-white border shadow-sm hover:shadow-xl transition-all duration-300 group ${
                  hasDiscount
                    ? 'border-emerald-300 ring-1 ring-emerald-200'
                    : 'border-slate-200/90 hover:border-blue-300'
                }`}
              >
                <div>
                  {/* Title & Tag */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {plan.name}
                    </h3>
                    <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                      <Server className="w-5 h-5" />
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 min-h-[36px]">
                    {plan.description}
                  </p>

                {/* Price Display */}
                <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  {hasDiscount ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-400 line-through font-mono">
                          {formatCurrency(originalPrice)}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                          -{promoDiscount}%
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-extrabold text-emerald-600 font-mono">
                          {formatCurrency(discountedPrice)}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          /{billingCycle === 'monthly' ? 'tháng' : 'năm'}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-semibold">
                        Tiết kiệm {formatCurrency(originalPrice - discountedPrice)} với mã{' '}
                        <span className="font-mono">{promoCode}</span>
                      </p>
                    </div>
                  ) : billingCycle === 'yearly' ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 line-through font-mono">
                          {formatCurrency(plan.monthlyPrice * 12)}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-extrabold">
                          Tiết kiệm 20%
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-extrabold text-slate-900 font-mono">
                          {formatCurrency(plan.yearlyPrice)}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          /năm
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-medium">
                        (Tương đương <strong className="font-mono font-bold text-emerald-800">{formatCurrency(Math.round(plan.yearlyPrice / 12))}</strong>/tháng)
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-slate-900 font-mono">
                        {formatCurrency(originalPrice)}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        /tháng
                      </span>
                    </div>
                  )}
                </div>

                {/* Hardware Spec Badges */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-blue-500" /> Vi Xử Lý CPU:
                    </span>
                    <span className="font-bold text-slate-800 font-mono">{plan.cpu}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" /> Dung Lượng RAM:
                    </span>
                    <span className="font-bold text-slate-800 font-mono">{plan.ram}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                      <HardDrive className="w-4 h-4 text-emerald-500" /> Bộ Nhớ SSD:
                    </span>
                    <span className="font-bold text-slate-800 font-mono">{plan.storage}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-indigo-500" /> Băng Thông:
                    </span>
                    <span className="font-bold text-slate-800 font-mono">{plan.bandwidth}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-8 space-y-2">
                <Link
                  href={buildOrderLink(plan.id)}
                  className={`w-full py-3.5 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
                    hasDiscount
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  {hasDiscount
                    ? `Đặt Ngay – Giá ${formatCurrency(discountedPrice)}`
                    : 'Đăng Ký Thuê Gói Này'}
                </Link>

                <button
                  type="button"
                  onClick={() => setSelectedPlanQr(plan)}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5 text-slate-500" />
                  Xem Mã QR Thông Tin Gói
                </button>
              </div>

            </div>
          );
        })}
      </div>
      )}

      {/* POPUP MODAL HIỂN THỊ MÃ QR GÓI DỊCH VỤ */}
      {selectedPlanQr && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 text-center">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="badge-pill bg-blue-50 text-blue-700 border border-blue-200">
                  Mã QR Gói Dịch Vụ
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedPlanQr.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPlanQr(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const basePrice = billingCycle === 'yearly' ? selectedPlanQr.yearlyPrice : selectedPlanQr.monthlyPrice;
              const cyclLabel = billingCycle === 'yearly' ? 'năm' : 'tháng';
              const discounted = getDiscountedPrice(basePrice);
              const finalPrice = hasDiscount ? discounted : basePrice;

              return (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col items-center">
                    <img
                      src={generateVietQrUrl({
                        amount: finalPrice,
                        description: `GOI ${selectedPlanQr.code || selectedPlanQr.name.slice(0, 15)} ${billingCycle.toUpperCase()}`,
                        accountName: 'NGUYEN PHUONG KIET',
                      })}
                      alt={`Mã VietQR ${selectedPlanQr.name}`}
                      className="w-56 h-auto rounded-xl object-contain shadow-sm border border-slate-100"
                    />
                    <span className="badge-pill bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] mt-2">
                      VietQR Napas 24/7 Tự Động Điền Tiền & Nội Dung
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-left text-xs space-y-1.5 w-full text-slate-700">
                    <p className="font-bold text-blue-900">Thông tin gói dịch vụ:</p>
                    <p>• <strong>Cấu hình:</strong> {selectedPlanQr.cpu} | {selectedPlanQr.ram} | {selectedPlanQr.storage}</p>
                    <p>
                      • <strong>Chu kỳ thanh toán:</strong>{' '}
                      <span className={`font-bold px-1.5 py-0.5 rounded-md ${billingCycle === 'yearly' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                        {billingCycle === 'yearly' ? 'Thanh toán 1 Năm' : 'Thanh toán Hàng Tháng'}
                      </span>
                    </p>
                    <p>
                      • <strong>Giá niêm yết:</strong>{' '}
                      <span className={hasDiscount ? 'line-through text-slate-400' : 'font-bold text-slate-900'}>
                        {formatCurrency(basePrice)}
                      </span>
                      {' '}/ {cyclLabel}
                    </p>
                    {hasDiscount && (
                      <p className="text-emerald-700 font-semibold">
                        • <strong>Sau giảm {promoDiscount}% (mã {promoCode}):</strong>{' '}
                        <span className="text-emerald-800 font-extrabold">{formatCurrency(discounted)}</span>
                        {' '}/ {cyclLabel}
                      </p>
                    )}
                    <p className="pt-1 text-[11px] text-slate-500 border-t border-blue-100">
                      💰 Tổng cần thanh toán:{' '}
                      <strong className="text-blue-800 text-xs">{formatCurrency(finalPrice)}</strong>
                      {' '}/ {cyclLabel}
                    </p>
                  </div>
                </div>
              );
            })()}

            <div className="flex gap-3">
              <Link
                href={buildOrderLink(selectedPlanQr.id)}
                className="flex-1 btn-pill btn-pill-primary text-xs py-3"
              >
                Đặt Thuê Ngay
              </Link>
              <button
                onClick={() => setSelectedPlanQr(null)}
                className="btn-pill btn-pill-secondary text-xs py-3"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </div>
  );
}
