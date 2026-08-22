'use client';

import React, { useEffect, useState } from 'react';
import { 
  Gift, 
  Plus, 
  Edit3, 
  Trash2, 
  Percent, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  X, 
  Tag, 
  ToggleLeft, 
  ToggleRight, 
  Sparkles 
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { Promotion } from '@/types';

const defaultPromotions: Promotion[] = [
  {
    id: 1,
    code: 'WELCOME2026',
    title: 'Khuyến mãi chào mừng năm mới 2026 - Giảm 20% toàn bộ dịch vụ',
    discountPercent: 20,
    startDate: '2026-08-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    isActive: true,
    isCurrentlyValid: true,
    createdAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 2,
    code: 'CLOUD50',
    title: 'Siêu sale Cloud Server - Giảm ngay 50%',
    discountPercent: 50,
    startDate: '2026-08-01T00:00:00Z',
    endDate: '2026-10-31T23:59:59Z',
    isActive: true,
    isCurrentlyValid: true,
    createdAt: '2026-08-01T00:00:00Z',
  }
];

export default function AdminPromotionsManagementPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(20);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10));
  const [isActive, setIsActive] = useState(true);

  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    setLoading(true);
    const localSaved = JSON.parse(localStorage.getItem('admin_managed_promotions') || '[]');

    try {
      const res = await fetchApi<any>('/api/Promotions');
      let fetched: Promotion[] = [];
      if (Array.isArray(res.data) && res.data.length > 0) {
        fetched = res.data;
      } else if (res.data && Array.isArray(res.data.items) && res.data.items.length > 0) {
        fetched = res.data.items;
      }

      if (fetched.length > 0) {
        setPromotions(fetched);
      } else if (localSaved.length > 0) {
        setPromotions(localSaved);
      } else {
        setPromotions(defaultPromotions);
      }
    } catch {
      setPromotions(localSaved.length > 0 ? localSaved : defaultPromotions);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (promoItem?: Promotion) => {
    setMessage(null);
    setErrorMsg(null);
    if (promoItem) {
      setEditingPromo(promoItem);
      setCode(promoItem.code);
      setTitle(promoItem.title || '');
      setDiscountPercent(promoItem.discountPercent);
      setStartDate(promoItem.startDate ? promoItem.startDate.slice(0, 10) : new Date().toISOString().slice(0, 10));
      setEndDate(promoItem.endDate ? promoItem.endDate.slice(0, 10) : new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10));
      setIsActive(promoItem.isActive);
    } else {
      setEditingPromo(null);
      setCode('');
      setTitle('');
      setDiscountPercent(20);
      setStartDate(new Date().toISOString().slice(0, 10));
      setEndDate(new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10));
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation logic ngày tháng: Ngày hết hạn không được trước ngày bắt đầu
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      setErrorMsg('Lỗi logic ngày tháng: Ngày hết hạn không thể diễn ra trước ngày bắt đầu khuyến mãi.');
      return;
    }

    // Validation
    const xssPattern = /<[^>]*>|javascript:|onerror=|onload=|<script|<di/i;
    if (xssPattern.test(code) || xssPattern.test(title)) {
      setErrorMsg('Mã hoặc tiêu đề khuyến mãi chứa thẻ HTML không hợp lệ.');
      return;
    }

    const payload = {
      code: code.trim().toUpperCase(),
      title: title.trim(),
      discountPercent: Number(discountPercent),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      isActive,
    };

    const newPromoItem: Promotion = {
      id: editingPromo ? editingPromo.id : Math.floor(Math.random() * 900) + 10,
      ...payload,
      isCurrentlyValid: isActive,
      createdAt: new Date().toISOString(),
    };

    let updated: Promotion[] = [];
    if (editingPromo) {
      updated = promotions.map((p) => (p.id === editingPromo.id ? newPromoItem : p));
      setMessage(`Đã cập nhật mã khuyến mãi "${newPromoItem.code}".`);
    } else {
      updated = [newPromoItem, ...promotions];
      setMessage(`Đã thêm mới thành công mã "${newPromoItem.code}".`);
    }

    setPromotions(updated);
    localStorage.setItem('admin_managed_promotions', JSON.stringify(updated));

    try {
      if (editingPromo) {
        await fetchApi(`/api/Promotions/${editingPromo.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi('/api/Promotions', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
    } catch {}

    setIsModalOpen(false);
  };

  // Trạng thái modal xác nhận xóa
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const confirmDeletePromo = async () => {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    const deletedPromo = promotions.find((p) => p.id === id);
    const updated = promotions.filter((p) => p.id !== id);
    setPromotions(updated);
    localStorage.setItem('admin_managed_promotions', JSON.stringify(updated));
    setMessage(`Đã xóa thành công mã khuyến mãi "${deletedPromo?.code || id}".`);
    setDeleteConfirmId(null);

    try {
      await fetchApi(`/api/Promotions/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const handleToggleActive = (id: number) => {
    const updated = promotions.map((p) =>
      p.id === id ? { ...p, isActive: !p.isActive, isCurrentlyValid: !p.isActive } : p
    );
    setPromotions(updated);
    localStorage.setItem('admin_managed_promotions', JSON.stringify(updated));
  };

  const filteredPromotions = promotions.filter(
    (p) =>
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.title && p.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="badge-pill bg-amber-50 text-amber-700 border border-amber-200">
            Quản Trị Ưu Đãi &amp; Giảm Giá
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Quản Lý Mã Khuyến Mãi (Voucher)
          </h1>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            Tạo mã coupon giảm giá %, thiết lập thời hạn sử dụng và kích hoạt áp dụng khi đặt hàng
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenModal()}
            className="btn-pill btn-pill-primary text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Tạo Mã Khuyến Mãi Mới
          </button>

          <button
            onClick={loadPromotions}
            disabled={loading}
            className="btn-pill btn-pill-secondary text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Tìm theo mã coupon hoặc tiêu đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="text-[11px] uppercase font-bold text-slate-500 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4">Mã Voucher</th>
                  <th className="p-4">Chương Trình Khuyến Mãi</th>
                  <th className="p-4">Mức Giảm</th>
                  <th className="p-4">Thời Hạn Sử Dụng</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPromotions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-extrabold text-blue-700 text-sm bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200">
                        {item.code}
                      </span>
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-slate-900">{item.title}</div>
                    </td>
                    <td className="p-4">
                      <span className="badge-pill bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-extrabold">
                        -{item.discountPercent}%
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-mono text-[11px] space-y-0.5">
                      <div>Từ: {formatDate(item.startDate)}</div>
                      <div>Đến: <strong>{formatDate(item.endDate)}</strong></div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(item.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          item.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${item.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {item.isActive ? 'Đang Bật' : 'Đang Tắt'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors"
                          title="Chỉnh sửa voucher"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
                          title="Xóa voucher"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL THÊM / SỬA MÃ VOUCHER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="badge-pill bg-amber-50 text-amber-700 border border-amber-200">
                  {editingPromo ? 'Chỉnh Sửa Voucher' : 'Tạo Voucher Mới'}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  {editingPromo ? `Mã: ${editingPromo.code}` : 'Thiết Lập Mã Giảm Giá'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSavePromo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mã Giảm Giá (Code) *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="SALE30"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold uppercase font-mono text-blue-700 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">% Giảm Giá (1 - 100) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold font-mono focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu Đề / Mô Tả Khuyến Mãi *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Giảm 30% cho khách hàng mới"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày Bắt Đầu</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày Hết Hạn</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-slate-700">
                  Kích hoạt mã giảm giá ngay sau khi lưu
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="submit" className="flex-1 btn-pill btn-pill-primary text-xs py-3 font-bold">
                  {editingPromo ? 'Lưu Thay Đổi' : 'Tạo Mã Khuyến Mãi'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-pill btn-pill-secondary text-xs py-3">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA MÃ VOUCHER */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Xác Nhận Xóa Mã Khuyến Mãi?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Hành động này không thể hoàn tác. Mã giảm giá sẽ bị gỡ bỏ khỏi toàn bộ hệ thống đặt hàng.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={confirmDeletePromo}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
              >
                Xác Nhận Xóa
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Hủy Bỏ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
