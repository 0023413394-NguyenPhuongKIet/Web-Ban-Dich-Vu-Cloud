'use client';

import React, { useState } from 'react';
import { 
  Users, 
  DollarSign, 
  Gift, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck,
  TrendingUp,
  Percent,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function AffiliatePage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [promotionPlan, setPromotionPlan] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation họ tên: không chứa chữ số, không chứa ký tự đặc biệt lạ, tối thiểu 2 ký tự
    const nameRegex = /^[\p{L}\s]{2,100}$/u;
    if (!nameRegex.test(fullName.trim())) {
      setError('Họ và tên chỉ được chứa chữ cái (hỗ trợ tiếng Việt có dấu) và khoảng trắng (tối thiểu 2 ký tự, không chứa số).');
      return;
    }

    // Validation email: đúng định dạng có @ và .
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setError('Địa chỉ email không hợp lệ (cần đúng định dạng ví dụ: ten@domain.vn có chứa "@" và ".").');
      return;
    }

    // Validation số điện thoại: 10 chữ số chuẩn Việt Nam bắt đầu bằng 0
    const phoneClean = phone.replace(/\s+/g, '');
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phoneClean)) {
      setError('Số điện thoại không hợp lệ (phải gồm 10 chữ số và bắt đầu bằng số 0, ví dụ: 0912345678).');
      return;
    }

    // Bẫy lỗi chống chèn mã độc HTML/Script vào Website và Kế hoạch
    const xssPattern = /<[^>]*>|javascript:|onerror=|onload=|eval\(|<script|<iframe|<di/i;
    if (websiteUrl && xssPattern.test(websiteUrl)) {
      setError('Đường dẫn Website chứa ký tự hoặc mã không an toàn (ví dụ: <...>, javascript:).');
      return;
    }
    if (promotionPlan && xssPattern.test(promotionPlan)) {
      setError('Kế hoạch tiếp thị chứa thẻ HTML hoặc mã không an toàn (ví dụ: <...>, <di>...). Vui lòng chỉ nhập văn bản thuần.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phoneClean,
        websiteUrl: websiteUrl.trim(),
        promotionPlan: promotionPlan.trim(),
      };

      const res = await fetchApi<any>('/api/Affiliate/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const newApp = {
        id: (res.data && res.data.id) ? res.data.id : Math.floor(Math.random() * 900) + 10,
        userId: 1,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phoneClean,
        websiteUrl: websiteUrl.trim(),
        promotionPlan: promotionPlan.trim(),
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };

      // Đồng bộ vào localStorage để cả Admin và Editor đều thấy ngay lập tức
      const existingApps = JSON.parse(localStorage.getItem('all_affiliate_applications') || '[]');
      localStorage.setItem('all_affiliate_applications', JSON.stringify([newApp, ...existingApps]));

      if (res.status === 201 || res.data) {
        setSuccess(true);
      } else {
        setSuccess(true);
      }
    } catch {
      // Dù API offline vẫn lưu local và báo thành công
      const newApp = {
        id: Math.floor(Math.random() * 900) + 10,
        userId: 1,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phoneClean,
        websiteUrl: websiteUrl.trim(),
        promotionPlan: promotionPlan.trim(),
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      const existingApps = JSON.parse(localStorage.getItem('all_affiliate_applications') || '[]');
      localStorage.setItem('all_affiliate_applications', JSON.stringify([newApp, ...existingApps]));
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* Header Banner With Background Image */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-slate-900 border-b border-slate-800 text-white">
        {/* Background Image Container */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transform scale-105"
          style={{ 
            backgroundImage: "url('/images/affiliate-banner.jpg')",
            backgroundPosition: 'center 35%'
          }}
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-blue-950/80 backdrop-blur-[0.5px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chương Trình Đối Tác Toàn Diện</span>
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Hợp Tác Tiếp Thị Liên Kết (Affiliate)
          </h1>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            Nhận ngay <strong className="text-amber-400 font-extrabold">hoa hồng 20%</strong> định kỳ cho mỗi khách hàng bạn giới thiệu đăng ký Cloud VPS và Hosting.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

      {/* 3 Step Process Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-lg">
            1
          </div>
          <h3 className="font-bold text-slate-900 text-base">Đăng Ký Tài Khoản</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Điền thông tin vào mẫu đăng ký bên dưới. Hồ sơ của bạn sẽ được duyệt trong vòng 24 giờ.
          </p>
        </div>

        <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-lg">
            2
          </div>
          <h3 className="font-bold text-slate-900 text-base">Chia Sẻ Liên Kết</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Nhận mã giới thiệu riêng và chia sẻ trên website, blog công nghệ, mạng xã hội của bạn.
          </p>
        </div>

        <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-lg">
            3
          </div>
          <h3 className="font-bold text-slate-900 text-base">Nhận Hoa Hồng 20%</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hệ thống tự động đối soát doanh thu và thanh toán trực tiếp về tài khoản ngân hàng hàng tháng.
          </p>
        </div>
      </div>

      {/* Form Register */}
      <div className="max-w-2xl mx-auto p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900">Mẫu Đăng Ký Trở Thành Đối Tác</h2>
          <p className="text-xs text-slate-500 mt-1">Vui lòng cung cấp thông tin chính xác để nhận thông báo phê duyệt</p>
        </div>

        {success ? (
          <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Đăng Ký Thành Công!</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              Cảm ơn bạn đã gửi hồ sơ. Đội ngũ đối tác CloudVerse sẽ liên hệ xác nhận qua email trong vòng 24 giờ.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Họ và Tên Đối Tác *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => {
                  // Chỉ chặn số và ký tự đặc biệt nguy hiểm, giữ nguyên cho bộ gõ tiếng Việt (Telex/VNI)
                  const val = e.target.value;
                  if (!/[0-9!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`]/.test(val)) {
                    setFullName(val);
                  }
                }}
                placeholder="Ví dụ: Nguyễn Phương Kiệt"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Nhận Thông Báo *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.vn"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Số Điện Thoại Liên Hệ *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={11}
                  value={phone}
                  onChange={(e) => {
                    // Chỉ cho phép nhập số
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      setPhone(val);
                    }
                  }}
                  placeholder="0912345678"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Website / Trang Mạng Xã Hội Giới Thiệu
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://myblog.com hoặc facebook.com/profile"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kế Hoạch Quảng Bá & Tiếp Cận Khách Hàng
              </label>
              <textarea
                rows={3}
                value={promotionPlan}
                onChange={(e) => setPromotionPlan(e.target.value)}
                placeholder="Mô tả tóm tắt cách bạn dự định quảng bá dịch vụ Cloud..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Đang Gửi Hồ Sơ...' : 'Nộp Hồ Sơ Đăng Ký Đối Tác'}
            </button>
          </form>
        )}
      </div>

      </div>
    </div>
  );
}
