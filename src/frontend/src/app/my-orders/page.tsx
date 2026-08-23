'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Package, 
  QrCode, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Server, 
  Calendar, 
  CreditCard, 
  Sparkles, 
  ShoppingBag, 
  X,
  BellRing,
  Check,
  CircleDollarSign,
  RefreshCw
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { formatCurrency, formatDate, generateVietQrUrl } from '@/lib/formatters';

interface OrderItem {
  id: number;
  orderCode?: string;
  servicePlanName?: string;
  planName?: string;
  totalAmount?: number;
  totalPrice?: number;
  billingCycle?: string;
  status: string;
  createdAt: string;
  qrCodeUrl?: string;
  customerName?: string;
  customerEmail?: string;
  // Các trường cho đơn chu kỳ (installment)
  isInstallmentOrder?: boolean;
  isPayingInstallment?: boolean;
  cycleAmount?: number;             // Số tiền mỗi kỳ
  totalCycles?: number;             // Tổng số kỳ
  totalInstallmentCycles?: number;  // Tổng số kỳ trả góp
  paidCycles?: number;              // Số kỳ đã thanh toán
  remainingAmount?: number;         // Tiền còn lại chưa thanh toán
  originalTotalAmount?: number;     // Tổng gốc trước khi trả góp
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQrOrder, setSelectedQrOrder] = useState<OrderItem | null>(null);

  // Thông báo đơn đến hạn
  const [dueOrderNotice, setDueOrderNotice] = useState<OrderItem | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    const currentUsername = (localStorage.getItem('username') || '').trim().toLowerCase();
    const localStatuses = JSON.parse(localStorage.getItem('admin_order_status_overrides') || '{}');

    // Lấy tất cả đơn local (chỉ của user hiện tại) - dùng để merge thông tin chu kỳ trả góp vào đơn backend
    const allLocalOrders: any[] = JSON.parse(localStorage.getItem('user_created_orders') || '[]');
    const userLocalOrders = allLocalOrders.filter((o) => {
      if (!currentUsername) return false;
      const orderUser = (o.username || '').trim().toLowerCase();
      const orderCust = (o.customerName || '').trim().toLowerCase();
      return orderUser === currentUsername || orderCust === currentUsername;
    });

    try {
      const res = await fetchApi<any>('/api/Orders/my-orders');
      let fetchedData: any[] = [];
      if (Array.isArray(res.data)) {
        fetchedData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        fetchedData = res.data.data;
      }

      // ✅ CHIẾN LƯỢC: Backend thành công → chỉ hiển thị đơn từ backend
      // Merge thêm thông tin trả góp (remainingAmount, cycleAmount,...) từ localStorage vào đơn tương ứng
      const finalOrders = fetchedData.map((backendOrder: any) => {
        // Tìm bản ghi local tương ứng theo id hoặc orderCode để lấy thông tin trả góp chi tiết
        const localMatch = userLocalOrders.find((l: any) =>
          String(l.id) === String(backendOrder.id) ||
          (l.orderCode && l.orderCode === backendOrder.orderCode)
        );

        const merged = {
          ...backendOrder,
          status: localStatuses[backendOrder.id] || localStatuses[backendOrder.orderCode] || backendOrder.status,
        };

        // Nếu có bản ghi local với thông tin trả góp phong phú hơn thì merge vào
        if (localMatch) {
          if (localMatch.remainingAmount !== undefined && merged.remainingAmount === undefined) merged.remainingAmount = localMatch.remainingAmount;
          if (localMatch.originalTotalAmount !== undefined && merged.originalTotalAmount === undefined) merged.originalTotalAmount = localMatch.originalTotalAmount;
          if (localMatch.paidCycles !== undefined && merged.paidCycles === undefined) merged.paidCycles = localMatch.paidCycles;
          if (localMatch.totalInstallmentCycles !== undefined && merged.totalInstallmentCycles === undefined) merged.totalInstallmentCycles = localMatch.totalInstallmentCycles;
          if (localMatch.cycleAmount !== undefined && merged.cycleAmount === undefined) merged.cycleAmount = localMatch.cycleAmount;
          if (localMatch.isPayingInstallment !== undefined && merged.isPayingInstallment === undefined) merged.isPayingInstallment = localMatch.isPayingInstallment;
        }

        return merged;
      });

      setOrders(finalOrders);

      // Quét đơn hàng trả góp chu kỳ để hiển thị banner nhắc hẹn
      const pendingCycleOrder = finalOrders.find(o => o.isInstallmentOrder && o.status === 'Pending');
      
      const now = new Date();

      const dueOrder = finalOrders.find(o => {
        if (o.isInstallmentOrder) return false;
        if (o.status === 'Cancelled') return false;
        if (o.remainingAmount === 0 && o.isPayingInstallment) return false;

        const latestCompletedCycle = finalOrders.find(
          c => c.isInstallmentOrder && c.status === 'Completed' && (c as any).parentOrderCode === (o.orderCode || String(o.id))
        );

        const baseDate = latestCompletedCycle ? new Date(latestCompletedCycle.createdAt) : new Date(o.createdAt);
        const nextDueDate = (o as any).nextDueDate 
          ? new Date((o as any).nextDueDate) 
          : new Date(baseDate.getTime() + 90 * 24 * 60 * 60 * 1000);

        const isDue = now >= nextDueDate;
        const hasInstallment = o.isPayingInstallment || (o.remainingAmount !== undefined && o.remainingAmount > 0);
        return hasInstallment && isDue;
      });

      if (dueOrder && !pendingCycleOrder) {
        setDueOrderNotice(dueOrder);
      } else {
        setDueOrderNotice(null);
      }
    } catch {
      // ❌ Backend lỗi → fallback dùng localStorage (chỉ khi không kết nối được server)
      setOrders(
        userLocalOrders.map((o) => ({
          ...o,
          status: localStatuses[o.id] || localStatuses[o.orderCode] || o.status
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Tính số tiền chu kỳ 3 tháng của đơn
  const getCycleAmount = (order: OrderItem) => {
    if (order.cycleAmount && order.cycleAmount > 0) return order.cycleAmount;
    const total = order.originalTotalAmount || order.totalAmount || order.totalPrice || 2390400;
    const cycles = order.totalInstallmentCycles || 4;
    return Math.round(total / cycles);
  };

  // Khi bấm "Thanh Toán Ngay" từ banner nhắc hẹn -> tạo đơn thanh toán chu kỳ mới vào localStorage để admin duyệt
  const handlePayCycleNow = (dueOrder: OrderItem) => {
    const cycleAmt = getCycleAmount(dueOrder);
    const cycleOrderCode = `CYC-${dueOrder.orderCode || dueOrder.id}-${Date.now().toString().slice(-6)}`;
    const username = localStorage.getItem('username') || '';
    const email = localStorage.getItem('email') || dueOrder.customerEmail || '';

    // Tạo đơn thanh toán chu kỳ
    const cycleOrder: OrderItem = {
      id: Date.now(),
      orderCode: cycleOrderCode,
      customerName: dueOrder.customerName || username,
      customerEmail: email,
      servicePlanName: `[THANH TOÁN CHU KỲ] ${dueOrder.servicePlanName || dueOrder.planName || 'Cloud VPS Pro'}`,
      billingCycle: 'Chu Kỳ 3 Tháng/Lần',
      totalAmount: cycleAmt,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      isInstallmentOrder: true,
      cycleAmount: cycleAmt,
    };

    // Lưu vào localStorage để hiển thị bên quản trị
    const allOrders: any[] = JSON.parse(localStorage.getItem('user_created_orders') || '[]');
    allOrders.unshift({
      ...cycleOrder,
      username,
      parentOrderCode: dueOrder.orderCode || String(dueOrder.id),
      note: `Đơn thanh toán chu kỳ 3 tháng cho đơn gốc ${dueOrder.orderCode || dueOrder.id}. Số tiền kỳ này: ${formatCurrency(cycleAmt)}.`
    });
    localStorage.setItem('user_created_orders', JSON.stringify(allOrders));

    // Cập nhật lại state để ẩn banner nhắc hẹn vì đã tạo đơn chờ duyệt
    setDueOrderNotice(null);
    loadOrders();

    // Hiện popup QR để thanh toán
    setSelectedQrOrder({
      ...dueOrder,
      orderCode: cycleOrderCode,
      totalAmount: cycleAmt,
      isInstallmentOrder: true
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Active':
        return (
          <span className="badge-pill bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã Kích Hoạt (Hoàn Tất)
          </span>
        );
      case 'Processing':
        return (
          <span className="badge-pill bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" /> Đang Xử Lý
          </span>
        );
      case 'Cancelled':
        return (
          <span className="badge-pill bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Đã Hủy
          </span>
        );
      default:
        return (
          <span className="badge-pill bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" /> Chờ Kích Hoạt
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Cổng Khách Hàng
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Đơn Hàng &amp; Dịch Vụ Của Tôi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi tiến độ kích hoạt, chu kỳ trả góp 3 tháng/đợt và gia hạn dịch vụ đám mây.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadOrders}
            className="btn-pill btn-pill-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Làm mới
          </button>
          <Link
            href="/services"
            className="btn-pill btn-pill-primary text-xs"
          >
            <Sparkles className="w-4 h-4" />
            Thuê Thêm Gói Mới
          </Link>
        </div>
      </div>

      {/* BANNER CẢNH BÁO ĐẾN HẠN THANH TOÁN CHU KỲ */}
      {dueOrderNotice && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/10 border-2 border-amber-400 text-slate-900 shadow-md animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/30 animate-bounce">
                <BellRing className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-wide">
                    Đến Hạn Hôm Nay
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-mono">
                    Đơn hàng: {dueOrderNotice.orderCode || `#ORD-${dueOrderNotice.id}`}
                  </span>
                </div>
                
                <h3 className="text-base font-extrabold text-slate-900">
                  Nhắc Hẹn Thanh Toán Chu Kỳ Đợt Kế Tiếp (3 Tháng/Lần)
                </h3>
                
                <p className="text-xs text-slate-600 leading-relaxed">
                  Gói dịch vụ <strong className="text-slate-900">{dueOrderNotice.servicePlanName || 'Cloud VPS Pro'}</strong> của bạn đã tới hạn thanh toán đợt tiếp theo để duy trì dịch vụ liên tục.
                </p>

                <div className="text-xs font-bold text-amber-900 pt-1 flex items-center gap-1.5">
                  <span>👉 Số tiền chu kỳ này cần thanh toán:</span>
                  <span className="text-lg font-mono font-extrabold text-rose-600">
                    {formatCurrency(Math.round((dueOrderNotice.totalAmount || 2390400) / 4))}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 pt-0.5">
                  Ấn "Thanh Toán Ngay" để tạo đơn thanh toán chu kỳ và chờ admin xác nhận. Sau khi duyệt, số tiền sẽ được trừ vào tổng dịch vụ còn lại.
                </p>
              </div>
            </div>

            {/* DUY NHẤT 1 NÚT: THANH TOÁN NGAY */}
            <div className="flex items-center flex-shrink-0 sm:self-center">
              <button
                type="button"
                onClick={() => handlePayCycleNow(dueOrderNotice)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <QrCode className="w-5 h-5" />
                <span>Thanh Toán Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 rounded-3xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Chưa Có Đơn Hàng Nào</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Bạn chưa đăng ký dịch vụ máy chủ nào trên hệ thống. Hãy chọn gói Cloud VPS hoặc Hosting để bắt đầu.
          </p>
          <Link
            href="/services"
            className="btn-pill btn-pill-primary text-xs inline-flex"
          >
            Khám Phá Bảng Giá Dịch Vụ
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id || order.orderCode}
              className={`p-6 sm:p-7 rounded-3xl bg-white border shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-6 ${
                order.isInstallmentOrder 
                  ? 'border-blue-200 bg-blue-50/30' 
                  : 'border-slate-200/90'
              }`}
            >
              {/* Left Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    {order.orderCode || `#ORD-${order.id}`}
                  </span>
                  {order.isInstallmentOrder && (
                    <span className="badge-pill bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px]">
                      <CircleDollarSign className="w-3 h-3" /> Thanh Toán Chu Kỳ
                    </span>
                  )}
                  {getStatusBadge(order.status)}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {order.servicePlanName || order.planName || 'Gói Máy Chủ Cloud VPS Pro'}
                </h3>

                <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {formatDate(order.createdAt)}
                  </span>
                  {order.billingCycle && (
                    <span className="flex items-center gap-1.5 font-medium bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                      <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                      {order.billingCycle}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Price & Actions */}
              <div className="flex items-center sm:flex-col sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">
                    {formatCurrency(order.totalAmount ?? order.totalPrice ?? 0)}
                  </div>
                  {order.remainingAmount !== undefined && order.remainingAmount > 0 && (
                    <div className="text-[11px] text-amber-700 font-semibold mt-0.5">
                      Còn lại cần trả: <strong className="font-mono text-rose-600">{formatCurrency(order.remainingAmount)}</strong>
                    </div>
                  )}
                  {order.remainingAmount === 0 && order.isPayingInstallment && (
                    <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                      ✓ Đã thanh toán dứt điểm
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedQrOrder(order)}
                  className="btn-pill btn-pill-secondary text-xs flex items-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-blue-600" />
                  Mã QR Thanh Toán
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODAL POPUP QUÉT MÃ QR THANH TOÁN */}
      {selectedQrOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-100 shadow-2xl space-y-6 relative">
            
            <button
              onClick={() => setSelectedQrOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Thanh Toán Đơn Hàng
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {selectedQrOrder.orderCode || `#ORD-${selectedQrOrder.id}`}
              </p>
              {selectedQrOrder.isInstallmentOrder && (
                <p className="text-xs text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded-full inline-block mt-1">
                  Đơn thanh toán chu kỳ 3 tháng — Chờ admin duyệt
                </p>
              )}
            </div>

            {/* QR View */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="p-2 bg-white rounded-xl border border-slate-200 inline-block shadow-sm">
                <img
                  src={generateVietQrUrl({
                    amount: selectedQrOrder.totalAmount ?? selectedQrOrder.totalPrice ?? 0,
                    description: `TT ${selectedQrOrder.orderCode || selectedQrOrder.id}`,
                    bankId: 'pvcombank',
                    accountNo: '106001823533',
                    accountName: 'NGUYEN PHUONG KIET'
                  })}
                  alt="VietQR Chuyển Khoản"
                  className="w-48 h-auto mx-auto rounded-lg"
                />
              </div>

              <div className="text-xs text-slate-600 font-medium space-y-0.5">
                <p>Số tiền: <strong className="text-emerald-600 font-bold font-mono text-sm">{formatCurrency(selectedQrOrder.totalAmount ?? selectedQrOrder.totalPrice ?? 0)}</strong></p>
                <p>Ngân hàng: <strong>PVcomBank</strong> • STK: <strong className="font-mono text-slate-800">1060 0182 3533</strong></p>
                <p>Chủ tài khoản: <strong>NGUYỄN PHƯƠNG KIỆT</strong></p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedQrOrder(null)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Đã Hoàn Tất Chuyển Khoản
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
