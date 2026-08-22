'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Gift, Calendar, Check, Copy, AlertCircle, Sparkles, Tag, ArrowRight, Zap } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { Promotion } from '@/types';

const samplePromotions: Promotion[] = [
  {
    id: 1,
    code: 'WELCOME2026',
    title: 'Giảm 20% Cho Khách Hàng Mới',
    discountPercent: 20,
    startDate: '2026-08-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    isActive: true,
    isCurrentlyValid: true,
    createdAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 2,
    code: 'CLOUD2026',
    title: 'Ưu Đãi Gói Cloud VPS Pro 20%',
    discountPercent: 20,
    startDate: '2026-08-15T00:00:00Z',
    endDate: '2026-09-30T23:59:59Z',
    isActive: true,
    isCurrentlyValid: true,
    createdAt: '2026-08-15T00:00:00Z',
  },
  {
    id: 3,
    code: 'CLOUD50',
    title: 'Siêu Ưu Đãi Giảm 50% Toàn Bộ Gói',
    discountPercent: 50,
    startDate: '2026-08-01T00:00:00Z',
    endDate: '2026-10-31T23:59:59Z',
    isActive: true,
    isCurrentlyValid: true,
    createdAt: '2026-08-01T00:00:00Z',
  }
];

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadPromos() {
      setLoading(true);
      const localManagedPromos = JSON.parse(localStorage.getItem('admin_managed_promotions') || '[]');

      if (localManagedPromos.length > 0) {
        // Chỉ lấy những mã đang bật isActive
        const activeOnly = localManagedPromos.filter((p: any) => p.isActive);
        setPromotions(activeOnly);
        setLoading(false);
        return;
      }

      try {
        const res = await fetchApi<any>('/api/Promotions/active');
        let fetched: Promotion[] = [];
        if (Array.isArray(res.data) && res.data.length > 0) {
          fetched = res.data;
        } else if (res.data && Array.isArray(res.data.items) && res.data.items.length > 0) {
          fetched = res.data.items;
        }
        setPromotions(fetched.length > 0 ? fetched : samplePromotions);
      } catch {
        setPromotions(samplePromotions);
      } finally {
        setLoading(false);
      }
    }
    loadPromos();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Header with Background Image */}
      <div className="relative overflow-hidden bg-slate-950 border-b border-slate-800 text-white">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/promotions-hero-bg.jpg"
            alt="Khuyến Mãi Lớn Cloud Data Center"
            className="w-full h-full object-cover object-center opacity-45 filter brightness-95"
          />
          {/* Gradients Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/80 via-transparent to-red-950/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-6">
          <span className="badge-pill bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-400/40 backdrop-blur-md">
            <Gift className="w-3.5 h-3.5" />
            <span>Chương Trình Tri Ân &amp; Chào Đón Khách Hàng Mới</span>
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-md">
            Khuyến Mãi &amp; Mã Giảm Giá Đặc Biệt
          </h1>
          <p className="text-slate-200 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed drop-shadow font-medium">
            Áp dụng mã voucher để nhận chiết khấu trực tiếp lên đến <strong className="text-amber-400 font-extrabold text-lg">50%</strong> cho các gói Cloud VPS, Web Hosting và Tên Miền.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/services"
              className="px-7 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Xem Gói Dịch Vụ Ngay
            </Link>
          </div>
        </div>
      </div>

      {/* Promotions Cards Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Danh Sách Voucher Đang Hoạt Động</h2>
            <p className="text-xs text-slate-500 mt-1">Bấm sao chép hoặc nhấn Áp Dụng Ngay để kích hoạt ưu đãi</p>
          </div>
          <span className="badge-pill bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
            {promotions.length} Voucher khả dụng
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-3xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-sm">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Hiện Chưa Có Voucher Mới</h3>
            <p className="text-xs text-slate-500">Hãy quay lại sau để cập nhật các chương trình ưu đãi sắp diễn ra.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all flex flex-col justify-between space-y-6 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="badge-pill bg-gradient-to-r from-amber-50 to-orange-50 text-orange-700 border border-orange-200 font-mono font-extrabold text-sm">
                      Giảm {promo.discountPercent}%
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      HSD: {formatDate(promo.endDate)}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mt-4 group-hover:text-blue-600 transition-colors">
                    {promo.title}
                  </h3>

                  {/* Hiển thị ví dụ giá sau khi giảm */}
                  <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Ví dụ: Gói VPS Starter{' '}
                      <span className="line-through text-slate-400 font-mono">99.000đ</span>{' '}
                      →{' '}
                      <strong className="text-emerald-700 font-mono text-sm font-extrabold">
                        {Math.round(99000 * (1 - promo.discountPercent / 100)).toLocaleString('vi-VN')}đ
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  {/* Ô mã code + nút sao chép */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between gap-2">
                    <span className="font-mono font-extrabold text-blue-700 text-sm tracking-wider">
                      {promo.code}
                    </span>
                    <button
                      onClick={() => handleCopy(promo.code)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold shadow-sm transition-colors"
                    >
                      {copiedCode === promo.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Nút áp dụng – truyền mã và % giảm qua URL */}
                  <Link
                    href={`/services?promo=${encodeURIComponent(promo.code)}&discount=${promo.discountPercent}`}
                    className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-slate-900/10 hover:shadow-blue-500/25"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Áp Dụng Ngay Cho Gói Dịch Vụ
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
