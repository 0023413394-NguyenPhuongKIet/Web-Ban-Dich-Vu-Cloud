'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Headphones, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Tag, 
  Server, 
  Calendar, 
  CreditCard, 
  QrCode, 
  ChevronRight, 
  HelpCircle,
  Zap,
  Building,
  User,
  Info,
  Filter,
  Check
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { formatCurrency, generateVietQrUrl } from '@/lib/formatters';

interface ServicePlan {
  id: number;
  name: string;
  code?: string;
  serviceCategoryId?: number;
  categoryId?: number;
  categoryName?: string;
  monthlyPrice?: number;
  basePrice?: number;
  description?: string;
}

const fallbackPlans: ServicePlan[] = [
  { id: 1, name: 'Cloud VPS Starter', serviceCategoryId: 1, categoryName: 'VPS / Cloud Server', monthlyPrice: 99000, description: '1 vCPU Intel Xeon - 1GB RAM - 25GB NVMe U.2' },
  { id: 2, name: 'Cloud VPS Pro', serviceCategoryId: 1, categoryName: 'VPS / Cloud Server', monthlyPrice: 249000, description: '2 vCPU Intel Xeon - 4GB RAM - 60GB NVMe U.2' },
  { id: 3, name: 'Cloud VPS Business', serviceCategoryId: 1, categoryName: 'VPS / Cloud Server', monthlyPrice: 499000, description: '4 vCPU Intel Xeon - 8GB RAM - 120GB NVMe U.2' },
  { id: 4, name: 'Hosting LiteSpeed Basic', serviceCategoryId: 2, categoryName: 'Hosting / Web Hosting', monthlyPrice: 49000, description: '1 vCPU Share - 1GB RAM - 10GB NVMe - LSCache' },
  { id: 5, name: 'Hosting LiteSpeed Pro', serviceCategoryId: 2, categoryName: 'Hosting / Web Hosting', monthlyPrice: 99000, description: '2 vCPU Share - 2GB RAM - 30GB NVMe - Không giới hạn domain phụ' },
  { id: 6, name: 'Tên Miền Quốc Tế .COM', serviceCategoryId: 3, categoryName: 'Domain / Tên Miền', monthlyPrice: 24000, description: 'Đăng ký & duy trì tên miền .com, DNS Anycast, ẩn WHOIS' },
  { id: 7, name: 'Tên Miền Quốc Gia .VN', serviceCategoryId: 3, categoryName: 'Domain / Tên Miền', monthlyPrice: 45000, description: 'Tên miền bảo hộ thương hiệu Việt Nam, xác thực VNNIC' },
  { id: 1002, name: 'Cloud Email Enterprise', serviceCategoryId: 4, categoryName: 'Email / Email Server', monthlyPrice: 150000, description: 'Email theo tên miền riêng, chống Spam/Virus 99.9%, bảo mật SSL' },
];

const categoryFilterList = [
  { id: 'ALL', name: 'Tất Cả Dịch Vụ (8)' },
  { id: '1', name: 'VPS / Cloud Server' },
  { id: '2', name: 'Web Hosting LiteSpeed' },
  { id: '3', name: 'Tên Miền & SSL' },
  { id: '4', name: 'Email Doanh Nghiệp' },
];

export default function ContactPage() {
  const [plans, setPlans] = useState<ServicePlan[]>(fallbackPlans);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Form State
  const [selectedPlanId, setSelectedPlanId] = useState<number>(1);
  const [durationMode, setDurationMode] = useState<'month' | 'year'>('month');
  
  // Thời gian đăng ký:
  const [selectedMonthsOnly, setSelectedMonthsOnly] = useState<number>(1);
  const [selectedYears, setSelectedYears] = useState<number>(1);
  const [selectedExtraMonths, setSelectedExtraMonths] = useState<number>(0);

  // Tùy chọn phương thức thanh toán: 'installment' (theo định kỳ 3 tháng) hoặc 'full' (toàn bộ 100%)
  const [paymentOption, setPaymentOption] = useState<'installment' | 'full'>('installment');

  // Coupon / Promo
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponApplied, setCouponApplied] = useState<boolean>(false);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [note, setNote] = useState<string>('');

  // Inline validation state (hiển thị lỗi real-time khi nhập)
  const [nameError, setNameError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [noteError, setNoteError] = useState<string>('');

  const validateName = (v: string) => {
    const reg = /^[\p{L}\s]{2,80}$/u;
    if (!v.trim()) { setNameError('Vui lòng nhập họ và tên.'); return false; }
    if (!reg.test(v.trim())) { setNameError('Chỉ được nhập chữ cái (hỗ trợ tiếng Việt có dấu) và khoảng trắng, không chứa số hay ký tự đặc biệt.'); return false; }
    setNameError(''); return true;
  };
  const validatePhone = (v: string) => {
    const clean = v.replace(/\s+/g, '');
    const reg = /^0\d{9}$/;
    if (!clean) { setPhoneError('Vui lòng nhập số điện thoại.'); return false; }
    if (!/^\d+$/.test(clean)) { setPhoneError('Số điện thoại chỉ được nhập số, không chứa chữ hay ký tự đặc biệt.'); return false; }
    if (!reg.test(clean)) { setPhoneError('Phải đúng 10 chữ số và bắt đầu bằng số 0 (ví dụ: 0987654321).'); return false; }
    setPhoneError(''); return true;
  };
  const validateEmail = (v: string) => {
    const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(vn|com|edu|net|org|io|info|biz|gov|co|me|cloud|ai|[a-z]{2,})$/i;
    if (!v.trim()) { setEmailError('Vui lòng nhập địa chỉ email.'); return false; }
    if (!reg.test(v.trim())) { setEmailError('Email phải có @ kèm ký tự, dấu chấm và đuôi hợp lệ (.vn, .com, .edu,...).'); return false; }
    setEmailError(''); return true;
  };
  const validateNote = (v: string) => {
    const xss = /<[^>]*>|javascript:|onerror=|onload=|eval\(|<script|<iframe|<div|<img/i;
    if (v && xss.test(v)) { setNoteError('Ghi chú chứa thẻ HTML hoặc mã độc không an toàn. Chỉ nhập văn bản thuần túy.'); return false; }
    setNoteError(''); return true;
  };

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tải danh sách gói từ backend
  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await fetchApi<any>('/api/ServicePlans');
        let fetched: ServicePlan[] = [];
        if (res.data && Array.isArray(res.data.items)) {
          fetched = res.data.items;
        } else if (Array.isArray(res.data)) {
          fetched = res.data;
        }

        if (fetched.length > 0) {
          const valid = fetched.map(p => {
            const fb = fallbackPlans.find(f => f.id === p.id || f.name.toLowerCase() === p.name.toLowerCase());
            return {
              ...p,
              serviceCategoryId: p.serviceCategoryId || fb?.serviceCategoryId || 1,
              categoryName: p.categoryName || fb?.categoryName || 'Dịch Vụ Cloud',
              monthlyPrice: p.monthlyPrice || p.basePrice || fb?.monthlyPrice || 99000,
              description: p.description || fb?.description || ''
            };
          });

          const combinedMap = new Map();
          fallbackPlans.forEach(f => combinedMap.set(f.id, f));
          valid.forEach(v => combinedMap.set(v.id, v));

          const all8Plans = Array.from(combinedMap.values());
          setPlans(all8Plans);
          if (all8Plans[0]?.id) setSelectedPlanId(all8Plans[0].id);
        } else {
          setPlans(fallbackPlans);
        }
      } catch {
        setPlans(fallbackPlans);
      } finally {
        setLoadingPlans(false);
      }
    }
    loadPlans();

    // Điền thông tin nếu đã đăng nhập
    const savedUser = localStorage.getItem('username');
    if (savedUser) {
      setCustomerName(savedUser);
      setCustomerEmail(`${savedUser}@cloudverse.vn`);
    }
  }, []);

  // Lọc gói theo danh mục
  const filteredPlans = selectedCategoryFilter === 'ALL'
    ? plans
    : plans.filter(p => String(p.serviceCategoryId || p.categoryId) === selectedCategoryFilter);

  const currentPlan = plans.find(p => p.id === selectedPlanId) || plans[0] || fallbackPlans[0];
  const unitMonthlyPrice = currentPlan.monthlyPrice || 99000;

  // Tính tổng số tháng & tỷ lệ giảm giá theo quy tắc nghiệp vụ
  let totalMonths = 1;
  let discountPercent = 0;
  let discountBadge = '';

  if (durationMode === 'month') {
    totalMonths = selectedMonthsOnly;
    discountPercent = 0; // Dưới 1 năm tính giá chuẩn
  } else {
    totalMonths = (selectedYears * 12) + selectedExtraMonths;
    if (selectedYears === 1 || selectedYears === 2) {
      discountPercent = 20; // 1-2 năm giảm 20%
      discountBadge = 'Ưu Đãi Tiết Kiệm 20%';
    } else if (selectedYears === 3 || selectedYears === 4) {
      discountPercent = 25; // 3-4 năm giảm 25% (thêm 5%)
      discountBadge = 'Ưu Đãi Dài Hạn Tiết Kiệm 25% (+5%)';
    } else if (selectedYears >= 5) {
      discountPercent = 35; // 5 năm giảm 35% (thêm 15%)
      discountBadge = 'Ưu Đãi Doanh Nghiệp Tiết Kiệm 35% (+15%)';
    }
  }

  const rawTotal = unitMonthlyPrice * totalMonths;
  const durationDiscountAmount = Math.round((rawTotal * discountPercent) / 100);
  const priceAfterDurationDiscount = rawTotal - durationDiscountAmount;
  const finalCouponDiscountAmount = couponApplied ? Math.round((priceAfterDurationDiscount * couponDiscount) / 100) : 0;
  const finalTotal = Math.max(0, priceAfterDurationDiscount - finalCouponDiscountAmount);

  // Quy tắc chia kỳ thanh toán: từ 6 tháng trở lên có thể chọn chia mỗi kỳ 3 tháng hoặc thanh toán toàn bộ
  const isInstallmentEligible = totalMonths >= 6;
  const isPayingInstallment = isInstallmentEligible && paymentOption === 'installment';
  const totalInstallmentCycles = isPayingInstallment ? Math.ceil(totalMonths / 3) : 1;
  const firstPaymentAmount = isPayingInstallment 
    ? Math.round(finalTotal / totalInstallmentCycles) 
    : finalTotal;

  // Xử lý áp dụng mã khuyến mãi qua API Backend + Fallback thông minh
  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setErrorMessage(null);
    setCouponMessage(null);

    try {
      const res = await fetchApi<any>('/api/Promotions/apply', {
        method: 'POST',
        body: JSON.stringify({
          code: code,
          originalPrice: priceAfterDurationDiscount,
          servicePlanId: currentPlan.id
        })
      });

      if (res.data && (res.data.isSuccess || res.data.success)) {
        const percent = res.data.discountPercent || (code === 'CLOUD50' ? 50 : 20);
        setCouponDiscount(percent);
        setCouponApplied(true);
        setCouponMessage(`✓ Áp dụng mã ${code} thành công! Giảm thêm ${percent}%.`);
      } else {
        // Fallback kiểm tra các mã coupon tiêu chuẩn trong hệ thống
        if (code === 'WELCOME2026' || code === 'CLOUD2026') {
          setCouponDiscount(20);
          setCouponApplied(true);
          setCouponMessage(`✓ Áp dụng mã ${code} thành công! Giảm thêm 20%.`);
        } else if (code === 'CLOUD50') {
          setCouponDiscount(50);
          setCouponApplied(true);
          setCouponMessage(`✓ Áp dụng mã ${code} thành công! Giảm thêm 50%.`);
        } else if (code === 'CLOUD10') {
          setCouponDiscount(10);
          setCouponApplied(true);
          setCouponMessage(`✓ Áp dụng mã ${code} thành công! Giảm thêm 10%.`);
        } else if (code === 'EXPIRED10' || code.includes('EXPIRED')) {
          setCouponApplied(false);
          setCouponDiscount(0);
          setErrorMessage('Mã khuyến mãi EXPIRED10 đã hết hạn sử dụng và không thể áp dụng.');
        } else {
          setCouponApplied(false);
          setCouponDiscount(0);
          setErrorMessage(res.error || res.data?.message || `Mã khuyến mãi '${code}' không hợp lệ hoặc đã hết hạn.`);
        }
      }
    } catch {
      if (code === 'WELCOME2026' || code === 'CLOUD2026') {
        setCouponDiscount(20);
        setCouponApplied(true);
        setCouponMessage(`✓ Áp dụng mã ${code} thành công! Giảm thêm 20%.`);
      } else if (code === 'CLOUD50') {
        setCouponDiscount(50);
        setCouponApplied(true);
        setCouponMessage(`✓ Áp dụng mã ${code} thành công! Giảm thêm 50%.`);
      } else if (code === 'EXPIRED10') {
        setCouponApplied(false);
        setCouponDiscount(0);
        setErrorMessage('Mã khuyến mãi EXPIRED10 đã hết hạn sử dụng.');
      } else {
        setCouponApplied(false);
        setCouponDiscount(0);
        setErrorMessage('Mã khuyến mãi không hợp lệ hoặc đã hết hạn.');
      }
    }
  };

  // Submit đặt dịch vụ / gửi yêu cầu
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validation Họ và Tên: Chỉ cho phép chữ cái (hỗ trợ tiếng Việt có dấu) và khoảng trắng, tối thiểu 2 ký tự
    const nameClean = customerName.trim();
    const nameRegex = /^[\p{L}\s]{2,80}$/u;
    if (!nameRegex.test(nameClean)) {
      setErrorMessage('Họ và tên chỉ được chứa chữ cái (hỗ trợ tiếng Việt có dấu) và khoảng trắng (từ 2 đến 80 ký tự, không chứa số hay ký tự đặc biệt).');
      return;
    }

    // 2. Validation Số điện thoại: Đúng 10 chữ số bắt đầu bằng số 0
    const phoneClean = customerPhone.replace(/\s+/g, '');
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phoneClean)) {
      setErrorMessage('Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0 (ví dụ: 0987654321).');
      return;
    }

    // 3. Validation Email: Bắt buộc đúng chuẩn có @ kèm ký tự, dấu chấm và đuôi tên miền (vn, com, edu, net, org,...)
    const emailClean = customerEmail.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(vn|com|edu|net|org|io|info|biz|gov|co|me|cloud|ai|[a-z]{2,})$/i;
    if (!emailRegex.test(emailClean)) {
      setErrorMessage('Email không hợp lệ! Vui lòng nhập đúng định dạng (ví dụ: name@company.vn, phuongkiet@gmail.com có chứa @, tên miền và đuôi .vn, .com, .edu,...).');
      return;
    }

    // 4. Bẫy lỗi chống chèn mã độc HTML/Script/XSS trong Ghi chú & Tên công ty
    const xssPattern = /<[^>]*>|javascript:|onerror=|onload=|eval\(|<script|<iframe|<div|<img/i;
    if (note && xssPattern.test(note)) {
      setErrorMessage('Nội dung ghi chú chứa ký tự hoặc thẻ HTML không an toàn (ví dụ: <...>, script, thẻ html). Vui lòng chỉ nhập văn bản thuần túy.');
      return;
    }
    if (companyName && xssPattern.test(companyName)) {
      setErrorMessage('Tên công ty chứa ký tự không an toàn. Vui lòng chỉ nhập tên doanh nghiệp thuần túy.');
      return;
    }

    setSubmitting(true);

    const billingLabel = durationMode === 'month' 
      ? `${selectedMonthsOnly} Tháng` 
      : `${selectedYears} Năm ${selectedExtraMonths > 0 ? `+ ${selectedExtraMonths} Tháng` : ''} (-${discountPercent}%)`;

    const paymentTypeLabel = isPayingInstallment 
      ? `[Trả góp định kỳ 3 tháng/lần - Đợt 1: ${formatCurrency(firstPaymentAmount)}]` 
      : '[Thanh toán toàn bộ 100%]';

    const payload = {
      servicePlanId: currentPlan.id,
      customerName: nameClean,
      customerEmail: emailClean,
      customerPhone: phoneClean,
      companyName: companyName.trim(),
      billingCycle: billingLabel,
      totalAmount: finalTotal,
      note: `[ĐẶT TỪ TRANG LIÊN HỆ] ${paymentTypeLabel} Thời gian: ${totalMonths} tháng. Ghi chú: ${note.trim()}`,
    };

    try {
      const res = await fetchApi<any>('/api/Orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.error) {
        setErrorMessage(res.error);
      } else {
        const orderData = res.data || {
          orderCode: `ORD-${Date.now().toString().slice(-6)}`,
          id: Math.floor(Math.random() * 1000) + 100,
        };

        // Luôn dùng orderCode & id từ backend để dedup chính xác khi my-orders load lại
        const backendId = orderData.id || Date.now();
        const backendOrderCode = orderData.orderCode || `ORD-${Date.now().toString().slice(-6)}`;

        const newCreatedOrder = {
          id: backendId,
          orderCode: backendOrderCode,
          username: localStorage.getItem('username') || nameClean,
          customerName: nameClean,
          customerEmail: emailClean,
          customerPhone: phoneClean,
          companyName: companyName.trim(),
          servicePlanName: currentPlan.name,
          billingCycle: billingLabel,
          totalAmount: finalTotal,
          originalTotalAmount: finalTotal,
          remainingAmount: isPayingInstallment ? (finalTotal - firstPaymentAmount) : 0,
          paidCycles: isPayingInstallment ? 1 : totalInstallmentCycles,
          totalInstallmentCycles,
          cycleAmount: firstPaymentAmount,
          isPayingInstallment,
          status: 'Pending',
          createdAt: new Date().toISOString(),
          note: `[ĐẶT TỪ TRANG LIÊN HỆ] ${paymentTypeLabel} Thời gian: ${totalMonths} tháng. Ghi chú: ${note.trim()}`,
        };

        // Lưu đơn mới vào user_created_orders (dùng đúng orderCode của backend để tránh trùng lặp khi dedup)
        try {
          const existingOrders: any[] = JSON.parse(localStorage.getItem('user_created_orders') || '[]');
          // Không thêm nếu đã có đơn cùng orderCode hoặc cùng id
          const alreadyExists = existingOrders.some(o => 
            o.orderCode === backendOrderCode || String(o.id) === String(backendId)
          );
          if (!alreadyExists) {
            existingOrders.unshift(newCreatedOrder);
            localStorage.setItem('user_created_orders', JSON.stringify(existingOrders));
          }
        } catch {
          // ignore
        }

        setOrderSuccess({
          ...orderData,
          totalAmount: finalTotal,
          firstPaymentAmount,
          totalInstallmentCycles,
          isPayingInstallment,
          totalMonths,
          planName: currentPlan.name,
          customerName,
          customerEmail,
          customerPhone,
        });
      }
    } catch {
      setErrorMessage('Không thể gửi đơn hàng đến máy chủ. Vui lòng kiểm tra lại kết nối!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      
      {/* 1. Header Banner */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-900 border-b border-slate-800 text-white">
        {/* Background Image Container */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transform scale-105"
          style={{ 
            backgroundImage: "url('/images/contact-banner.webp')",
            backgroundPosition: 'center 40%'
          }}
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-blue-950/80 backdrop-blur-[0.5px]" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-4 backdrop-blur-md">
            <Headphones className="w-4 h-4 text-blue-400" />
            <span>Hỗ Trợ Kỹ Thuật 24/7 & Tư Vấn Giải Pháp Đám Mây</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Liên Hệ & Đặt Dịch Vụ Trực Tuyến
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto mt-4 leading-relaxed font-normal">
            Chọn cấu hình, tùy biến thời gian thuê linh hoạt theo tháng hoặc năm với chiết khấu lên đến <strong>35%</strong>.
          </p>
        </div>
      </section>

      {/* 2. Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CỘT TRÁI (5/12): THÔNG TIN LIÊN HỆ & TRUNG TÂM HỖ TRỢ */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Card 1: Kênh hỗ trợ trực tiếp */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                <span>Kênh Liên Hệ & Hotline 24/7</span>
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50/60 border border-blue-100">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-900 uppercase">Tổng Đài Tư Vấn & Kỹ Thuật</div>
                    <div className="text-base font-extrabold text-blue-700 font-mono mt-0.5">1900 6868</div>
                    <div className="text-xs text-slate-500">Hotline 24/7: 0987 654 321</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 uppercase">Hộp Thư Điện Tử</div>
                    <div className="text-xs font-medium text-slate-600 mt-1">Tư vấn bán hàng: <strong className="text-slate-900 font-mono">sales@cloudverse.vn</strong></div>
                    <div className="text-xs font-medium text-slate-600 mt-0.5">Hỗ trợ kỹ thuật: <strong className="text-slate-900 font-mono">support@cloudverse.vn</strong></div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 uppercase">Trụ Sở & Văn Phòng</div>
                    <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Tòa nhà CloudVerse, Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Cam kết SLA & Trung tâm dữ liệu */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Cam Kết Chất Lượng Dịch Vụ
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-100 flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-slate-800">Uptime 99.99%</div>
                    <div className="text-[11px] text-slate-500">Cam kết SLA</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-slate-800">Phản hồi 15p</div>
                    <div className="text-[11px] text-slate-500">Xử lý ticket 24/7</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                <div className="font-semibold text-slate-700">📍 Cụm Máy Chủ Data Center Tiêu Chuẩn Tier III:</div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                  <li>Data Center Viettel IDC (Hòa Lạc & Tân Bình)</li>
                  <li>Data Center VNPT IDC (Nam Thăng Long & Tân Thuận)</li>
                </ul>
              </div>
            </div>

            {/* Card 3: Chính sách thanh toán chu kỳ định kỳ */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-indigo-900">
                <Info className="w-4 h-4 text-indigo-600" />
                <span>Chính Sách Thanh Toán Trả Góp Định Kỳ</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Đối với các đơn hàng đăng ký từ <strong>6 tháng trở lên</strong>, bạn có thể chọn thanh toán <strong>chia nhỏ 3 tháng/lần</strong> hoặc <strong>thanh toán toàn bộ 100%</strong> tùy nhu cầu.
              </p>
              <ul className="space-y-1 text-slate-600 pt-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Đợt 1: Thanh toán trước 3 tháng đầu khi tạo đơn.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Hệ thống tự động gửi Email & Thông báo trên web khi gần đến kỳ kế tiếp.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* CỘT PHẢI (7/12): FORM ĐẶT DỊCH VỤ & TÙY BIẾN CHU KỲ */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <h2 className="text-xl font-bold text-slate-900">Form Đăng Ký & Đặt Gói Dịch Vụ</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Chọn gói cấu hình mong muốn và thời gian sử dụng để nhận chiết khấu tối đa.
                </p>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. CHỌN GÓI DỊCH VỤ KÈM BỘ LỌC DANH MỤC */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      1. Gói Dịch Vụ Cần Đăng Ký * ({plans.length} Dịch Vụ Khả Dụng)
                    </label>
                    
                    {/* BỘ LỌC DANH MỤC */}
                    <div className="flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-blue-600" />
                      <select
                        value={selectedCategoryFilter}
                        onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                        aria-label="Lọc theo danh mục dịch vụ"
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 border border-slate-200 text-slate-800 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        {categoryFilterList.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* GRID 8 GÓI DỊCH VỤ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1">
                    {filteredPlans.map((p) => {
                      const isSelected = p.id === selectedPlanId;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPlanId(p.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{p.name}</span>
                            <span className="text-xs font-extrabold text-blue-600 font-mono">
                              {formatCurrency(p.monthlyPrice || 99000)}/th
                            </span>
                          </div>
                          {p.description && (
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                              {p.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. CHỌN CHU KỲ (SỐ THÁNG / SỐ NĂM + THÁNG LẺ) KÈM GỢI Ý CHIẾT KHẤU */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      2. Thời Gian Đăng Ký & Bậc Khuyến Mãi *
                    </label>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setDurationMode('month')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                          durationMode === 'month'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Theo Tháng (1-11 th)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDurationMode('year')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                          durationMode === 'year'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>Theo Năm (Ưu Đãi Tới -35%)</span>
                      </button>
                    </div>
                  </div>

                  {/* Mode: Theo Tháng (1 đến 11 tháng) */}
                  {durationMode === 'month' && (
                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                        <span>Chọn số tháng đăng ký:</span>
                        <strong className="text-blue-600 font-mono text-sm font-bold">{selectedMonthsOnly} Tháng</strong>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setSelectedMonthsOnly(m)}
                            className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                              selectedMonthsOnly === m
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {m} Th
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mode: Theo Năm (1 đến 5 năm) + CÓ THỂ CHỌN THÊM SỐ THÁNG LẺ */}
                  {durationMode === 'year' && (
                    <div className="space-y-3 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 p-4 rounded-xl border border-blue-100">
                      
                      {/* BẬC CHỌN SỐ NĂM */}
                      <div className="text-xs font-semibold text-slate-700">
                        1. Chọn số năm thuê để nhận mức chiết khấu tối đa:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        
                        {/* 1 Năm: Giảm 20% */}
                        <div
                          onClick={() => setSelectedYears(1)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                            selectedYears === 1
                              ? 'bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                              : 'bg-white/80 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">1 Năm (12 th)</span>
                              <span className="badge-pill bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">-20%</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">Tiết kiệm 20% chi phí</p>
                          </div>
                        </div>

                        {/* 3 Năm: Giảm 25% */}
                        <div
                          onClick={() => setSelectedYears(3)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                            selectedYears === 3
                              ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm'
                              : 'bg-white/80 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">3 Năm (36 th)</span>
                              <span className="badge-pill bg-indigo-100 text-indigo-800 text-[10px] font-extrabold">-25%</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">Thêm +5% so với 1 năm</p>
                          </div>
                        </div>

                        {/* 5 Năm: Giảm 35% */}
                        <div
                          onClick={() => setSelectedYears(5)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                            selectedYears === 5
                              ? 'bg-white border-amber-600 ring-2 ring-amber-500/20 shadow-sm'
                              : 'bg-white/80 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">5 Năm (60 th)</span>
                              <span className="badge-pill bg-amber-100 text-amber-800 text-[10px] font-extrabold">-35%</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">Thêm +15% so với 1 năm</p>
                          </div>
                        </div>

                      </div>

                      {/* CHỌN THÊM SỐ THÁNG LẺ KÈM THEO NĂM (VD: 1 NĂM 6 THÁNG) */}
                      <div className="pt-2 border-t border-blue-200/60">
                        <div className="flex items-center justify-between text-xs text-slate-700 mb-1.5">
                          <span className="font-semibold">2. Cộng thêm số tháng lẻ (Tùy chọn):</span>
                          <span className="font-mono font-bold text-blue-600">
                            {selectedYears} Năm {selectedExtraMonths > 0 ? `+ ${selectedExtraMonths} Tháng (Tổng ${totalMonths} tháng)` : `(${totalMonths} tháng)`}
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {[0, 3, 6, 9, 11].map((extra) => (
                            <button
                              key={extra}
                              type="button"
                              onClick={() => setSelectedExtraMonths(extra)}
                              className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                selectedExtraMonths === extra
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {extra === 0 ? '+ 0 tháng' : `+ ${extra} tháng`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Thông báo chiết khấu đang chọn */}
                      <div className="text-xs text-indigo-700 font-semibold flex items-center gap-1.5 pt-1">
                        <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span>Đã áp dụng: <strong>{discountBadge}</strong>.</span>
                      </div>
                    </div>
                  )}

                  {/* 2.1 TÙY CHỌN THANH TOÁN: ĐỊNH KỲ HOẶC TOÀN BỘ (CHO ĐƠN TỪ 6 THÁNG TRỞ LÊN) */}
                  {isInstallmentEligible && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                      <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Phương Thức Thanh Toán (Gói từ 6 tháng trở lên)
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        
                        {/* Option 1: Thanh toán theo định kỳ 3 tháng */}
                        <div
                          onClick={() => setPaymentOption('installment')}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                            paymentOption === 'installment'
                              ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center flex-shrink-0 ${
                            paymentOption === 'installment' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                          }`}>
                            {paymentOption === 'installment' && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">Trả Góp Định Kỳ (3 tháng/lần)</div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Đợt 1 chỉ đóng: <strong className="text-blue-600 font-mono">{formatCurrency(Math.round(finalTotal / Math.ceil(totalMonths / 3)))}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Option 2: Thanh toán toàn bộ 100% */}
                        <div
                          onClick={() => setPaymentOption('full')}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                            paymentOption === 'full'
                              ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center flex-shrink-0 ${
                            paymentOption === 'full' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                          }`}>
                            {paymentOption === 'full' && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">Thanh Toán Toàn Bộ (100%)</div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Tổng cộng: <strong className="text-emerald-600 font-mono">{formatCurrency(finalTotal)}</strong>
                            </p>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                </div>

                {/* 3. THÔNG TIN KHÁCH HÀNG */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    3. Thông Tin Liên Hệ &amp; Kích Hoạt *
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Họ và Tên *</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => { setCustomerName(e.target.value); validateName(e.target.value); }}
                          onBlur={(e) => validateName(e.target.value)}
                          placeholder="Nguyễn Văn A"
                          className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 ${nameError ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/40' : customerName && !nameError ? 'border-emerald-400 focus:ring-emerald-500' : 'border-slate-200 focus:ring-blue-500'}`}
                        />
                      </div>
                      {nameError && <p className="text-[11px] text-rose-600 mt-1">⚠ {nameError}</p>}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Số Điện Thoại *</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^\d\s]/g, '');
                            setCustomerPhone(val);
                            validatePhone(val);
                          }}
                          onBlur={(e) => validatePhone(e.target.value)}
                          placeholder="0987 654 321"
                          className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 ${phoneError ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/40' : customerPhone && !phoneError ? 'border-emerald-400 focus:ring-emerald-500' : 'border-slate-200 focus:ring-blue-500'}`}
                        />
                      </div>
                      {phoneError && <p className="text-[11px] text-rose-600 mt-1">⚠ {phoneError}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email Nhận Hóa Đơn &amp; Kỳ Hạn *</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={customerEmail}
                          onChange={(e) => { setCustomerEmail(e.target.value); validateEmail(e.target.value); }}
                          onBlur={(e) => validateEmail(e.target.value)}
                          placeholder="email@company.vn"
                          className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 ${emailError ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/40' : customerEmail && !emailError ? 'border-emerald-400 focus:ring-emerald-500' : 'border-slate-200 focus:ring-blue-500'}`}
                        />
                      </div>
                      {emailError && <p className="text-[11px] text-rose-600 mt-1">⚠ {emailError}</p>}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tên Công Ty / Tổ Chức (Tùy chọn)</label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Công ty TNHH Giải Pháp Đám Mây"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ghi Chú Kỹ Thuật / Yêu Cầu Tùy Biến Cấu Hình</label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => { setNote(e.target.value); validateNote(e.target.value); }}
                      placeholder="Cài sẵn hệ điều hành Ubuntu 24.04, cấu hình Web Server Nginx hoặc cài đặt cơ sở dữ liệu riêng..."
                      className={`w-full p-3 text-xs rounded-xl border focus:outline-none focus:ring-2 resize-none ${noteError ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/40' : 'border-slate-200 focus:ring-blue-500'}`}
                    />
                    {noteError && <p className="text-[11px] text-rose-600 mt-1">⚠ {noteError}</p>}
                  </div>

                </div>

                {/* 4. MÃ GIẢM GIÁ */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    4. Mã Khuyến Mãi (Nếu có)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Nhập mã voucher (VD: WELCOME2026, CLOUD50)"
                        className="w-full pl-9 pr-3 py-2 text-xs font-mono uppercase rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Áp Dụng
                    </button>
                  </div>
                  {couponMessage && (
                    <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{couponMessage}</span>
                    </p>
                  )}
                </div>

                {/* 5. LIVE PRICE PREVIEW BOX */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Bảng Tính Chi Phí Trực Tuyến
                  </div>

                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Gói dịch vụ:</span>
                    <span className="font-semibold text-slate-900">{currentPlan.name} ({formatCurrency(unitMonthlyPrice)}/tháng)</span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Thời gian đăng ký:</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {durationMode === 'month' 
                        ? `${selectedMonthsOnly} Tháng` 
                        : `${selectedYears} Năm ${selectedExtraMonths > 0 ? `+ ${selectedExtraMonths} Tháng` : ''} (Tổng ${totalMonths} Tháng)`}
                    </span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                      <span>Ưu đãi thời gian ({discountBadge}):</span>
                      <span>-{formatCurrency(durationDiscountAmount)} (-{discountPercent}%)</span>
                    </div>
                  )}

                  {couponApplied && (
                    <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                      <span>Voucher giảm giá ({couponCode}):</span>
                      <span>-{formatCurrency(finalCouponDiscountAmount)} (-{couponDiscount}%)</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Tổng Giá Trị Gói:</div>
                      {isPayingInstallment ? (
                        <div className="text-[11px] text-indigo-600 font-semibold">
                          Chia {totalInstallmentCycles} đợt (mỗi 3 tháng)
                        </div>
                      ) : (
                        <div className="text-[11px] text-emerald-600 font-semibold">
                          Thanh toán toàn bộ 100%
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-extrabold text-blue-600 font-mono">
                        {formatCurrency(finalTotal)}
                      </div>
                      {isPayingInstallment && (
                        <div className="text-xs text-emerald-600 font-bold font-mono">
                          👉 Đợt 1 thanh toán: {formatCurrency(firstPaymentAmount)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white text-sm font-extrabold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Đang xử lý tạo đơn hàng...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Xác Nhận Đăng Ký & Gửi Yêu Cầu</span>
                    </>
                  )}
                </button>

              </form>

            </div>
          </div>

        </div>
      </div>

      {/* MODAL ĐẶT HÀNG THÀNH CÔNG KÈM MÃ QR VIETQR */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-100 shadow-2xl space-y-6">
            
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Đăng Ký Dịch Vụ Thành Công!
              </h3>
              <p className="text-xs text-slate-500">
                Mã đơn hàng: <strong className="text-blue-600 font-mono text-sm">{orderSuccess.orderCode || `#${orderSuccess.id}`}</strong>
              </p>
            </div>

            {/* Thông tin thanh toán & QR VietQR */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="text-xs font-semibold text-slate-600">
                {orderSuccess.isPayingInstallment && orderSuccess.totalInstallmentCycles > 1 ? (
                  <span>Thanh toán Đợt 1 (3 tháng đầu): <strong className="text-blue-600 font-mono text-sm font-bold">{formatCurrency(orderSuccess.firstPaymentAmount)}</strong></span>
                ) : (
                  <span>Tổng tiền thanh toán: <strong className="text-blue-600 font-mono text-sm font-bold">{formatCurrency(orderSuccess.totalAmount)}</strong></span>
                )}
              </div>

              {/* VietQR Image */}
              <div className="p-2 bg-white rounded-xl border border-slate-200 inline-block shadow-sm">
                <img
                  src={generateVietQrUrl({
                    amount: orderSuccess.firstPaymentAmount || orderSuccess.totalAmount,
                    description: `DK ${orderSuccess.orderCode || orderSuccess.id}`,
                    bankId: 'pvcombank',
                    accountNo: '106001823533',
                    accountName: 'NGUYEN PHUONG KIET'
                  })}
                  alt="VietQR Thanh Toán"
                  className="w-48 h-auto mx-auto rounded-lg"
                />
              </div>

              <div className="text-[11px] text-slate-500 font-medium">
                Ngân hàng: <strong>PVcomBank</strong> • STK: <strong className="font-mono text-slate-800">1060 0182 3533</strong><br />
                Chủ tài khoản: <strong>NGUYỄN PHƯƠNG KIỆT</strong>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                href="/my-orders"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center transition-colors shadow-sm"
              >
                Xem Đơn Hàng Của Tôi
              </Link>
              <button
                type="button"
                onClick={() => setOrderSuccess(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
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
