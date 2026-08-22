export function formatCurrency(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return '0 ₫';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(num);
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getStatusBadgeClass(status: string): { bg: string; text: string; label: string } {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'paid':
    case 'approved':
    case 'active':
      return { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', label: 'Thành công / Hoạt động' };
    case 'processing':
      return { bg: 'bg-sky-500/10 border-sky-500/20', text: 'text-sky-400', label: 'Đang xử lý' };
    case 'pending':
      return { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', label: 'Chờ duyệt / Chờ thanh toán' };
    case 'cancelled':
    case 'rejected':
    case 'expired':
      return { bg: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-400', label: 'Đã huỷ / Từ chối' };
    default:
      return { bg: 'bg-slate-500/10 border-slate-500/20', text: 'text-slate-400', label: status || 'Không xác định' };
  }
}

/**
 * Tự động sinh đường dẫn ảnh VietQR chuẩn Napas 247
 * App ngân hàng quét sẽ tự động điền STK, Chủ TK, Số tiền và Nội dung chuyển khoản
 * 
 * Ngân hàng: PVcomBank (BIN: 970412)
 * Số TK: 106001823533
 * Chủ TK: NGUYEN PHUONG KIET
 */
export function generateVietQrUrl(params: {
  amount?: number;
  description?: string;
  bankId?: string;
  accountNo?: string;
  accountName?: string;
}): string {
  const bank = params.bankId || 'pvcombank';
  const accNo = params.accountNo || '106001823533';
  const accName = encodeURIComponent(params.accountName || 'NGUYEN PHUONG KIET');
  const amount = Math.max(0, Math.round(params.amount || 0));
  const desc = encodeURIComponent(params.description || 'THANH TOAN CLOUD');

  // Chuẩn API VietQR Quick Link (Template compact2 hoặc qr_only)
  return `https://img.vietqr.io/image/${bank}-${accNo}-compact2.png?amount=${amount}&addInfo=${desc}&accountName=${accName}`;
}
