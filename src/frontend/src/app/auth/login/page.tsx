'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string): string => {
    const clean = value.trim();
    const xssPattern = /<[^>]*>|javascript:|onerror=|onload=|eval\(|<script|<iframe|<div|<img|--|;|\/\*|\*\/|union\s+select/i;

    if (name === 'username') {
      if (!clean) return 'Vui lòng nhập tên đăng nhập.';
      if (xssPattern.test(clean)) return 'Tên đăng nhập chứa ký tự không an toàn.';
      if (clean.length < 3 || clean.length > 50) return 'Tên đăng nhập phải từ 3 đến 50 ký tự.';
      if (/\s/.test(clean)) return 'Tên đăng nhập không được chứa khoảng trắng.';
    }

    if (name === 'password') {
      if (!value) return 'Vui lòng nhập mật khẩu.';
      if (xssPattern.test(value)) return 'Mật khẩu chứa ký tự không an toàn.';
      if (value.length < 6) return 'Mật khẩu phải có tối thiểu 6 ký tự.';
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

    const uErr = validateField('username', username);
    const pErr = validateField('password', password);
    if (uErr || pErr) {
      setFieldErrors({ username: uErr, password: pErr });
      setError(uErr || pErr);
      return;
    }

    setFieldErrors({});
    const userClean = username.trim();

    setLoading(true);
    try {
      interface LoginResponse { 
        accessToken?: string; 
        token?: string; 
        username?: string; 
        role?: string; 
      }
      const { data, error: apiErr } = await fetchApi<LoginResponse>('/api/Auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: userClean, password }),
      });
      
      const jwt = data?.accessToken || data?.token;
      if (jwt) {
        localStorage.setItem('jwt_token', jwt);
        localStorage.setItem('username', data?.username || userClean);
        localStorage.setItem('role', data?.role || '');
        if (data?.role === 'Admin' || data?.role === 'Editor') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      } else {
        setError(apiErr || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
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
        
        {/* Main Login Card */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-white border border-slate-200 p-1.5 items-center justify-center shadow-md shadow-blue-500/10 mb-2 overflow-hidden">
              <img src="/images/logo.jpg" alt="CloudVerse Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Đăng Nhập Tài Khoản</h1>
            <p className="text-xs text-slate-500">
              Quản lý gói máy chủ Cloud, dịch vụ và đối tác tiếp thị
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="admin hoặc editor hoặc kiet"
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
                  placeholder="••••••••"
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
                <span>Đang Xác Thực...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Đăng Nhập Ngay</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-3 border-t border-slate-200/80 space-y-2">
            <p className="text-xs text-slate-600">
              Chưa có tài khoản?{' '}
              <Link href="/auth/register" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                Đăng ký tài khoản mới
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
