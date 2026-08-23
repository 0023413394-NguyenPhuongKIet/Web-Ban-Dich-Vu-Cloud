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

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Hàm bẫy lỗi từng trường (Realtime/OnBlur)
  const validateField = (name: string, value: string): string => {
    const clean = value.trim();
    const xssPattern = /<[^>]*>|javascript:|onerror=|onload=|eval\(|<script|<iframe|<div|<img|--|;|\/\*|\*\/|union\s+select/i;

    if (name === 'fullName') {
      if (!clean) return 'Họ và tên không được để trống.';
      if (xssPattern.test(clean)) return 'Họ và tên chứa ký tự hoặc mã script không an toàn.';
      const nameRegex = /^[\p{L}\s]{2,80}$/u;
      if (!nameRegex.test(clean)) return 'Họ và tên chỉ được chứa chữ cái (hỗ trợ tiếng Việt có dấu) và khoảng trắng (tối thiểu 2 ký tự, không chứa số).';
    }

    if (name === 'username') {
      if (!clean) return 'Tên đăng nhập không được để trống.';
      if (xssPattern.test(clean)) return 'Tên đăng nhập chứa ký tự không an toàn.';
      const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
      if (!usernameRegex.test(clean)) return 'Tên đăng nhập phải từ 3-30 ký tự, viết liền không dấu, chỉ gồm chữ cái, số và dấu gạch dưới (_).';
    }

    if (name === 'email') {
      if (!clean) return 'Địa chỉ email không được để trống.';
      if (xssPattern.test(clean)) return 'Email chứa ký tự không an toàn.';
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(vn|com|edu|net|org|io|info|biz|gov|co|me|cloud|ai|[a-z]{2,})$/i;
      if (!emailRegex.test(clean.toLowerCase())) return 'Email không hợp lệ (ví dụ: ten@domain.vn có chứa "@" và đuôi tên miền hợp lệ).';
    }

    if (name === 'phoneNumber' && clean) {
      const phoneClean = clean.replace(/\s+/g, '');
      if (xssPattern.test(phoneClean)) return 'Số điện thoại không an toàn.';
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(phoneClean)) return 'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0 (ví dụ: 0987654321).';
    }

    if (name === 'password') {
      if (!value) return 'Mật khẩu không được để trống.';
      if (xssPattern.test(value)) return 'Mật khẩu chứa ký tự không an toàn.';
      if (value.length < 6) return 'Mật khẩu phải có tối thiểu 6 ký tự.';
    }

    if (name === 'confirmPassword') {
      if (!value) return 'Vui lòng xác nhận lại mật khẩu.';
      if (value !== password) return 'Xác nhận mật khẩu không khớp với mật khẩu đã nhập.';
    }

    return '';
  };

  const handleBlur = (fieldName: string, val: string) => {
    const err = validateField(fieldName, val);
    setFieldErrors((prev) => ({ ...prev, [fieldName]: err }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Kiểm tra toàn bộ các trường
    const errors: Record<string, string> = {
      fullName: validateField('fullName', fullName),
      username: validateField('username', username),
      email: validateField('email', email),
      phoneNumber: validateField('phoneNumber', phoneNumber),
      password: validateField('password', password),
      confirmPassword: validateField('confirmPassword', confirmPassword),
    };

    // Lọc các lỗi thực sự
    const activeErrors = Object.entries(errors).filter(([_, err]) => !!err);
    if (activeErrors.length > 0) {
      setFieldErrors(errors);
      setError(activeErrors[0][1]); // Hiển thị lỗi đầu tiên lên banner
      return;
    }

    setFieldErrors({});

    const nameClean = fullName.trim();
    const userClean = username.trim();
    const emailClean = email.trim().toLowerCase();
    const phoneClean = phoneNumber.replace(/\s+/g, '');

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
              
              {/* Họ và tên */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Họ và Tên *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (fieldErrors.fullName) {
                        setFieldErrors((p) => ({ ...p, fullName: validateField('fullName', e.target.value) }));
                      }
                    }}
                    onBlur={(e) => handleBlur('fullName', e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50/90 border text-xs font-medium focus:bg-white focus:outline-none transition-colors ${
                      fieldErrors.fullName ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                  <User className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${fieldErrors.fullName ? 'text-rose-500' : 'text-slate-400'}`} />
                </div>
                {fieldErrors.fullName && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1 pl-1">
                    ⚠ {fieldErrors.fullName}
                  </p>
                )}
              </div>

              {/* Tên đăng nhập */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tên Đăng Nhập *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (fieldErrors.username) {
                        setFieldErrors((p) => ({ ...p, username: validateField('username', e.target.value) }));
                      }
                    }}
                    onBlur={(e) => handleBlur('username', e.target.value)}
                    placeholder="Từ 3-30 ký tự (viết liền không dấu, vd: nguyenvana)"
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50/90 border text-xs font-medium focus:bg-white focus:outline-none transition-colors ${
                      fieldErrors.username ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                  <User className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${fieldErrors.username ? 'text-rose-500' : 'text-slate-400'}`} />
                </div>
                {fieldErrors.username && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1 pl-1">
                    ⚠ {fieldErrors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Địa Chỉ Email *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors((p) => ({ ...p, email: validateField('email', e.target.value) }));
                      }
                    }}
                    onBlur={(e) => handleBlur('email', e.target.value)}
                    placeholder="email@domain.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50/90 border text-xs font-medium focus:bg-white focus:outline-none transition-colors ${
                      fieldErrors.email ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                  <Mail className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${fieldErrors.email ? 'text-rose-500' : 'text-slate-400'}`} />
                </div>
                {fieldErrors.email && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1 pl-1">
                    ⚠ {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Số Điện Thoại <span className="font-normal text-slate-400">(Tùy chọn)</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (fieldErrors.phoneNumber) {
                        setFieldErrors((p) => ({ ...p, phoneNumber: validateField('phoneNumber', e.target.value) }));
                      }
                    }}
                    onBlur={(e) => handleBlur('phoneNumber', e.target.value)}
                    placeholder="Ví dụ: 0987654321 (10 chữ số)"
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50/90 border text-xs font-medium focus:bg-white focus:outline-none transition-colors ${
                      fieldErrors.phoneNumber ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                  <Phone className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${fieldErrors.phoneNumber ? 'text-rose-500' : 'text-slate-400'}`} />
                </div>
                {fieldErrors.phoneNumber && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1 pl-1">
                    ⚠ {fieldErrors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Mật khẩu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mật Khẩu *
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors((p) => ({ ...p, password: validateField('password', e.target.value) }));
                      }
                    }}
                    onBlur={(e) => handleBlur('password', e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className={`w-full pl-10 pr-11 py-3 rounded-2xl bg-slate-50/90 border text-xs font-medium focus:bg-white focus:outline-none transition-colors ${
                      fieldErrors.password ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                  <Lock className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${fieldErrors.password ? 'text-rose-500' : 'text-slate-400'}`} />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1 pl-1">
                    ⚠ {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Xác nhận mật khẩu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Xác Nhận Mật Khẩu *
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) {
                        setFieldErrors((p) => ({ ...p, confirmPassword: validateField('confirmPassword', e.target.value) }));
                      }
                    }}
                    onBlur={(e) => handleBlur('confirmPassword', e.target.value)}
                    placeholder="Nhập lại chính xác mật khẩu ở trên"
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50/90 border text-xs font-medium focus:bg-white focus:outline-none transition-colors ${
                      fieldErrors.confirmPassword ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                  <Lock className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${fieldErrors.confirmPassword ? 'text-rose-500' : 'text-slate-400'}`} />
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1 pl-1">
                    ⚠ {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <span>⚠</span>
                  <span>{error}</span>
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