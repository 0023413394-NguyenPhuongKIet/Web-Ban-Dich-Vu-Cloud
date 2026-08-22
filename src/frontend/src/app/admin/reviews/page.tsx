'use client';

import React, { useEffect, useState } from 'react';
import {
  Star,
  Trash2,
  Search,
  Filter,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
  Award,
  ThumbsUp,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { formatDate } from '@/lib/formatters';

interface ReviewItem {
  id: number | string;
  name: string;
  role: string;
  plan: string;
  rating: number;
  content: string;
  date: string;
  avatar?: string;
  avatarColor?: string;
  isUserSubmitted?: boolean;
  userEmail?: string;
}

const defaultInitialReviews: ReviewItem[] = [
  {
    id: 1,
    name: 'Trần Minh Hoàng',
    role: 'CTO @ FinTech Solution',
    plan: 'Cloud VPS Business',
    avatar: 'TH',
    avatarColor: 'bg-blue-600',
    rating: 5,
    content: 'Chúng tôi chuyển đổi toàn bộ 15 cụm microservices sang Cloud VPS Business của CloudVerse. Tốc độ đọc ghi NVMe vượt trội giúp độ trễ API giảm hơn 40%. Uptime đạt 100% trong 6 tháng qua. Đội ngũ kỹ thuật hỗ trợ cực kỳ chuyên nghiệp!',
    date: '15/08/2026',
    isUserSubmitted: false,
  },
  {
    id: 2,
    name: 'Nguyễn Lê Quỳnh Anh',
    role: 'Lead Architect @ Retail E-commerce',
    plan: 'Cloud VPS Pro',
    avatar: 'QA',
    avatarColor: 'bg-emerald-600',
    rating: 5,
    content: 'Chính sách chiết khấu bậc thang theo năm và thanh toán định kỳ 3 tháng/lần của CloudVerse rất phù hợp khi tối ưu dòng tiền doanh nghiệp. Đặc biệt mã QR thanh toán tích hợp VietQR rất tiện lợi và nhanh gọn.',
    date: '28/07/2026',
    isUserSubmitted: false,
  },
  {
    id: 3,
    name: 'Phạm Đức Thắng',
    role: 'Founder @ ThangTech Media',
    plan: 'Hosting LiteSpeed Pro',
    avatar: 'PT',
    avatarColor: 'bg-violet-600',
    rating: 5,
    content: 'Web Hosting LiteSpeed của CloudVerse kết hợp bộ nhớ đệm LSCache giúp website bán hàng của tôi tải dưới 0.8 giây từ mọi thiết bị. Uptime 100% trong suốt chiến dịch Flash Sale. Cực kỳ hài lòng!',
    date: '10/07/2026',
    isUserSubmitted: false,
  },
  {
    id: 4,
    name: 'Lê Thị Hương Giang',
    role: 'IT Manager @ Logistics Corp',
    plan: 'Cloud VPS Starter',
    avatar: 'HG',
    avatarColor: 'bg-rose-600',
    rating: 5,
    content: 'Hệ thống quản lý vận đơn của chúng tôi hoạt động rất ổn định trên CloudVerse VPS Starter. Chi phí hợp lý, dễ nâng cấp khi cần mở rộng, hỗ trợ kỹ thuật phản hồi trong vòng 10 phút qua Livechat.',
    date: '19/06/2026',
    isUserSubmitted: false,
  },
  {
    id: 5,
    name: 'Ngô Quang Vinh',
    role: 'DevOps Engineer @ SaaS Startup',
    plan: 'Cloud VPS Business',
    avatar: 'QV',
    avatarColor: 'bg-amber-600',
    rating: 5,
    content: 'Tôi đã trải nghiệm nhiều nhà cung cấp VPS khác nhau, CloudVerse nổi bật hẳn về tốc độ IOPS NVMe và độ ổn định mạng. Cổng quản trị trực quan, API đầy đủ, tích hợp Terraform được ngay.',
    date: '04/06/2026',
    isUserSubmitted: false,
  },
  {
    id: 6,
    name: 'Võ Thị Minh Châu',
    role: 'CEO @ HealthTech Clinic',
    plan: 'Hosting LiteSpeed Basic',
    avatar: 'MC',
    avatarColor: 'bg-teal-600',
    rating: 5,
    content: 'Bệnh viện tư nhân chúng tôi cần một hosting đáng tin cậy để chạy phần mềm đặt lịch khám. CloudVerse Hosting LiteSpeed Basic đáp ứng hoàn toàn yêu cầu. Dữ liệu backup tự động hàng ngày, bảo mật SSL, rất an tâm.',
    date: '22/05/2026',
    isUserSubmitted: false,
  },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<number | 'ALL'>('ALL');
  const [currentRole, setCurrentRole] = useState<string>('');

  useEffect(() => {
    setCurrentRole(localStorage.getItem('role') || 'Admin');
    loadReviews();
  }, []);

  const loadReviews = () => {
    try {
      const stored = localStorage.getItem('cloudverse_customer_reviews');
      if (stored) {
        setReviews(JSON.parse(stored));
      } else {
        localStorage.setItem('cloudverse_customer_reviews', JSON.stringify(defaultInitialReviews));
        setReviews(defaultInitialReviews);
      }
    } catch {
      setReviews(defaultInitialReviews);
    }
  };

  const handleDelete = (id: number | string, authorName: string) => {
    const confirm = window.confirm(`Bạn có chắc chắn muốn xóa đánh giá của khách hàng "${authorName}"? Thao tác này không thể hoàn tác.`);
    if (!confirm) return;

    const updated = reviews.filter((r) => r.id !== id);
    setReviews(updated);
    localStorage.setItem('cloudverse_customer_reviews', JSON.stringify(updated));
  };

  const filteredReviews = reviews.filter((r) => {
    const matchRating = filterRating === 'ALL' || r.rating === filterRating;
    const matchSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchRating && matchSearch;
  });

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6">
      
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Star className="w-5 h-5 fill-amber-400" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Quản Lý Đánh Giá &amp; Testimonials
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kiểm duyệt và quản lý các phản hồi thực tế từ khách hàng (Quyền truy cập: Admin &amp; Editor)
          </p>
        </div>

        <button
          onClick={loadReviews}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-sm transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Làm Mới</span>
        </button>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Số Đánh Giá</div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono mt-1">{reviews.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Đang hiển thị trên trang Khách Hàng</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Điểm Đánh Giá TB</div>
          <div className="text-3xl font-extrabold text-amber-500 font-mono mt-1 flex items-center gap-1.5">
            <span>{averageRating}</span>
            <Star className="w-6 h-6 fill-amber-400 text-amber-400 inline" />
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-semibold">Tỷ lệ hài lòng 99.9%</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Người Dùng Soạn Gửi</div>
          <div className="text-3xl font-extrabold text-blue-600 font-mono mt-1">
            {reviews.filter((r) => r.isUserSubmitted).length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Gửi trực tuyến từ website</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, chức danh, gói dịch vụ hoặc nội dung..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Lọc sao:</span>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="ALL">Tất cả số sao</option>
            <option value="5">5 Sao ★★★★★</option>
            <option value="4">4 Sao ★★★★☆</option>
            <option value="3">3 Sao ★★★☆☆</option>
            <option value="2">2 Sao ★★☆☆☆</option>
            <option value="1">1 Sao ★☆☆☆☆</option>
          </select>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">Không tìm thấy đánh giá nào phù hợp</p>
            <p className="text-xs text-slate-400 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bỏ bộ lọc</p>
          </div>
        ) : (
          filteredReviews.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                {/* Author Info + Rating */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className={`w-9 h-9 rounded-xl ${r.avatarColor || 'bg-blue-600'} text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm`}>
                    {r.avatar || r.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{r.name}</span>
                      {r.isUserSubmitted && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                          Khách Hàng Mới
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {r.role} • {r.userEmail && <span className="text-slate-400">({r.userEmail}) • </span>}
                      <span className="text-slate-400">{r.date}</span>
                    </div>
                  </div>

                  <div className="ml-auto sm:ml-0 flex items-center gap-0.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-amber-700 ml-1">{r.rating}.0</span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                    {r.plan}
                  </span>
                </div>

                {/* Content */}
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  "{r.content}"
                </p>
              </div>

              {/* Action */}
              <div className="flex sm:flex-col items-center justify-end gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDelete(r.id, r.name)}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Xóa đánh giá tiêu cực hoặc không hợp lệ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Đánh Giá</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
