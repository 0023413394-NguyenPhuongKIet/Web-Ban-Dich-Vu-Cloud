'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Download, ShoppingBag, ShieldAlert, Users, CheckCircle2, FileText, Sparkles } from 'lucide-react';

export default function AdminReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleExport = async (endpoint: string, fileName: string, typeKey: string) => {
    setDownloading(typeKey);
    const token = localStorage.getItem('jwt_token');

    try {
      const response = await fetch(`http://localhost:5286${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Lỗi khi xuất file báo cáo từ máy chủ.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tải file báo cáo.');
    } finally {
      setDownloading(null);
    }
  };

  const reports = [
    {
      key: 'orders',
      title: 'Báo Cáo Đơn Đặt Hàng',
      desc: 'Xuất toàn bộ danh sách đơn đặt hàng gồm mã đơn, thông tin khách hàng, gói dịch vụ, tổng tiền và trạng thái.',
      icon: ShoppingBag,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      btnClass: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
      endpoint: '/api/Reports/export/orders',
      fileName: `orders_report_${new Date().toISOString().slice(0, 10)}.csv`,
    },
    {
      key: 'audit-logs',
      title: 'Báo Cáo Nhật Ký Audit Logs',
      desc: 'Xuất toàn bộ lịch sử thao tác hệ thống, phân quyền, đăng nhập và nhật ký bảo mật phục vụ đối soát.',
      icon: ShieldAlert,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      btnClass: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20',
      endpoint: '/api/Reports/export/audit-logs',
      fileName: `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`,
    },
    {
      key: 'affiliates',
      title: 'Báo Cáo Đối Tác Affiliate',
      desc: 'Xuất danh sách các đối tác tiếp thị liên kết, kênh truyền thông, website và trạng thái phê duyệt.',
      icon: Users,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      btnClass: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20',
      endpoint: '/api/Reports/export/affiliates',
      fileName: `affiliates_report_${new Date().toISOString().slice(0, 10)}.csv`,
    },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <span className="badge-pill bg-emerald-50 text-emerald-700 border border-emerald-200">
          Kết Xuất Dữ Liệu
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Xuất Báo Cáo Excel / CSV
        </h1>
        <p className="text-xs font-semibold text-slate-600">
          Tải xuống tệp dữ liệu CSV UTF-8 tương thích 100% Microsoft Excel & Google Sheets
        </p>
      </div>

      {/* Reports Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((r) => {
          const Icon = r.icon;
          const isBusy = downloading === r.key;
          return (
            <div
              key={r.key}
              className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${r.iconBg}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {r.title}
                </h3>
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  {r.desc}
                </p>
              </div>

              <button
                onClick={() => handleExport(r.endpoint, r.fileName, r.key)}
                disabled={isBusy}
                className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${r.btnClass}`}
              >
                <Download className={`w-4 h-4 ${isBusy ? 'animate-bounce' : ''}`} />
                {isBusy ? 'Đang Tạo Tệp CSV...' : 'Tải Xuống Tệp CSV'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Format Notice */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0">
          <FileSpreadsheet className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900">Định Dạng & Chuẩn Mã Hóa Tệp Xuất</h4>
          <p className="text-xs font-medium text-slate-600 leading-relaxed">
            Các tệp báo cáo được xuất tự động ở định dạng <strong className="text-slate-800">CSV (Comma-Separated Values)</strong> với bảng mã <strong className="text-slate-800">UTF-8 BOM</strong>, đảm bảo không bị lỗi font tiếng Việt khi mở trực tiếp trên mọi phiên bản Microsoft Excel, LibreOffice hoặc Google Sheets.
          </p>
        </div>
      </div>

    </div>
  );
}
