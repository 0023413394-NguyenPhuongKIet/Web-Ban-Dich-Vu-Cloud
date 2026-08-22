'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ShoppingCart, Check, X, Clock, AlertCircle, RefreshCw, Filter, ArrowUpDown, CircleDollarSign, ChevronDown, ChevronUp, CreditCard, Search } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface OrderItem {
  id: number;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  servicePlanName: string;
  billingCycle: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  note?: string;
  username?: string;
  // Trường đơn chu kỳ định kỳ
  isInstallmentOrder?: boolean;
  cycleAmount?: number;
  parentOrderCode?: string;
}

const sampleAdminOrders: OrderItem[] = [
  {
    id: 1,
    orderCode: 'ORD-20260820-001',
    customerName: 'Nguyễn Văn An',
    customerEmail: 'an.nguyen@company.vn',
    customerPhone: '0909123456',
    servicePlanName: 'Cloud VPS Pro (2 vCPU, 4GB RAM)',
    billingCycle: 'monthly',
    totalAmount: 249000,
    status: 'Completed',
    createdAt: '2026-08-20T08:30:00Z',
  },
  {
    id: 2,
    orderCode: 'ORD-20260820-002',
    customerName: 'Trần Thị Mai',
    customerEmail: 'mai.tran@startup.io',
    customerPhone: '0988776655',
    servicePlanName: 'Web Hosting LiteSpeed Business',
    billingCycle: 'yearly',
    totalAmount: 990000,
    status: 'Processing',
    createdAt: '2026-08-20T09:15:00Z',
  },
  {
    id: 3,
    orderCode: 'ORD-20260820-003',
    customerName: 'Lê Hoàng Long',
    customerEmail: 'long.le@techcorp.vn',
    customerPhone: '0912334455',
    servicePlanName: 'Cloud VPS Business (4 vCPU, 8GB RAM)',
    billingCycle: 'monthly',
    totalAmount: 499000,
    status: 'Pending',
    createdAt: '2026-08-20T10:00:00Z',
  }
];

type SortField = 'createdAt' | 'totalAmount' | 'none';
type SortDir = 'asc' | 'desc';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | string | null>(null);

  // ---- BỘ LỌC TỐI GIẢN THEO YÊU CẦU ----
  // 1. Tìm kiếm: Tên tài khoản, tên khách hàng, mã đơn hoặc tên gói dịch vụ
  const [searchTerm, setSearchTerm] = useState('');
  // 2. Lọc theo thời gian: Mới nhất -> Cũ nhất hoặc Cũ nhất -> Mới nhất
  const [timeSort, setTimeSort] = useState<'newest' | 'oldest'>('newest');
  // 3. Lọc theo tiền: Cao -> Thấp hoặc Thấp -> Cao hoặc Không sắp xếp
  const [priceSort, setPriceSort] = useState<'none' | 'high_to_low' | 'low_to_high'>('none');
  // 4. Lọc trạng thái
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const loadOrders = async () => {
    setLoading(true);
    const localUserOrders = JSON.parse(localStorage.getItem('user_created_orders') || '[]');
    const localStatuses = JSON.parse(localStorage.getItem('admin_order_status_overrides') || '{}');

    try {
      const res = await fetchApi<any>('/api/Orders');
      let fetched: OrderItem[] = [];
      if (res.data && Array.isArray(res.data.data)) {
        fetched = res.data.data;
      } else if (Array.isArray(res.data)) {
        fetched = res.data;
      }

      // Kết hợp đơn hàng từ hệ thống và đơn do user/editor vừa đặt
      const combined = [...localUserOrders, ...fetched];
      const uniqueMap = new Map();
      combined.forEach((item) => {
        const idKey = item.orderCode || item.id;
        if (!uniqueMap.has(idKey)) {
          uniqueMap.set(idKey, {
            ...item,
            status: localStatuses[item.id] || localStatuses[item.orderCode] || item.status,
          });
        }
      });

      const finalOrders = Array.from(uniqueMap.values());
      if (finalOrders.length > 0) {
        setOrders(finalOrders);
      } else {
        setOrders(
          sampleAdminOrders.map((o) => ({
            ...o,
            status: localStatuses[o.id] || o.status,
          }))
        );
      }
    } catch {
      const combined = [...localUserOrders, ...sampleAdminOrders];
      const uniqueMap = new Map();
      combined.forEach((item) => {
        const idKey = item.orderCode || item.id;
        if (!uniqueMap.has(idKey)) {
          uniqueMap.set(idKey, {
            ...item,
            status: localStatuses[item.id] || localStatuses[item.orderCode] || item.status,
          });
        }
      });
      setOrders(Array.from(uniqueMap.values()));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: number | string, newStatus: string) => {
    setUpdatingId(orderId);

    // TRƯỜNG HỢP 1: Duyệt đơn con chu kỳ (isInstallmentOrder)
    const currentOrder = orders.find(o => (o.id === orderId || o.orderCode === orderId));
    const allOrders: any[] = JSON.parse(localStorage.getItem('user_created_orders') || '[]');

    if (currentOrder?.isInstallmentOrder && currentOrder.parentOrderCode && newStatus === 'Completed') {
      const parentIdx = allOrders.findIndex(o => 
        o.orderCode === currentOrder.parentOrderCode || String(o.id) === currentOrder.parentOrderCode
      );
      if (parentIdx !== -1) {
        const parent = allOrders[parentIdx];
        const paidAmt = currentOrder.cycleAmount || currentOrder.totalAmount;
        const remaining = (parent.remainingAmount ?? parent.totalAmount ?? 0) - paidAmt;
        const nextDueDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

        allOrders[parentIdx] = {
          ...parent,
          remainingAmount: Math.max(0, remaining),
          paidCycles: (parent.paidCycles || 0) + 1,
          nextDueDate: nextDueDate,
          lastPaymentDate: new Date().toISOString()
        };
      }
    }

    // TRƯỜNG HỢP 2: Duyệt đơn gốc trả góp chu kỳ đợt 1 (isPayingInstallment)
    if (currentOrder && (currentOrder as any).isPayingInstallment && newStatus === 'Completed') {
      const targetIdx = allOrders.findIndex(o => o.orderCode === currentOrder.orderCode || o.id === currentOrder.id);
      if (targetIdx !== -1) {
        const item = allOrders[targetIdx];
        const cycleAmt = (item as any).cycleAmount || Math.round(item.totalAmount / ((item as any).totalInstallmentCycles || 4));
        const remaining = (item as any).originalTotalAmount ? ((item as any).originalTotalAmount - cycleAmt) : (item.totalAmount - cycleAmt);
        const nextDueDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

        allOrders[targetIdx] = {
          ...item,
          status: 'Completed',
          remainingAmount: Math.max(0, remaining),
          paidCycles: 1,
          nextDueDate: nextDueDate,
          lastPaymentDate: new Date().toISOString()
        };
      }
    }

    // Lưu lại danh sách orders đã cập nhật
    if (allOrders.length > 0) {
      localStorage.setItem('user_created_orders', JSON.stringify(allOrders));
    }

    try {
      await fetchApi(`/api/Orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      const localStatuses = JSON.parse(localStorage.getItem('admin_order_status_overrides') || '{}');
      localStatuses[orderId] = newStatus;
      localStorage.setItem('admin_order_status_overrides', JSON.stringify(localStatuses));

      setOrders((prev) =>
        prev.map((o) => ((o.id === orderId || o.orderCode === String(orderId)) ? { ...o, status: newStatus } : o))
      );
    } catch {
      const localStatuses = JSON.parse(localStorage.getItem('admin_order_status_overrides') || '{}');
      localStatuses[orderId] = newStatus;
      localStorage.setItem('admin_order_status_overrides', JSON.stringify(localStatuses));

      setOrders((prev) =>
        prev.map((o) => ((o.id === orderId || o.orderCode === String(orderId)) ? { ...o, status: newStatus } : o))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Áp dụng bộ lọc + sắp xếp
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // 1. Tìm kiếm theo: Tên tài khoản, Tên khách hàng, Tên gói dịch vụ, Mã đơn
    if (searchTerm.trim()) {
      const kw = searchTerm.toLowerCase();
      result = result.filter(o =>
        (o.orderCode || '').toLowerCase().includes(kw) ||
        (o.customerName || '').toLowerCase().includes(kw) ||
        (o.username || '').toLowerCase().includes(kw) ||
        (o.customerEmail || '').toLowerCase().includes(kw) ||
        (o.servicePlanName || '').toLowerCase().includes(kw)
      );
    }

    // 2. Lọc trạng thái
    if (filterStatus !== 'ALL') {
      result = result.filter(o => o.status === filterStatus);
    }

    // 3. Sắp xếp theo Tiền hoặc Thời gian
    if (priceSort !== 'none') {
      result.sort((a, b) => {
        return priceSort === 'high_to_low' ? b.totalAmount - a.totalAmount : a.totalAmount - b.totalAmount;
      });
    } else {
      // Sắp xếp theo Thời gian tạo: Mới nhất trước hoặc Cũ nhất trước
      result.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return timeSort === 'newest' ? timeB - timeA : timeA - timeB;
      });
    }

    return result;
  }, [orders, searchTerm, filterStatus, timeSort, priceSort]);

  const cycleOrdersCount = orders.filter(o => o.isInstallmentOrder && o.status === 'Pending').length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge-pill bg-blue-50 text-blue-700 border border-blue-200">Xử Lý Giao Dịch</span>
            {cycleOrdersCount > 0 && (
              <span className="badge-pill bg-amber-50 text-amber-700 border border-amber-200">
                <CircleDollarSign className="w-3.5 h-3.5" />
                {cycleOrdersCount} đơn chu kỳ chờ duyệt
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Quản Lý Đơn Đặt Hàng</h1>
          <p className="text-xs font-semibold text-slate-600 mt-1">Xem toàn bộ đơn hàng, duyệt đơn thanh toán chu kỳ định kỳ và cập nhật trạng thái dịch vụ</p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="btn-pill btn-pill-secondary text-xs self-start"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* ===== THANH BỘ LỌC ĐƠN HÀNG ===== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Bộ Lọc &amp; Sắp Xếp Đơn Hàng</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Thanh tìm kiếm: Tên tài khoản, tên khách hàng hoặc tên gói dịch vụ */}
          <div className="relative">
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
              Tìm theo Tài khoản / Khách hàng / Gói dịch vụ
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nhập tên tài khoản, tên KH hoặc tên gói..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          {/* 2. Lọc theo thời gian: Mới nhất đến cũ nhất hoặc Cũ nhất đến mới nhất */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
              Sắp xếp theo Thời gian
            </label>
            <select
              value={timeSort}
              onChange={(e) => {
                setTimeSort(e.target.value as any);
                setPriceSort('none'); // Ưu tiên sắp xếp theo thời gian
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none font-semibold text-slate-700 cursor-pointer"
            >
              <option value="newest">🕒 Mới nhất đến cũ nhất</option>
              <option value="oldest">🕒 Cũ nhất đến mới nhất</option>
            </select>
          </div>

          {/* 3. Lọc theo giá tiền: Giá từ cao đến thấp hoặc Giá từ thấp đến cao */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
              Sắp xếp theo Giá tiền
            </label>
            <select
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none font-semibold text-slate-700 cursor-pointer"
            >
              <option value="none">-- Không lọc theo giá --</option>
              <option value="high_to_low">💰 Giá tiền: Từ cao đến thấp</option>
              <option value="low_to_high">💰 Giá tiền: Từ thấp đến cao</option>
            </select>
          </div>

          {/* 4. Lọc trạng thái đơn */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
              Trạng thái đơn hàng
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none font-semibold text-slate-700 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="Pending">⏳ Chờ xử lý</option>
              <option value="Processing">🔄 Đang xử lý</option>
              <option value="Completed">✅ Hoàn tất</option>
              <option value="Cancelled">❌ Đã hủy</option>
            </select>
          </div>
        </div>

        {/* Summary kết quả lọc */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Hiển thị <strong className="text-slate-800">{filteredOrders.length}</strong> / {orders.length} đơn hàng
            {(searchTerm || filterStatus !== 'ALL' || priceSort !== 'none' || timeSort !== 'newest') && (
              <button
                onClick={() => { setSearchTerm(''); setFilterStatus('ALL'); setTimeSort('newest'); setPriceSort('none'); }}
                className="ml-3 text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </span>
          <span className="text-slate-400">
            Tổng giá trị: <strong className="text-emerald-700 font-mono">{formatCurrency(filteredOrders.reduce((s, o) => s + o.totalAmount, 0))}</strong>
          </span>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-16 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-3 shadow-sm">
          <ShoppingCart className="h-10 w-10 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Không có đơn hàng nào phù hợp với bộ lọc.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="text-[11px] uppercase font-bold text-slate-500 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4">Mã Đơn</th>
                  <th className="p-4">Khách Hàng</th>
                  <th className="p-4">Gói Dịch Vụ</th>
                  <th className="p-4">Chu Kỳ</th>
                  <th className="p-4 whitespace-nowrap">Tổng Tiền</th>
                  <th className="p-4 whitespace-nowrap">Ngày Tạo</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id || order.orderCode}
                    className={`hover:bg-slate-50 transition-colors ${order.isInstallmentOrder ? 'bg-indigo-50/30 border-l-4 border-indigo-400' : ''}`}
                  >
                    <td className="p-4">
                      <div className="font-mono font-bold text-blue-600">{order.orderCode}</div>
                      {order.isInstallmentOrder && (
                        <div className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 mt-0.5">
                          <CircleDollarSign className="w-3 h-3" /> Đơn Chu Kỳ Định Kỳ
                        </div>
                      )}
                      {order.parentOrderCode && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Đơn gốc: {order.parentOrderCode}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">
                        {order.customerName || (order as any).userName || (order as any).fullName || 'Khách hàng thành viên'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {order.customerEmail || (order as any).email || (order as any).userEmail || 'user@cloudservice.vn'}
                      </div>
                      {order.customerPhone && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          {order.customerPhone}
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      {order.servicePlanName}
                    </td>
                    <td className="p-4">
                      <span className="badge-pill bg-slate-100 text-slate-700">
                        {order.billingCycle === 'yearly'
                          ? '1 Năm (-20%)'
                          : order.billingCycle === 'monthly'
                          ? 'Hàng tháng'
                          : order.billingCycle || 'Hàng tháng'}
                      </span>
                    </td>
                    <td className="p-4">
                      {(order as any).isPayingInstallment ? (
                        <div>
                          <div className="font-mono font-extrabold text-blue-700 text-xs">
                            {formatCurrency((order as any).cycleAmount || Math.round(order.totalAmount / ((order as any).totalInstallmentCycles || 4)))}
                            <span className="text-[10px] font-normal text-blue-600 block">(Đợt 1 / 3 Tháng)</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 line-through">
                            Gốc: {formatCurrency((order as any).originalTotalAmount || order.totalAmount)}
                          </div>
                        </div>
                      ) : (
                        <div className="font-mono font-bold text-slate-900">
                          {formatCurrency(order.totalAmount)}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 font-mono whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="p-4">
                      {order.status === 'Completed' && (
                        <span className="badge-pill bg-emerald-50 text-emerald-700 border border-emerald-200">Hoàn tất</span>
                      )}
                      {order.status === 'Processing' && (
                        <span className="badge-pill bg-blue-50 text-blue-700 border border-blue-200">Đang xử lý</span>
                      )}
                      {order.status === 'Pending' && (
                        <span className="badge-pill bg-amber-50 text-amber-700 border border-amber-200">Chờ xử lý</span>
                      )}
                      {order.status === 'Cancelled' && (
                        <span className="badge-pill bg-rose-50 text-rose-700 border border-rose-200">Đã hủy</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* 1. Nếu là đơn con chu kỳ đang chờ */}
                        {order.isInstallmentOrder && order.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id || order.orderCode, 'Completed')}
                            disabled={updatingId === (order.id || order.orderCode)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors whitespace-nowrap cursor-pointer"
                          >
                            ✓ Duyệt Chu Kỳ
                          </button>
                        )}
                        
                        {/* 2. Nếu là đơn gốc có trả góp chu kỳ (isPayingInstallment) và đang chờ duyệt đợt 1 */}
                        {!order.isInstallmentOrder && (order as any).isPayingInstallment && order.status !== 'Completed' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id || order.orderCode, 'Completed')}
                            disabled={updatingId === (order.id || order.orderCode)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors whitespace-nowrap cursor-pointer"
                            title="Duyệt đợt 1 chu kỳ 3 tháng và kích hoạt gói"
                          >
                            ✓ Duyệt Chu Kỳ Đợt 1
                          </button>
                        )}

                        {/* 3. Nếu là đơn thường thanh toán 100% */}
                        {!order.isInstallmentOrder && !(order as any).isPayingInstallment && order.status !== 'Completed' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Completed')}
                            disabled={updatingId === order.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                          >
                            Kích Hoạt
                          </button>
                        )}

                        {order.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id || order.orderCode, 'Cancelled')}
                            disabled={updatingId === (order.id || order.orderCode)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                          >
                            Hủy
                          </button>
                        )}
                      </div>
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
