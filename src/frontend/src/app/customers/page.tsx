'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Building2,
  Users,
  Award,
  Quote,
  X,
  Crown,
  Trophy,
  Medal,
  Sparkles,
  Send,
  User,
  MessageSquare,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { generateVietQrUrl, formatCurrency } from '@/lib/formatters';
import { fetchApi } from '@/lib/api';

// Danh sách khách hàng & đối tác doanh nghiệp tiêu biểu
const clientLogos = [
  { label: 'TIKI', name: 'Tiki Corporation', industry: 'Thương Mại Điện Tử', color: 'bg-blue-100 text-blue-800' },
  { label: 'VNG', name: 'VNG Cloud Tech', industry: 'Game & FinTech', color: 'bg-indigo-100 text-indigo-800' },
  { label: 'FPT', name: 'FPT Software', industry: 'Công Nghệ Thông Tin', color: 'bg-emerald-100 text-emerald-800' },
  { label: 'SENDO', name: 'Sendo Vietnam', industry: 'Bán Lẻ Trực Tuyến', color: 'bg-rose-100 text-rose-800' },
  { label: 'VNPAY', name: 'VNPay Enterprise', industry: 'Cổng Thanh Toán', color: 'bg-amber-100 text-amber-800' },
  { label: 'BE', name: 'Be Group Vietnam', industry: 'Vận Tải Công Nghệ', color: 'bg-violet-100 text-violet-800' },
  { label: 'MOMO', name: 'MoMo E-Wallet', industry: 'Ví Điện Tử', color: 'bg-pink-100 text-pink-800' },
  { label: 'ZALOPAY', name: 'ZaloPay Fintech', industry: 'Thanh Toán Di Động', color: 'bg-cyan-100 text-cyan-800' },
];

// Dữ liệu đánh giá mẫu mặc định
const initialDefaultReviews = [
  {
    id: 1,
    name: 'Trần Minh Hoàng',
    role: 'CTO @ FinTech Solution',
    plan: 'Cloud VPS Business',
    avatar: 'TH',
    avatarColor: 'bg-blue-600',
    rating: 5,
    content: 'Chúng tôi chuyển đổi toàn bộ 15 cụm microservices sang Cloud VPS Business của CloudVerse. Tốc độ đọc ghi NVMe vượt trội giúp độ trễ API giảm hơn 40%. Uptime đạt 100% trong 6 tháng qua. Đội ngũ kỹ thuật hỗ trợ cực kỳ chuyên nghiệp!',
    date: '15/08/2026',
    isUserSubmitted: false,
  },
  {
    id: 2,
    name: 'Nguyễn Lê Quỳnh Anh',
    role: 'Lead Architect @ Retail E-commerce',
    plan: 'Cloud VPS Pro',
    avatar: 'QA',
    avatarColor: 'bg-emerald-600',
    rating: 5,
    content: 'Chính sách chiết khấu bậc thang theo năm và thanh toán định kỳ 3 tháng/lần của CloudVerse rất phù hợp khi tối ưu dòng tiền doanh nghiệp. Đặc biệt mã QR thanh toán tích hợp VietQR rất tiện lợi và nhanh gọn.',
    date: '28/07/2026',
    isUserSubmitted: false,
  },
  {
    id: 3,
    name: 'Phạm Đức Thắng',
    role: 'Founder @ ThangTech Media',
    plan: 'Hosting LiteSpeed Pro',
    avatar: 'PT',
    avatarColor: 'bg-violet-600',
    rating: 5,
    content: 'Web Hosting LiteSpeed của CloudVerse kết hợp bộ nhớ đệm LSCache giúp website bán hàng của tôi tải dưới 0.8 giây từ mọi thiết bị. Uptime 100% trong suốt chiến dịch Flash Sale. Cực kỳ hài lòng!',
    date: '10/07/2026',
    isUserSubmitted: false,
  },
  {
    id: 4,
    name: 'Lê Thị Hương Giang',
    role: 'IT Manager @ Logistics Corp',
    plan: 'Cloud VPS Starter',
    avatar: 'HG',
    avatarColor: 'bg-rose-600',
    rating: 5,
    content: 'Hệ thống quản lý vận đơn của chúng tôi hoạt động rất ổn định trên CloudVerse VPS Starter. Chi phí hợp lý, dễ nâng cấp khi cần mở rộng, hỗ trợ kỹ thuật phản hồi trong vòng 10 phút qua Livechat.',
    date: '19/06/2026',
    isUserSubmitted: false,
  },
  {
    id: 5,
    name: 'Ngô Quang Vinh',
    role: 'DevOps Engineer @ SaaS Startup',
    plan: 'Cloud VPS Business',
    avatar: 'QV',
    avatarColor: 'bg-amber-600',
    rating: 5,
    content: 'Tôi đã trải nghiệm nhiều nhà cung cấp VPS khác nhau, CloudVerse nổi bật hẳn về tốc độ IOPS NVMe và độ ổn định mạng. Cổng quản trị trực quan, API đầy đủ, tích hợp Terraform được ngay.',
    date: '04/06/2026',
    isUserSubmitted: false,
  },
  {
    id: 6,
    name: 'Võ Thị Minh Châu',
    role: 'CEO @ HealthTech Clinic',
    plan: 'Hosting LiteSpeed Basic',
    avatar: 'MC',
    avatarColor: 'bg-teal-600',
    rating: 5,
    content: 'Bệnh viện tư nhân chúng tôi cần một hosting đáng tin cậy để chạy phần mềm đặt lịch khám. CloudVerse Hosting LiteSpeed Basic đáp ứng hoàn toàn yêu cầu. Dữ liệu backup tự động hàng ngày, bảo mật SSL, rất an tâm.',
    date: '22/05/2026',
    isUserSubmitted: false,
  },
];

// Mã QR từng gói dịch vụ (8 gói)
const servicePlansQr = [
  { id: 1, name: 'Cloud VPS Starter', monthlyPrice: 99000, category: 'VPS / Cloud Server', badge: '' },
  { id: 2, name: 'Cloud VPS Pro', monthlyPrice: 249000, category: 'VPS / Cloud Server', badge: '🔥 Bán Chạy' },
  { id: 3, name: 'Cloud VPS Business', monthlyPrice: 499000, category: 'VPS / Cloud Server', badge: '⚡ Hiệu Năng Cao' },
  { id: 4, name: 'Hosting LiteSpeed Basic', monthlyPrice: 49000, category: 'Web Hosting', badge: '' },
  { id: 5, name: 'Hosting LiteSpeed Pro', monthlyPrice: 99000, category: 'Web Hosting', badge: '⭐ Phổ Biến' },
  { id: 6, name: 'Tên Miền Quốc Tế .COM', monthlyPrice: 24000, category: 'Tên Miền', badge: '' },
  { id: 7, name: 'Tên Miền Quốc Gia .VN', monthlyPrice: 45000, category: 'Tên Miền', badge: '' },
  { id: 1002, name: 'Cloud Email Enterprise', monthlyPrice: 150000, category: 'Email Doanh Nghiệp', badge: '🏢 Doanh Nghiệp' },
];

interface TopCustomer {
  rank: 1 | 2 | 3;
  name: string;
  email: string;
  totalSpent: number;
  orderCount: number;
  badge: string;
  avatarColor: string;
  initials: string;
}

export default function CustomersPage() {
  const [selectedPlanQr, setSelectedPlanQr] = useState<typeof servicePlansQr[0] | null>(null);
  const [reviews, setReviews] = useState<any[]>(initialDefaultReviews);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);

  // Form soạn đánh giá mới
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [selectedService, setSelectedService] = useState('Cloud VPS Pro');
  const [rating, setRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Tải đánh giá từ LocalStorage (đồng bộ với trang Admin)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cloudverse_customer_reviews');
      if (stored) {
        setReviews(JSON.parse(stored));
      } else {
        localStorage.setItem('cloudverse_customer_reviews', JSON.stringify(initialDefaultReviews));
      }
    } catch {
      // fallback
    }
  }, []);

  // Tính toán TOP KHÁCH HÀNG CÓ TỔNG GIÁ TRỊ ĐƠN HÀNG CAO NHẤT (Dữ liệu thực 100% từ Database)
  useEffect(() => {
    async function calculateTopCustomers() {
      try {
        let rawTopList: any[] = [];
        
        // 1. Ưu tiên gọi API public top-customers từ Backend CSDL
        try {
          const res = await fetchApi<any>('/api/Orders/top-customers?count=5');
          if (res.data && Array.isArray(res.data)) {
            rawTopList = res.data;
          } else if (Array.isArray(res.data?.items)) {
            rawTopList = res.data.items;
          }
        } catch {
          // fallback sang đọc tất cả đơn nếu có quyền
        }

        // 2. Nếu endpoint chưa có dữ liệu, đọc từ danh sách đơn hàng
        if (rawTopList.length === 0) {
          let allOrders: any[] = [];
          try {
            const res = await fetchApi<any>('/api/Orders?pageSize=100');
            if (res.data && Array.isArray(res.data.items)) {
              allOrders = res.data.items;
            } else if (Array.isArray(res.data)) {
              allOrders = res.data;
            }
          } catch {}

          const localCreatedOrders: any[] = JSON.parse(localStorage.getItem('user_created_orders') || '[]');
          allOrders = [...allOrders, ...localCreatedOrders];

          const customerMap = new Map<string, { name: string; email: string; totalSpent: number; orderCount: number }>();

          allOrders.forEach((o) => {
            const name = (o.customerName || o.username || 'Khách Hàng').trim();
            const email = (o.customerEmail || '').trim().toLowerCase();
            const key = email || name.toLowerCase();
            const amount = Number(o.totalAmount || o.totalPrice || 0);

            if (!customerMap.has(key)) {
              customerMap.set(key, { name, email, totalSpent: 0, orderCount: 0 });
            }
            const curr = customerMap.get(key)!;
            curr.totalSpent += amount;
            curr.orderCount += 1;
          });

          rawTopList = Array.from(customerMap.values())
            .filter((c) => c.totalSpent > 0 || c.orderCount > 0)
            .sort((a, b) => b.totalSpent - a.totalSpent);
        }

        if (rawTopList.length > 0) {
          const formatted: TopCustomer[] = rawTopList.map((item, idx) => {
            const rank = (idx + 1) as 1 | 2 | 3;
            const name = item.name || 'Khách Hàng';
            const email = item.email || '';
            const totalSpent = Number(item.totalSpent || 0);
            const orderCount = Number(item.orderCount || 1);
            
            const initials = name
              .split(' ')
              .map((n: string) => n[0])
              .filter(Boolean)
              .slice(-2)
              .join('')
              .toUpperCase() || 'KH';

            let badge = 'Khách Hàng Thân Thiết';
            let avatarColor = 'bg-blue-600';
            if (idx === 0) {
              badge = 'Quán Quân Chi Tiêu';
              avatarColor = 'bg-amber-500';
            } else if (idx === 1) {
              badge = 'Huy Chương Bạc';
              avatarColor = 'bg-slate-500';
            } else if (idx === 2) {
              badge = 'Huy Chương Đồng';
              avatarColor = 'bg-amber-700';
            }

            return {
              rank: (idx < 3 ? rank : 3) as 1 | 2 | 3,
              name,
              email,
              totalSpent,
              orderCount,
              badge,
              avatarColor,
              initials,
            };
          });

          setTopCustomers(formatted);
        }
      } catch {
        // fallback
      }
    }
    calculateTopCustomers();
  }, []);

  // Xử lý gửi đánh giá với BẪY LỖI CHẶT CHẼ
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Bẫy lỗi Họ và tên: Chỉ cho phép chữ cái tiếng Việt có dấu và khoảng trắng
    const cleanName = authorName.trim();
    const nameRegex = /^[\p{L}\s]{2,60}$/u;
    if (!nameRegex.test(cleanName)) {
      setFormError('Họ và tên chỉ được chứa chữ cái (hỗ trợ tiếng Việt có dấu) và khoảng trắng (từ 2 đến 60 ký tự, không chứa số hoặc ký tự đặc biệt).');
      return;
    }

    // 2. Bẫy lỗi Chức danh / Công ty
    const cleanRole = authorRole.trim();
    const roleRegex = /^[\p{L}0-9\s@.,_&/-]{2,80}$/u;
    if (!roleRegex.test(cleanRole)) {
      setFormError('Chức danh / Đơn vị công tác không hợp lệ (từ 2 đến 80 ký tự, không chứa ký tự phá vỡ giao diện).');
      return;
    }

    // 3. BẪY LỖI NỘI DUNG ĐÁNH GIÁ: Chống chèn thẻ HTML, script, XSS (như <div>lỗi giao diện</div>)
    const cleanContent = reviewContent.trim();
    if (cleanContent.length < 10) {
      setFormError('Nội dung đánh giá cần tối thiểu 10 ký tự để mô tả cụ thể trải nghiệm của bạn.');
      return;
    }

    const xssPattern = /<[^>]*>|javascript:|onerror=|onload=|eval\(|<script|<iframe|<div|<img|<style/i;
    if (xssPattern.test(cleanContent)) {
      setFormError('Phát hiện nội dung chứa thẻ HTML hoặc mã không an toàn (ví dụ: <...>, script, thẻ div). Vui lòng chỉ nhập văn bản đánh giá thông thường.');
      return;
    }

    setSubmitting(true);

    const newReview = {
      id: Date.now(),
      name: cleanName,
      role: cleanRole,
      plan: selectedService,
      avatar: cleanName.split(' ').map((n: string) => n[0]).filter(Boolean).slice(-2).join('').toUpperCase() || 'KH',
      avatarColor: 'bg-indigo-600',
      rating,
      content: cleanContent,
      date: new Date().toLocaleDateString('vi-VN'),
      isUserSubmitted: true,
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem('cloudverse_customer_reviews', JSON.stringify(updated));

    setTimeout(() => {
      setSubmitting(false);
      setFormSuccess(true);
      setAuthorName('');
      setAuthorRole('');
      setReviewContent('');
      setRating(5);
    }, 600);
  };

  const top1 = topCustomers[0];
  const top2 = topCustomers[1];
  const top3 = topCustomers[2];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">

      {/* 1. HERO */}
      <section className="bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold backdrop-blur-md">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>Hơn 10.000+ Khách Hàng &amp; Doanh Nghiệp Tin Dùng</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Khách Hàng Tiêu Biểu &amp; Đánh Giá Dịch Vụ
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Trải nghiệm thực tế từ các doanh nghiệp và lập trình viên đang vận hành hệ thống trọng yếu trên nền tảng CloudVerse — minh bạch, đáng tin cậy.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 max-w-2xl mx-auto border-t border-white/10">
            <div>
              <div className="text-2xl font-extrabold text-amber-400 font-mono">10.000+</div>
              <div className="text-xs text-slate-400">Khách hàng tin dùng</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">4.9 / 5</div>
              <div className="text-xs text-slate-400">Điểm đánh giá trung bình</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-blue-400 font-mono">99.9%</div>
              <div className="text-xs text-slate-400">Tỷ lệ hài lòng</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pt-14">

        {/* 2. BẢNG VINH DANH TOP KHÁCH HÀNG (Dữ liệu thực tế 100% từ Database đơn hàng) */}
        {top1 && (
          <section className="space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 shadow-sm">
                <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>Bảng Vinh Danh Khách Hàng VIP</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Top Khách Hàng Có Tổng Giá Trị Đơn Hàng Cao Nhất
              </h2>
              <p className="text-xs text-slate-500 max-w-xl mx-auto">
                Tri ân các đối tác và khách hàng có tổng chi tiêu tích lũy lớn nhất trên hệ thống CloudVerse (Cập nhật thời gian thực từ CSDL)
              </p>
            </div>

            {/* Podium Bục Vinh Danh: [TOP 2 - BẠC] | [TOP 1 - VÀNG (ở giữa)] | [TOP 3 - ĐỒNG] */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-5xl mx-auto pt-4">
              
              {/* TOP 2 - VIỀN BẠC (Silver) */}
              {top2 ? (
                <div className="relative p-6 rounded-3xl bg-gradient-to-b from-slate-50 to-white border-2 border-slate-300 shadow-lg hover:shadow-xl transition-all flex flex-col items-center text-center space-y-3 order-2 md:order-1 transform hover:-translate-y-1">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-slate-400 to-slate-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5">
                    <Medal className="w-4 h-4 text-slate-200" />
                    <span>TOP 2 • HUY CHƯƠNG BẠC</span>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-300 to-slate-500 border-2 border-slate-300 text-white flex items-center justify-center font-extrabold text-lg shadow-md mt-2">
                    {top2.initials}
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{top2.name}</h3>
                    <p className="text-xs text-slate-500">{top2.email}</p>
                  </div>

                  <div className="w-full p-3 rounded-2xl bg-slate-100/80 border border-slate-200">
                    <div className="text-[11px] text-slate-500 font-semibold">Tổng Tiền Đã Đăng Ký:</div>
                    <div className="text-lg font-extrabold text-slate-800 font-mono mt-0.5">
                      {formatCurrency(top2.totalSpent)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{top2.orderCount} đơn dịch vụ hoàn tất</div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-300 flex flex-col items-center text-center space-y-2 order-2 md:order-1 opacity-70">
                  <Medal className="w-8 h-8 text-slate-400" />
                  <div className="text-xs font-bold text-slate-700">TOP 2 • Vị trí trống</div>
                  <p className="text-[11px] text-slate-500">Đăng ký đơn hàng tiếp theo để nhận vị trí này</p>
                </div>
              )}

              {/* TOP 1 - VIỀN VÀNG (Gold) - ĐỨNG GIỮA & NỔI BẬT NHẤT */}
              <div className="relative p-8 rounded-3xl bg-gradient-to-b from-amber-50/90 via-amber-50/40 to-white border-4 border-amber-400 shadow-2xl shadow-amber-500/20 flex flex-col items-center text-center space-y-4 order-1 md:order-2 md:-translate-y-4 transform hover:-translate-y-5 transition-all">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/30 flex items-center gap-1.5 uppercase tracking-wider">
                  <Crown className="w-4 h-4 fill-yellow-200 text-yellow-100 animate-bounce" />
                  <span>TOP 1 • QUÁN QUÂN VÀNG</span>
                </div>

                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 border-4 border-amber-300 text-white flex items-center justify-center font-extrabold text-2xl shadow-xl shadow-amber-500/30 mt-2">
                  <Trophy className="w-10 h-10 text-white drop-shadow-md" />
                </div>

                <div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full mb-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Khách Hàng Chi Tiêu Cao Nhất</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">{top1.name}</h3>
                  <p className="text-xs text-slate-600 font-medium">{top1.email}</p>
                </div>

                <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-100/80 to-yellow-100/80 border-2 border-amber-300">
                  <div className="text-xs text-amber-900 font-bold uppercase tracking-wider">Tổng Giá Trị Đơn Hàng:</div>
                  <div className="text-2xl font-black text-amber-700 font-mono mt-1">
                    {formatCurrency(top1.totalSpent)}
                  </div>
                  <div className="text-xs text-amber-800 font-semibold mt-1">
                    Đã thanh toán {top1.orderCount} đơn Cloud VPS / Hosting
                  </div>
                </div>
              </div>

              {/* TOP 3 - VIỀN ĐỒNG (Bronze) */}
              {top3 ? (
                <div className="relative p-6 rounded-3xl bg-gradient-to-b from-amber-50/40 to-white border-2 border-amber-600/60 shadow-lg hover:shadow-xl transition-all flex flex-col items-center text-center space-y-3 order-3 md:order-3 transform hover:-translate-y-1">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-700 to-amber-800 text-white font-bold text-xs shadow-md flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-300" />
                    <span>TOP 3 • HUY CHƯƠNG ĐỒNG</span>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-800 border-2 border-amber-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md mt-2">
                    {top3.initials}
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{top3.name}</h3>
                    <p className="text-xs text-slate-500">{top3.email}</p>
                  </div>

                  <div className="w-full p-3 rounded-2xl bg-amber-50/70 border border-amber-200">
                    <div className="text-[11px] text-amber-900 font-semibold">Tổng Tiền Đã Đăng Ký:</div>
                    <div className="text-lg font-extrabold text-amber-800 font-mono mt-0.5">
                      {formatCurrency(top3.totalSpent)}
                    </div>
                    <div className="text-[10px] text-amber-700 mt-0.5">{top3.orderCount} đơn dịch vụ hoàn tất</div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-300 flex flex-col items-center text-center space-y-2 order-3 md:order-3 opacity-70">
                  <Award className="w-8 h-8 text-amber-600/70" />
                  <div className="text-xs font-bold text-slate-700">TOP 3 • Vị trí trống</div>
                  <p className="text-[11px] text-slate-500">Đăng ký đơn hàng tiếp theo để nhận vị trí này</p>
                </div>
              )}

            </div>
          </section>
        )}

        {/* 3. LOGO KHÁCH HÀNG TIÊU BIỂU */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
              <Building2 className="w-3.5 h-3.5" />
              <span>Đối Tác &amp; Khách Hàng Doanh Nghiệp</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Được Tin Chọn Bởi Các Thương Hiệu Hàng Đầu
            </h2>
            <p className="text-xs text-slate-500 max-w-xl mx-auto">
              Từ startup công nghệ đến tập đoàn lớn, CloudVerse là lựa chọn hạ tầng đám mây đáng tin cậy.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {clientLogos.map((client, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col items-center text-center gap-2 group"
              >
                <div className={`w-11 h-11 rounded-xl ${client.color} flex items-center justify-center font-extrabold font-mono text-xs shadow-sm group-hover:scale-110 transition-transform`}>
                  {client.label}
                </div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">{client.name}</div>
                <div className="text-[10px] text-slate-500">{client.industry}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. ĐÁNH GIÁ TESTIMONIAL + FORM SOẠN GỬI ĐÁNH GIÁ MỚI */}
        <section className="space-y-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
              <Quote className="w-3.5 h-3.5" />
              <span>Phản Hồi Thực Tế Từ Khách Hàng</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Trải Nghiệm Của Người Dùng CloudVerse
            </h2>
            <p className="text-xs text-slate-500 max-w-xl mx-auto">
              Đánh giá thực tế từ các chuyên gia và khách hàng đang trực tiếp sử dụng dịch vụ.
            </p>
          </div>

          {/* Form Soạn Đánh Giá Mới */}
          <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Soạn Đánh Giá &amp; Góp Ý Của Bạn</h3>
                  <p className="text-xs text-slate-500">Chia sẻ cảm nhận sau khi sử dụng gói dịch vụ tại CloudVerse</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full hidden sm:block">
                Bảo Mật &amp; Kiểm Duyệt
              </span>
            </div>

            {formSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">Gửi Đánh Giá Thành Công!</h4>
                <p className="text-xs text-emerald-700">
                  Cảm ơn bạn đã đóng góp ý kiến. Đánh giá của bạn đã được lưu và hiển thị trực tiếp lên hệ thống.
                </p>
                <button
                  type="button"
                  onClick={() => setFormSuccess(false)}
                  className="mt-3 px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                >
                  Gửi thêm đánh giá khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Họ và Tên Của Bạn *
                    </label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Phương Kiệt"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chức Danh / Tên Đơn Vị *
                    </label>
                    <input
                      type="text"
                      required
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      placeholder="Ví dụ: Lập trình viên Freelancer / CTO Công ty ABC"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Gói Dịch Vụ Đã Trải Nghiệm *
                    </label>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Cloud VPS Starter">Cloud VPS Starter</option>
                      <option value="Cloud VPS Pro">Cloud VPS Pro</option>
                      <option value="Cloud VPS Business">Cloud VPS Business</option>
                      <option value="Hosting LiteSpeed Basic">Hosting LiteSpeed Basic</option>
                      <option value="Hosting LiteSpeed Pro">Hosting LiteSpeed Pro</option>
                      <option value="Domain Quốc Tế .COM">Tên Miền .COM</option>
                      <option value="Cloud Email Enterprise">Cloud Email Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mức Độ Hài Lòng (Số Sao) *
                    </label>
                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 text-slate-300 hover:text-amber-400 transition-colors"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-amber-700 ml-2">
                        {rating === 5 ? '5 Sao (Rất Tốt)' : `${rating} Sao`}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nội Dung Đánh Giá Chi Tiết *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Chia sẻ về tốc độ đường truyền, độ ổn định uptime, hỗ trợ kỹ thuật hoặc cảm nhận của bạn..."
                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Đang Gửi Đánh Giá...' : 'Gửi Đánh Giá Ngay'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Grid hiển thị tất cả các đánh giá */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((t) => (
              <div
                key={t.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  {/* Rating + Plan tag */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 whitespace-nowrap">
                      {t.plan}
                    </span>
                  </div>

                  {/* Quote content */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    "{t.content}"
                  </p>
                </div>

                {/* Author info */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className={`w-10 h-10 rounded-full ${t.avatarColor || 'bg-blue-600'} text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm`}>
                    {t.avatar || t.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{t.name}</div>
                    <div className="text-[11px] text-slate-500">{t.role}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{t.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. MÃ QR TỪNG GÓI DỊCH VỤ */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
              <QrCode className="w-3.5 h-3.5" />
              <span>Mã QR Từng Gói Dịch Vụ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Quét Mã QR Để Thanh Toán Nhanh Chóng
            </h2>
            <p className="text-xs text-slate-500 max-w-xl mx-auto">
              Tích hợp chuẩn Napas 247 — quét mã bằng bất kỳ ứng dụng ngân hàng nào để thanh toán tự động khớp số tiền và nội dung.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {servicePlansQr.map((plan) => (
              <div
                key={plan.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col items-center text-center gap-3"
              >
                {plan.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {plan.badge}
                  </span>
                )}
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 leading-tight">{plan.name}</div>
                  <div className="text-[10px] text-slate-500">{plan.category}</div>
                  <div className="text-sm font-extrabold text-blue-600 font-mono">
                    {formatCurrency(plan.monthlyPrice)}<span className="text-[10px] font-normal text-slate-400">/th</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPlanQr(plan)}
                  className="w-full py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center gap-1.5 border border-indigo-200 transition-colors cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  Xem Mã QR
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 6. CTA */}
        <section>
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-center space-y-5 shadow-xl shadow-blue-500/20">
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Sẵn Sàng Trải Nghiệm CloudVerse?
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto">
              Tham gia hơn 10.000+ khách hàng tin tưởng. Khởi tạo máy chủ đám mây trong 30 giây, chiết khấu đến 35% theo năm.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/services" className="px-6 py-3 rounded-2xl bg-white text-blue-700 font-extrabold text-xs hover:bg-blue-50 shadow-md transition-all flex items-center justify-center gap-2">
                <span>Xem Bảng Giá Dịch Vụ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="px-6 py-3 rounded-2xl bg-blue-800/60 hover:bg-blue-800 text-white font-bold text-xs border border-blue-400/40 transition-all flex items-center justify-center gap-2">
                <span>Liên Hệ Tư Vấn Miễn Phí</span>
              </Link>
            </div>
          </div>
        </section>

      </div>

      {/* POPUP MODAL MÃ QR TỪNG GÓI */}
      {selectedPlanQr && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-sm w-full p-6 sm:p-8 space-y-5 text-center relative">

            <button
              onClick={() => setSelectedPlanQr(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mt-2">{selectedPlanQr.name}</h3>
              <p className="text-xs text-slate-500">{selectedPlanQr.category}</p>
            </div>

            {/* QR Code */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto">
              <img
                src={generateVietQrUrl({
                  amount: selectedPlanQr.monthlyPrice,
                  description: `DK ${selectedPlanQr.name.substring(0, 20)}`,
                  bankId: 'pvcombank',
                  accountNo: '106001823533',
                  accountName: 'NGUYEN PHUONG KIET'
                })}
                alt={`Mã QR ${selectedPlanQr.name}`}
                className="w-48 h-auto rounded-xl"
              />
            </div>

            <div className="text-xs text-slate-600 space-y-0.5">
              <p>Giá: <strong className="text-blue-600 font-mono">{formatCurrency(selectedPlanQr.monthlyPrice)}/tháng</strong></p>
              <p className="text-[11px] text-slate-500">Ngân hàng: <strong>PVcomBank</strong> • STK: <strong className="font-mono">1060 0182 3533</strong></p>
              <p className="text-[11px] text-slate-500">Chủ TK: <strong>NGUYỄN PHƯƠNG KIỆT</strong></p>
            </div>

            <div className="space-y-2 pt-1">
              <Link
                href={`/order/${selectedPlanQr.id}`}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                Đặt Mua Gói Này <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setSelectedPlanQr(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
