'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, User, Mail, Phone, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Validation Họ và Tên (chỉ chứa chữ cái tiếng Việt và khoảng trắng, tối thiểu 2 ký tự)
    const nameClean = fullName.trim();
    const nameRegex = /^[\p{L}\s]{2,80}$/u;
    if (!nameRegex.test(nameClean)) {
      setError('Họ và tên chỉ được chứa chữ cái (hỗ trợ tiếng Việt có dấu) và khoảng trắng (từ 2 đến 80 ký tự, không chứa số hay ký tự đặc biệt).');
      return;
    }

    // 2. Validation Tên đăng nhập (chữ cái không dấu, số, dấu gạch dưới, từ 3-30 ký tự)
    const userClean = username.trim();
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(userClean)) {
      setError('Tên đăng nhập phải từ 3 đến 30 ký tự, chỉ gồm chữ cái không dấu (a-z, A-Z), số (0-9) và dấu gạch dưới (_), không có khoảng trắng.');
      return;
    }

    // 3. Validation Email (chuẩn định dạng email có đuôi tên miền hợp lệ)
    const emailClean = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(vn|com|edu|net|org|io|info|biz|gov|co|me|cloud|ai|[a-z]{2,})$/i;
    if (!emailRegex.test(emailClean)) {
      setError('Địa chỉ email không hợp lệ! Vui lòng nhập đúng định dạng (ví dụ: name@company.vn, phuongkiet@gmail.com có chứa @, tên miền và đuôi .vn, .com, .edu,...).');
      return;
    }

    // 4. Validation Số điện thoại (nếu có nhập thì phải đúng 10 chữ số bắt đầu bằng 0)
    const phoneClean = phoneNumber.replace(/\s+/g, '');
    if (phoneClean) {
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(phoneClean)) {
        setError('Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0 (ví dụ: 0987654321).');
        return;
      }
    }

    // 5. Bẫy lỗi chống chèn mã độc HTML / Script / XSS / SQL Injection
    const xssPattern = /<[^>]*>|javascript:|onerror=|onload=|eval\(|<script|<iframe|<div|<img|--|;|\/\*|\*\/|union\s+select/i;
    if (xssPattern.test(nameClean) || xssPattern.test(userClean) || xssPattern.test(emailClean) || (phoneClean && xssPattern.test(phoneClean))) {
      setError('Thông tin nhập chứa ký tự hoặc thẻ HTML/Script không an toàn. Vui lòng chỉ nhập văn bản thuần túy.');
      return;
    }
    if (xssPattern.test(password) || xssPattern.test(confirmPassword)) {
      setError('Mật khẩu chứa ký tự không an toàn. Vui lòng kiểm tra lại.');
      return;
    }

    // 6. Validation Mật khẩu (tối thiểu 6 ký tự)
    if (password.length < 6) {
      setError('Mật khẩu phải có tối thiểu 6 ký tự để đảm bảo an toàn.');
      return;
    }

    // 7. Validation Khớp mật khẩu
    if (password !== confirmPassword) {
      setError('Xác nhận mật khẩu không khớp với mật khẩu đã nhập.');
      return;
    }

    setLoading(true);
    try {
      interface AuthResponse {
        accessToken?: string;
        token?: string;
        username?: string;
        role?: string;
        fullName?: string;
        email?: string;
      }

      const { data, error: apiErr } = await fetchApi<AuthResponse>('/api/Auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: userClean,
          email: emailClean,
          password,
          fullName: nameClean,
          phoneNumber: phoneClean || null,
        }),
      });

      const jwt = data?.accessToken || data?.token;
      if (jwt) {
        localStorage.setItem('jwt_token', jwt);
        localStorage.setItem('username', data?.username || userClean);
        localStorage.setItem('role', data?.role || 'Customer');
        setSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        setError(apiErr || 'Đăng ký không thành công. Vui lòng thử lại.');
      }
    } catch {
      setError('Không thể kết nối đến máy chủ Backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Main Card */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-white border border-slate-200 p-1.5 items-center justify-center shadow-md shadow-blue-500/10 mb-2 overflow-hidden">
              <img src="/images/logo.jpg" alt="CloudVerse Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Đăng Ký Tài Khoản</h1>
            <p className="text-xs text-slate-500">
              Tạo tài khoản khách hàng để trải nghiệm các dịch vụ Cloud Server cao cấp
            </p>
          </div>

          {success ? (
            <div className="p-6 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-emerald-900">Đăng Ký Thành Công!</h3>
              <p className="text-xs text-emerald-700">
                Hệ thống đang tự động đăng nhập và chuyển bạn về trang chủ...
              </p>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Họ và Tên *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50/90 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tên Đăng Nhập *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Từ 3-20 ký tự (viết liền không dấu, vd: nguyenvana)"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50/90 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Địa Chỉ Email *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50/90 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Số Điện Thoại <span className="font-normal text-slate-400">(Tùy chọn)</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Ví dụ: 0987654321 (10 chữ số)"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50/90 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mật Khẩu *
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-10 pr-11 py-3 rounded-2xl bg-slate-50/90 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Xác Nhận Mật Khẩu *
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại chính xác mật khẩu ở trên"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50/90 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-700 text-xs font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Đang Tạo Tài Khoản...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Đăng Ký Tài Khoản</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center pt-3 border-t border-slate-200/80 space-y-2">
            <p className="text-xs text-slate-600">
              Đã có tài khoản?{' '}
              <Link href="/auth/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
            <div>
              <Link href="/services" className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
                ← Quay lại xem danh sách dịch vụ
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}