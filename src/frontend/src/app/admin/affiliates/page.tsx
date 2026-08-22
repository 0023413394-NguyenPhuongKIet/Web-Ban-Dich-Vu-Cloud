'use client';

import React, { useEffect, useState } from 'react';
import { Users, X, Globe, Phone, Mail, AlertCircle, RefreshCw, CheckCircle2, XCircle, Clock, Eye, ShieldAlert } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { AffiliateApplication, PagedResult } from '@/types';

const sampleAffiliates: AffiliateApplication[] = [
  {
    id: 3,
    userId: 3,
    fullName: 'Nguyễn Thanh Trung',
    email: 'thanhtrung@email.com',
    phone: '0783812178',
    websiteUrl: 'https://vinahost.vn/thue-vps',
    promotionPlan: 'thuê dịch vụ giá rẻ',
    status: 'Approved',
    createdAt: '2026-08-21T04:44:00Z',
  },
  {
    id: 2,
    userId: 2,
    fullName: 'Võ Nguyễn Nguyên Hùng',
    email: 'hungvo@gmail.com',
    phone: '0783812178',
    websiteUrl: 'https://www.vps.com.vn',
    promotionPlan: 'Quảng bá dịch vụ',
    status: 'Approved',
    createdAt: '2026-08-21T03:25:00Z',
  },
  {
    id: 1,
    userId: 1,
    fullName: 'Nguyen Van A',
    email: 'vana@gmail.com',
    phone: '0912345678',
    websiteUrl: 'https://vana-blog.vn',
    promotionPlan: 'Chia sẻ link trên mạng xã hội',
    status: 'Approved',
    createdAt: '2026-08-18T03:56:00Z',
  }
];

export default function AdminAffiliatesPage() {
  const [applications, setApplications] = useState<AffiliateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [role, setRole] = useState<string>('');

  // Lấy role từ localStorage
  useEffect(() => {
    const r = localStorage.getItem('role') || '';
    setRole(r);
  }, []);

  const isAdmin = role === 'Admin';

  const loadApplications = async () => {
    setLoading(true);
    const localApps = JSON.parse(localStorage.getItem('all_affiliate_applications') || '[]');
    const localStatusOverrides = JSON.parse(localStorage.getItem('affiliate_status_overrides') || '{}');

    try {
      const endpoint = statusFilter
        ? `/api/Affiliate/applications?status=${statusFilter}`
        : '/api/Affiliate/applications';
      const res = await fetchApi<PagedResult<AffiliateApplication>>(endpoint);
      let fetched: AffiliateApplication[] = [];
      if (res.data && res.data.items && res.data.items.length > 0) {
        fetched = res.data.items;
      }

      // Kết hợp đơn từ backend + đơn đăng ký mới từ local
      const combined = [...localApps, ...fetched];
      const uniqueMap = new Map();
      combined.forEach((item) => {
        if (!uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, {
            ...item,
            status: localStatusOverrides[item.id] || item.status,
          });
        }
      });

      let finalResult = Array.from(uniqueMap.values());
      if (statusFilter) {
        finalResult = finalResult.filter((a) => a.status === statusFilter);
      }

      if (finalResult.length > 0) {
        setApplications(finalResult);
      } else {
        const fallback = sampleAffiliates.map((a) => ({
          ...a,
          status: localStatusOverrides[a.id] || a.status,
        }));
        setApplications(
          statusFilter ? fallback.filter((a) => a.status === statusFilter) : fallback
        );
      }
    } catch {
      const fallback = [...localApps, ...sampleAffiliates].map((a) => ({
        ...a,
        status: localStatusOverrides[a.id] || a.status,
      }));
      const uniqueMap = new Map();
      fallback.forEach((item) => {
        if (!uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item);
        }
      });
      let finalResult = Array.from(uniqueMap.values());
      if (statusFilter) {
        finalResult = finalResult.filter((a) => a.status === statusFilter);
      }
      setApplications(finalResult);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role) {
      loadApplications();
    }
  }, [statusFilter, role]);

  const handleUpdateStatus = async (id: number, status: 'Approved' | 'Rejected') => {
    if (!isAdmin) return; // Editor không có quyền duyệt
    setUpdatingId(id);

    // Lưu override vào localStorage để Editor và Admin reload đều giữ nguyên
    const localStatusOverrides = JSON.parse(localStorage.getItem('affiliate_status_overrides') || '{}');
    localStatusOverrides[id] = status;
    localStorage.setItem('affiliate_status_overrides', JSON.stringify(localStatusOverrides));

    // Cập nhật cả all_affiliate_applications nếu có
    const localApps = JSON.parse(localStorage.getItem('all_affiliate_applications') || '[]');
    const updatedLocalApps = localApps.map((a: any) => (a.id === id ? { ...a, status } : a));
    localStorage.setItem('all_affiliate_applications', JSON.stringify(updatedLocalApps));

    try {
      await fetchApi(`/api/Affiliate/applications/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status,
          note: status === 'Approved' ? 'Đã phê duyệt hồ sơ đối tác' : 'Hồ sơ chưa đạt tiêu chí',
        }),
      });

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );
    } catch {
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Approved') return (
      <span className="badge-pill bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" /> Đã duyệt
      </span>
    );
    if (status === 'Pending') return (
      <span className="badge-pill bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3.5 h-3.5" /> Chờ duyệt
      </span>
    );
    return (
      <span className="badge-pill bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle className="w-3.5 h-3.5" /> Từ chối
      </span>
    );
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className={`badge-pill border ${isAdmin ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            {isAdmin ? 'Chương Trình Đối Tác' : 'Xem Hồ Sơ Đối Tác (Chỉ xem)'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {isAdmin ? 'Duyệt Hồ Sơ Đối Tác Affiliate' : 'Danh Sách Hồ Sơ Affiliate'}
          </h1>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            {isAdmin
              ? 'Xem danh sách đăng ký làm đối tác và xét duyệt hồ sơ quảng bá'
              : 'Editor có thể xem thông tin hồ sơ nhưng không có quyền duyệt hay từ chối'}
          </p>
        </div>

        {/* Editor notice */}
        {!isAdmin && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700">
            <ShieldAlert className="w-4 h-4" />
            Chế độ Chỉ Xem — Chỉ Admin mới có thể Duyệt / Từ chối
          </div>
        )}

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 shadow-sm"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Pending">Chờ duyệt</option>
            <option value="Approved">Đã duyệt</option>
            <option value="Rejected">Đã từ chối</option>
          </select>

          <button
            onClick={loadApplications}
            disabled={loading}
            className="btn-pill btn-pill-secondary text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Table Data */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-16 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-3 shadow-sm">
          <Users className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Không tìm thấy hồ sơ đối tác nào phù hợp.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="text-[11px] uppercase font-bold text-slate-500 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4">Họ &amp; Tên</th>
                  <th className="p-4">Liên Hệ</th>
                  <th className="p-4">Kênh Quảng Bá</th>
                  <th className="p-4">Kế Hoạch Tiếp Thị</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4">Ngày Đăng Ký</th>
                  <th className="p-4 text-right">
                    {isAdmin ? 'Hành Động' : 'Quyền Hạn'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{app.fullName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">ID: #{app.id}</div>
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-800">
                        <Mail className="w-3.5 h-3.5 text-blue-500" />
                        <span>{app.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{app.phone}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {app.websiteUrl ? (
                        <a
                          href={app.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span className="max-w-[150px] truncate">{app.websiteUrl}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">Chưa cung cấp</span>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="max-w-[220px] text-slate-600 line-clamp-2 leading-relaxed text-[11px]">
                        {app.promotionPlan || 'Không có ghi chú'}
                      </p>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="p-4 text-slate-500 font-mono">
                      {formatDate(app.createdAt)}
                    </td>
                    <td className="p-4 text-right">
                      {isAdmin ? (
                        // Admin: nút Duyệt / Từ chối
                        <div className="flex items-center justify-end gap-1.5">
                          {app.status !== 'Approved' && (
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'Approved')}
                              disabled={updatingId === app.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                            >
                              Duyệt
                            </button>
                          )}
                          {app.status !== 'Rejected' && (
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                              disabled={updatingId === app.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                            >
                              Từ Chối
                            </button>
                          )}
                        </div>
                      ) : (
                        // Editor: chỉ xem - hiển thị badge thụ động
                        <span className="flex items-center justify-end gap-1.5 text-[11px] font-semibold text-slate-400">
                          <Eye className="w-3.5 h-3.5" />
                          Chỉ xem
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
