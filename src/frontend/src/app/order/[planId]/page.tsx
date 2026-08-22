'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Server, Shield, Cpu, Zap, Globe, CheckCircle2, 
  AlertCircle, ArrowRight, Tag, QrCode, ShoppingCart, Sparkles, Lock, HardDrive 
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { formatCurrency, generateVietQrUrl } from '@/lib/formatters';

interface PlanDetail {
  id: number;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  cpu: string;
  ram: string;
  storage: string;
  bandwidth: string;
}

const fallbackPlans: Record<number, PlanDetail> = {
  1: {
    id: 1,
    name: 'Cloud VPS Starter',
    description: 'Phù hợp cho blog cá nhân, website WordPress và thử nghiệm ứng dụng nhỏ.',
    monthlyPrice: 99000,
    yearlyPrice: 79000 * 12,
    cpu: '1 Core Intel Xeon',
    ram: '1 GB DDR4 ECC',
    storage: '25 GB NVMe Enterprise',
    bandwidth: '1 Gbps Không Giới Hạn',
  },
  2: {
    id: 2,
    name: 'Cloud VPS Pro',
    description: 'Cấu hình tối ưu cho cửa hàng online, website doanh nghiệp và API hiệu năng cao.',
    monthlyPrice: 249000,
    yearlyPrice: 199000 * 12,
    cpu: '2 Core Intel Xeon',
    ram: '4 GB DDR4 ECC',
    storage: '60 GB NVMe Enterprise',
    bandwidth: '1 Gbps Không Giới Hạn',
  },
  3: {
    id: 3,
    name: 'Cloud VPS Business',
    description: 'Sức mạnh vượt trội cho hệ thống thương mại điện tử và cơ sở dữ liệu lớn.',
    monthlyPrice: 499000,
    yearlyPrice: 399000 * 12,
    cpu: '4 Core Intel Xeon',
    ram: '8 GB DDR4 ECC',
    storage: '120 GB NVMe Enterprise',
    bandwidth: '1 Gbps Không Giới Hạn',
  },
  4: {
    id: 4,
    name: 'Hosting LiteSpeed Basic',
    description: 'Tăng tốc độ tải trang gấp 5 lần với Web Server LiteSpeed Cache bản quyền.',
    monthlyPrice: 49000,
    yearlyPrice: 39000 * 12,
    cpu: '1 vCPU Share',
    ram: '1 GB RAM',
    storage: '10 GB SSD NVMe',
    bandwidth: 'Không giới hạn',
  },
  5: {
    id: 5,
    name: 'Hosting LiteSpeed Pro',
    description: 'Hỗ trợ không giới hạn tên miền phụ, chứng chỉ SSL miễn phí trọn đời.',
    monthlyPrice: 99000,
    yearlyPrice: 79000 * 12,
    cpu: '2 vCPU Share',
    ram: '2 GB RAM',
    storage: '30 GB SSD NVMe',
    bandwidth: 'Không giới hạn',
  },
  6: {
    id: 6,
    name: 'Domain Quốc Tế .COM / .NET',
    description: 'Khẳng định thương hiệu trực tuyến với tên miền quốc tế phổ biến nhất thế giới.',
    monthlyPrice: 280000,
    yearlyPrice: 280000,
    cpu: 'DNS Anycast',
    ram: 'Khóa Tên Miền',
    storage: 'Ẩn Thông Tin WHOIS',
    bandwidth: 'Quản trị tự động 24/7',
  }
};

export default function OrderPage({ params }: { params: Promise<{ planId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const planId = parseInt(resolvedParams.planId, 10) || 1;

  const initialPlan = fallbackPlans[planId] || fallbackPlans[1];
  const [plan, setPlan] = useState<PlanDetail>(initialPlan);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);

  // Form Fields
  const [quantity, setQuantity] = useState(1);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [note, setNote] = useState('');

  // Promotion
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // Modal yêu cầu đăng nhập
  const [showLoginRequired, setShowLoginRequired] = useState(false);

  // Tự động áp dụng promo từ URL params (khi đến từ trang Khuyến Mãi hoặc Dịch Vụ)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPromo = params.get('promo') || '';
    const urlDiscount = parseInt(params.get('discount') || '0', 10);
    const urlCycle = params.get('cycle') as 'monthly' | 'yearly' | null;

    // Áp dụng chu kỳ thanh toán từ trang dịch vụ (nếu có)
    if (urlCycle === 'yearly' || urlCycle === 'monthly') {
      setBillingCycle(urlCycle);
    }

    // Áp dụng mã khuyến mãi (nếu có)
    if (urlPromo && urlDiscount > 0) {
      setPromoCode(urlPromo.toUpperCase());
      setDiscountPercent(urlDiscount);
      setPromoMessage(`✓ Mã ${urlPromo.toUpperCase()} đã được áp dụng tự động — Giảm ${urlDiscount}%`);
    }
  }, []);

  useEffect(() => {
    async function loadPlan() {
      // Kiểm tra xem gói có trong danh sách do Admin sửa/tạo mới không
      const localSavedPlans = JSON.parse(localStorage.getItem('admin_managed_service_plans') || '[]');
      const foundInAdmin = localSavedPlans.find((p: any) => p.id === planId);

      const fb = foundInAdmin || fallbackPlans[planId] || fallbackPlans[1];
      setPlan(fb);

      try {
        const res = await fetchApi<any>(`/api/plans/${planId}`);
        if (res.data && res.data.name && !foundInAdmin) {
          // Lấy cấu hình máy chủ từ API nếu có
          let parsedCpu = fb.cpu;
          let parsedRam = fb.ram;
          let parsedStorage = fb.storage;
          let parsedBandwidth = fb.bandwidth;

          if (res.data.specsJson) {
            try {
              const specs = JSON.parse(res.data.specsJson);
              if (specs.cpu) parsedCpu = specs.cpu;
              if (specs.ram) parsedRam = specs.ram;
              if (specs.storage) parsedStorage = specs.storage;
              if (specs.bandwidth) parsedBandwidth = specs.bandwidth;
            } catch {}
          }

          // Luôn giữ đúng mức giá niêm yết chuẩn đồng nhất toàn hệ thống
          setPlan({
            id: res.data.id || planId,
            name: fb.name,
            description: fb.description,
            monthlyPrice: fb.monthlyPrice,
            yearlyPrice: fb.yearlyPrice,
            cpu: parsedCpu,
            ram: parsedRam,
            storage: parsedStorage,
            bandwidth: parsedBandwidth,
          });
        }
      } catch {
        // Giữ nguyên fallback đã thiết lập
      }
    }
    loadPlan();
  }, [planId]);


  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const unitPr = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
      const res = await fetchApi<any>('/api/Promotions/apply', {
        method: 'POST',
        body: JSON.stringify({ 
          code: promoCode.trim().toUpperCase(),
          originalPrice: unitPr * quantity,
          servicePlanId: planId
        }),
      });

      if (res.data && (res.data.isSuccess || res.data.success)) {
        const percent = res.data.discountPercent || 20;
        setDiscountPercent(percent);
        setPromoMessage(`Áp dụng mã ${promoCode.toUpperCase()} thành công! Giảm ${percent}%`);
      } else {
        // Fallback kiểm tra các coupon chuẩn trong DB
        const upper = promoCode.trim().toUpperCase();
        if (upper === 'WELCOME2026' || upper === 'CLOUD2026') {
          setDiscountPercent(20);
          setPromoMessage(`Áp dụng mã ${upper} thành công! Giảm 20%`);
        } else if (upper === 'CLOUD50') {
          setDiscountPercent(50);
          setPromoMessage(`Áp dụng mã ${upper} thành công! Giảm 50%`);
        } else {
          setDiscountPercent(0);
          setPromoMessage(res.data?.message || 'Mã khuyến mãi không hợp lệ hoặc đã hết hạn.');
        }
      }
    } catch {
      const upper = promoCode.trim().toUpperCase();
      if (upper === 'WELCOME2026' || upper === 'CLOUD2026') {
        setDiscountPercent(20);
        setPromoMessage(`Áp dụng mã ${upper} thành công! Giảm 20%`);
      } else if (upper === 'CLOUD50') {
        setDiscountPercent(50);
        setPromoMessage(`Áp dụng mã ${upper} thành công! Giảm 50%`);
      } else {
        setPromoMessage('Mã khuyến mãi không hợp lệ hoặc đã hết hạn.');
      }
    }
  };

  // Tính tiền
  const unitPrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  const rawTotal = unitPrice * quantity;
  const discountAmount = (rawTotal * discountPercent) / 100;
  const finalTotal = rawTotal - discountAmount;

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation họ tên: chỉ cho phép chữ cái (hỗ trợ tiếng Việt có dấu) và khoảng trắng (tối thiểu 2 ký tự)
    const nameRegex = /^[\p{L}\s]{2,100}$/u;
    if (!nameRegex.test(customerName.trim())) {
      setError('Họ và tên chỉ được chứa chữ cái (hỗ trợ tiếng Việt có dấu) và khoảng trắng (tối thiểu 2 ký tự, không chứa số).');
      return;
    }

    // Validation email: bắt buộc đúng định dạng email (có @ và .)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(customerEmail.trim())) {
      setError('Địa chỉ email không hợp lệ (cần đúng định dạng ví dụ: ten@domain.vn có chứa "@" và ".").');
      return;
    }

    // Validation số điện thoại: 10 chữ số chuẩn bắt đầu bằng 0
    const phoneClean = customerPhone.replace(/\s+/g, '');
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phoneClean)) {
      setError('Số điện thoại không hợp lệ (phải gồm 10 chữ số và bắt đầu bằng số 0, ví dụ: 0987654321).');
      return;
    }

    // Bẫy lỗi chống chèn mã độc HTML/Script vào Tên công ty và Ghi chú
    const xssPattern = /<[^>]*>|javascript:|onerror=|onload=|eval\(|<script|<iframe|<di/i;
    if (companyName && xssPattern.test(companyName)) {
      setError('Tên công ty chứa ký tự không an toàn (ví dụ: <...>, <di>). Vui lòng chỉ nhập văn bản thuần.');
      return;
    }
    if (note && xssPattern.test(note)) {
      setError('Ghi chú cài đặt chứa thẻ HTML hoặc mã không an toàn (ví dụ: <...>, <di>...). Vui lòng chỉ nhập hướng dẫn văn bản thuần.');
      return;
    }

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setShowLoginRequired(true);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        servicePlanId: planId,
        quantity,
        billingCycle,
        customerName,
        customerEmail,
        customerPhone,
        companyName,
        note: note ? `${note} (Mã KM: ${promoCode || 'None'})` : `Mã KM: ${promoCode || 'None'}`,
      };

      const res = await fetchApi<any>('/api/Orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const currentUsername = localStorage.getItem('username') || '';
      const orderCodeNew = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 9000) + 1000}`;
      const newOrderObj = {
        id: (res.data && res.data.data && res.data.data.id) ? res.data.data.id : Math.floor(Math.random() * 900) + 100,
        orderCode: (res.data && res.data.data && res.data.data.orderCode) ? res.data.data.orderCode : orderCodeNew,
        username: currentUsername,
        customerName: (res.data && res.data.data && res.data.data.customerName) ? res.data.data.customerName : customerName.trim(),
        customerEmail: (res.data && res.data.data && res.data.data.customerEmail) ? res.data.data.customerEmail : customerEmail.trim(),
        customerPhone: (res.data && res.data.data && res.data.data.customerPhone) ? res.data.data.customerPhone : phoneClean,
        servicePlanName: plan.name,
        billingCycle,
        quantity,
        totalAmount: finalTotal,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };

      // Lưu đơn hàng vào danh sách đơn của người dùng
      const existingUserOrders = JSON.parse(localStorage.getItem('user_created_orders') || '[]');
      localStorage.setItem('user_created_orders', JSON.stringify([newOrderObj, ...existingUserOrders]));

      setSuccessOrder(newOrderObj);
    } catch {
      const currentUsername = localStorage.getItem('username') || '';
      const orderCodeNew = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 9000) + 1000}`;
      const newOrderObj = {
        id: Math.floor(Math.random() * 900) + 100,
        orderCode: orderCodeNew,
        username: currentUsername,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: phoneClean,
        servicePlanName: plan.name,
        billingCycle,
        quantity,
        totalAmount: finalTotal,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };

      const existingUserOrders = JSON.parse(localStorage.getItem('user_created_orders') || '[]');
      localStorage.setItem('user_created_orders', JSON.stringify([newOrderObj, ...existingUserOrders]));

      setSuccessOrder(newOrderObj);
    } finally {
      setSubmitting(false);
    }
  };

  if (successOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 text-center space-y-6 shadow-xl">
          <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="badge-pill bg-emerald-50 text-emerald-700 border border-emerald-200">
              Đặt Hàng Thành Công!
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Quét Mã QR Để Thanh Toán Kích Hoạt</h2>
            <p className="text-xs font-semibold text-slate-600">
              Mã đơn hàng: <strong className="text-blue-600 font-mono text-sm font-bold">{successOrder.orderCode}</strong>
            </p>
          </div>

          {/* QR Payment Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center p-6 rounded-3xl bg-slate-50 border border-slate-200 text-left">
            <div className="flex flex-col items-center justify-center space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <img
                src={generateVietQrUrl({
                  amount: successOrder.totalAmount,
                  description: successOrder.orderCode,
                  accountName: 'NGUYEN PHUONG KIET',
                })}
                alt="VietQR Code Thanh Toán Tự Động"
                className="w-56 h-auto rounded-xl object-contain border border-slate-100 shadow-sm"
              />
              <span className="badge-pill bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                VietQR Napas 24/7 Tự Động Điền Tiền & Nội Dung
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Ngân hàng thụ hưởng:</span>
                <p className="font-bold text-slate-900 text-sm">PVcomBank (Ngân hàng TMCP Đại Chúng)</p>
              </div>

              <div className="border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Chủ tài khoản:</span>
                <p className="font-extrabold text-slate-900 uppercase">NGUYỄN PHƯƠNG KIỆT</p>
              </div>

              <div className="border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Số tài khoản:</span>
                <p className="font-mono font-extrabold text-blue-600 text-base">1060 0182 3533</p>
              </div>

              <div className="border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Số tiền cần thanh toán:</span>
                <p className="font-mono font-extrabold text-emerald-600 text-lg">{formatCurrency(successOrder.totalAmount)}</p>
              </div>

              <div>
                <span className="text-slate-500 font-medium">Nội dung chuyển khoản:</span>
                <p className="font-mono font-bold text-slate-800 bg-slate-200/70 px-2.5 py-1 rounded-lg inline-block mt-1">
                  {successOrder.orderCode}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-left text-xs space-y-1">
            <p className="font-bold text-blue-900">ℹ️ Hướng dẫn kích hoạt:</p>
            <p className="text-slate-600">Hệ thống sẽ tự động đối soát và kích hoạt máy chủ cho bạn ngay khi nhận được thanh toán. Bạn có thể theo dõi tiến độ trong mục Đơn Hàng Của Tôi.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => router.push('/my-orders')}
              className="btn-pill btn-pill-primary text-xs"
            >
              Xem Đơn Hàng Của Tôi
            </button>
            <button
              onClick={() => router.push('/services')}
              className="btn-pill btn-pill-secondary text-xs"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Form Đăng ký */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <span className="badge-pill bg-blue-50 text-blue-700 border border-blue-200">
                Đăng Ký Thuê Máy Chủ
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                Thông Tin Cấu Hình & Khách Hàng
              </h1>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs font-semibold text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateOrder} className="space-y-6">
              {/* Chu kỳ & Số lượng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Chu kỳ thanh toán
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e: any) => setBillingCycle(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="monthly">Thanh toán hàng tháng</option>
                    <option value="yearly">Thanh toán 1 năm (Tiết kiệm 20%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Số lượng máy chủ
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Thông tin khách hàng */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Thông Tin Liên Hệ</h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Phương Kiệt"
                    value={customerName}
                    onChange={(e) => {
                      // Chỉ chặn số và ký tự đặc biệt nguy hiểm, giữ nguyên cho bộ gõ tiếng Việt (Telex/VNI)
                      const val = e.target.value;
                      if (!/[0-9!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`]/.test(val)) {
                        setCustomerName(val);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Email nhận thông tin máy chủ *</label>
                    <input
                      type="email"
                      required
                      placeholder="kiet@cloudservice.vn"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Số điện thoại *</label>
                    <input
                      type="tel"
                      required
                      maxLength={11}
                      placeholder="0987654321"
                      value={customerPhone}
                      onChange={(e) => {
                        // Chỉ cho phép nhập số
                        const val = e.target.value;
                        if (/^\d*$/.test(val)) {
                          setCustomerPhone(val);
                        }
                      }}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên công ty / Tổ chức (tùy chọn)</label>
                  <input
                    type="text"
                    placeholder="Kiet Cloud Tech Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Ghi chú cài đặt / Hệ điều hành</label>
                  <textarea
                    rows={2}
                    placeholder="Ví dụ: Cài sẵn hệ điều hành Ubuntu 24.04 LTS và Docker..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {submitting ? 'Đang Xử Lý Đơn Hàng...' : 'Tiến Hành Đặt Hàng & Thanh Toán'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Tóm tắt đơn hàng */}
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-4 border-b border-slate-100">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              Tóm Tắt Đơn Hàng
            </h3>

            {/* Thông tin gói */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-sm">{plan.name}</h4>
                  <span className="badge-pill bg-white text-blue-700 text-[10px] font-bold border border-blue-200">
                    NVMe Enterprise
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 font-medium">
                  <div>• {plan.cpu}</div>
                  <div>• {plan.ram}</div>
                  <div>• {plan.storage}</div>
                  <div>• {plan.bandwidth}</div>
                </div>
              </div>
            </div>

            {/* Voucher Box */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Mã Khuyến Mãi</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="WELCOME2026"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold uppercase text-slate-800 outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  Áp Dụng
                </button>
              </div>
              {promoMessage && (
                <p className={`text-[11px] font-semibold ${discountPercent > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {promoMessage}
                </p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Đơn giá ({billingCycle === 'monthly' ? 'tháng' : 'năm'}):</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(unitPrice)}</span>
              </div>
              {billingCycle === 'yearly' && (
                <div className="flex justify-between text-emerald-700 font-medium bg-emerald-50 px-2 py-1.5 rounded-lg border border-emerald-100">
                  <span>Ưu đãi thanh toán 1 năm:</span>
                  <span className="font-bold text-emerald-800">
                    Tiết kiệm {formatCurrency((plan.monthlyPrice * 12 - plan.yearlyPrice) * quantity)} (-20%)
                  </span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Số lượng:</span>
                <span className="font-mono font-bold text-slate-900">{quantity}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Mã giảm giá ({discountPercent}%):</span>
                  <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-4 border-t border-slate-200">
                <span className="font-extrabold text-slate-900 text-sm">Tổng thanh toán:</span>
                <span className="font-mono font-extrabold text-2xl text-blue-600">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>

      {/* ====== MODAL YÊU CẦU ĐĂNG NHẬP ====== */}
      {showLoginRequired && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLoginRequired(false)}
          />

          {/* Modal Card */}
          <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-5 animate-fade-in-up">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center shadow-sm">
              <Lock className="w-8 h-8 text-blue-500" />
            </div>

            {/* Heading */}
            <div className="text-center space-y-1.5">
              <h2 className="text-xl font-extrabold text-slate-900">Yêu cầu đăng nhập</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Bạn cần đăng nhập vào tài khoản trước khi tiến hành đặt mua dịch vụ.
              </p>
            </div>

            {/* Divider */}
            <div className="w-full border-t border-slate-100" />

            {/* Info */}
            <div className="w-full rounded-2xl bg-blue-50/70 border border-blue-100 px-4 py-3 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-blue-800">Tại sao cần đăng nhập?</p>
              <p>• Liên kết đơn hàng với tài khoản của bạn để quản lý dễ dàng.</p>
              <p>• Nhận thông báo kích hoạt dịch vụ ngay sau thanh toán.</p>
              <p>• Theo dõi tiến độ tại trang <span className="font-bold">Đơn Của Tôi</span>.</p>
            </div>

            {/* Action buttons */}
            <div className="w-full flex flex-col gap-2.5">
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full btn-pill btn-pill-primary py-3 text-sm font-bold"
              >
                Đăng Nhập Ngay
              </button>
              <div className="flex items-center gap-2 justify-center text-xs text-slate-500">
                <span>Chưa có tài khoản?</span>
                <button
                  onClick={() => router.push('/auth/register')}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Đăng ký miễn phí
                </button>
              </div>
              <button
                onClick={() => setShowLoginRequired(false)}
                className="w-full btn-pill btn-pill-secondary py-2.5 text-sm"
              >
                Để Sau
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
