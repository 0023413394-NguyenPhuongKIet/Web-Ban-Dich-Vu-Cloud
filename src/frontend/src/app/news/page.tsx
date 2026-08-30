'use client';

import React, { useEffect, useState } from 'react';
import { 
  Newspaper, 
  Eye, 
  Calendar, 
  Tag, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  X, 
  Share2, 
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { formatDate } from '@/lib/formatters';

interface ArticleItem {
  id: number;
  title: string;
  slug?: string;
  summary: string;
  content: string;
  category: string;
  thumbnailUrl: string;
  viewCount: number;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
}

const initialArticles: ArticleItem[] = [
  {
    id: 1,
    title: 'CloudVerse Chính Thức Nâng Cấp Hệ Thống Ổ Cứng NVMe U.2 Enterprise 2026',
    slug: 'nang-cap-nvme-enterprise-2026',
    summary: 'Tối ưu hóa tốc độ truy xuất cơ sở dữ liệu và khả năng chịu tải cho hàng chục ngàn máy chủ ảo đám mây.',
    content: `## 1. Giới thiệu công nghệ NVMe U.2 Enterprise
Ổ cứng NVMe U.2 mang lại băng thông vượt trội lên tới 7000MB/s, nhanh gấp 10 lần so với ổ SSD SATA truyền thống.

### 2. Các lợi ích chính đối với khách hàng:
- **Tốc độ đọc/ghi IOPS:** Đạt hơn 500.000 IOPS giúp website tải trang dưới 0.5 giây.
- **Độ trễ thấp:** Giảm thiểu nghẽn cổ chai khi xử lý cơ sở dữ liệu MySQL / PostgreSQL lớn.
- **Độ tin cậy cao:** Trang bị công nghệ chống mất điện đột ngột (Power Loss Protection).

### 3. Lộ trình nâng cấp miễn phí
Tất cả khách hàng đang sử dụng gói Cloud VPS Pro và Cloud VPS Business sẽ được nâng cấp hạ tầng tự động hoàn toàn miễn phí mà không gián đoạn dịch vụ.`,
    category: 'HDKT',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
    viewCount: 1540,
    isPublished: true,
    publishedAt: '2026-08-18T08:00:00Z',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 2,
    title: 'Hướng Dẫn Cấu Hình Bảo Vệ Anti-DDoS Đa Lớp Cho Website Thương Mại Điện Tử',
    slug: 'huong-dan-bao-ve-anti-ddos',
    summary: 'Cách thiết lập hệ thống tường lửa WAF và chống tấn công Layer 7 giúp website luôn vận hành ổn định 24/7.',
    content: `## 1. Tổng quan về tấn công DDoS
Tấn công từ chối dịch vụ phân tán (DDoS) là mối đe dọa hàng đầu đối với các nền tảng bán hàng trực tuyến trong mùa cao điểm.

### 2. Các bước triển khai Anti-DDoS tại CloudVerse:
- **Kích hoạt WAF Layer 7:** Tự động phát hiện và chặn các cuộc tấn công HTTP Flood, Slowloris và SQL Injection.
- **Hệ thống Anycast DNS:** Phân tán lưu lượng truy cập tới 12 cụm máy chủ toàn cầu.
- **Giới hạn Rate Limit:** Thiết lập ngưỡng truy vấn tối đa cho mỗi IP khách hàng.`,
    category: 'HDKT',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
    viewCount: 890,
    isPublished: true,
    publishedAt: '2026-08-16T10:30:00Z',
    createdAt: '2026-08-16T10:30:00Z',
  },
  {
    id: 3,
    title: 'Bùng Nổ Khuyến Mãi Cloud VPS SSD Giảm 50% Trọn Đời Năm 2026',
    slug: 'bung-no-khuyen-mai-cloud-vps-50',
    summary: 'Nhận ngay ưu đãi giảm 50% trọn đời khi đăng ký gói Cloud VPS Pro hoặc Business tại hệ thống CloudVerse.',
    content: `## Chương trình siêu ưu đãi năm 2026
- **Giảm 50%** chi phí chu kỳ thanh toán theo năm.
- **Tặng miễn phí:** Chứng chỉ bảo mật SSL cao cấp và Backup tự động hàng tuần.
- **Mã voucher:** CLOUD50 áp dụng đến hết tháng này.`,
    category: 'KhuyenMai',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800',
    viewCount: 3420,
    isPublished: true,
    publishedAt: '2026-08-15T09:30:00Z',
    createdAt: '2026-08-15T09:30:00Z',
  },
  {
    id: 4,
    title: 'Thông Báo Lịch Bảo Trì Định Kỳ Và Nâng Cấp Cổng Mạng Quốc Tế 100Gbps',
    slug: 'thong-bao-bao-tri-nang-cap-mang',
    summary: 'Thông báo lịch bảo trì nâng cấp đường truyền viễn thông định kỳ nhằm nâng cao chất lượng dịch vụ máy chủ.',
    content: `## 1. Thời gian bảo trì
- **Bắt đầu:** 01:00 AM Chủ Nhật.
- **Hoàn tất:** 03:00 AM Chủ Nhật.

### 2. Phạm vi ảnh hưởng
Các cụm máy chủ Region HCM có thể có độ trễ nhẹ từ 5-10 phút. Hệ thống lưu trữ và dữ liệu khách hàng được bảo toàn tuyệt đối 100%.`,
    category: 'ThongBao',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800',
    viewCount: 650,
    isPublished: true,
    publishedAt: '2026-08-14T11:00:00Z',
    createdAt: '2026-08-14T11:00:00Z',
  },
  {
    id: 5,
    title: 'Xu Hướng Điện Toán Đám Mây Và Trí Tuệ Nhân Tạo (AI Cloud) Năm 2026',
    slug: 'xu-huong-dien-toan-dam-may-ai-2026',
    summary: 'Phân tích sự bùng nổ của hạ tầng GPU Cloud và mô hình Zero Trust Security trong kỷ nguyên chuyển đổi số.',
    content: `## 1. Xu hướng AI Native Cloud
Các doanh nghiệp đang tích cực chuyển dịch hệ thống sang đám mây tích hợp GPU chuyên dụng cho việc huấn luyện và chạy suy luận mô hình AI.

### 2. Mô hình bảo mật Zero Trust
Nguyên tắc cốt lõi: Không tin tưởng bất kỳ kết nối nào dù bên trong hay bên ngoài mạng nội bộ, luôn luôn xác thực danh tính qua JWT và MFA.`,
    category: 'TinTuc',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    viewCount: 2890,
    isPublished: true,
    publishedAt: '2026-08-12T14:20:00Z',
    createdAt: '2026-08-12T14:20:00Z',
  },
  {
    id: 6,
    title: 'Thông Báo Chính Thức Ra Mắt Chương Trình Đối Tác Tiếp Thị Liên Kết Affiliate 20%',
    slug: 'ra-mat-chuong-trinh-affiliate-2026',
    summary: 'Hợp tác phát triển cùng CloudVerse với mức hoa hồng trọn đời lên đến 20% cho mỗi khách hàng giới thiệu thành công.',
    content: `## 1. Cơ chế hoa hồng hấp dẫn
- Nhận ngay **20%** doanh thu định kỳ khi khách hàng gia hạn dịch vụ.
- Đối soát tự động, thanh toán minh bạch vào ngày 15 hàng tháng qua tài khoản ngân hàng.

### 2. Đăng ký tham gia
Truy cập trang Đối tác Affiliate để nộp hồ sơ xét duyệt chỉ trong 24 giờ.`,
    category: 'ThongBao',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
    viewCount: 1120,
    isPublished: true,
    publishedAt: '2026-08-10T16:00:00Z',
    createdAt: '2026-08-10T16:00:00Z',
  },
  {
    id: 7,
    title: 'Top 5 Tiêu Chí Lựa Chọn Gói Web Hosting Tối Ưu Cho Doanh Nghiệp Mới Bắt Đầu',
    slug: 'top-5-tieu-chi-chon-web-hosting',
    summary: 'Hướng dẫn lựa chọn dung lượng NVMe, băng thông và máy chủ web LiteSpeed phù hợp với quy mô website.',
    content: `## 5 Tiêu chí quan trọng khi mua Hosting:
1. **Ổ cứng NVMe:** Đảm bảo tốc độ đọc ghi nhanh gấp 5-10 lần SSD SATA.
2. **Web Server LiteSpeed:** Tương thích hoàn hảo với WordPress và plugin LSCache.
3. **Sao lưu dữ liệu:** Backup tự động hàng ngày.
4. **Chứng chỉ SSL:** Miễn phí trọn đời.
5. **Hỗ trợ 24/7:** Kỹ thuật viên xử lý sự cố trong vòng 15 phút.`,
    category: 'TinTuc',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    viewCount: 1980,
    isPublished: true,
    publishedAt: '2026-08-08T09:00:00Z',
    createdAt: '2026-08-08T09:00:00Z',
  }
];

const categoryList = [
  { id: 'ALL', name: 'Tất Cả' },
  { id: 'HDKT', name: 'Hướng Dẫn Kỹ Thuật' },
  { id: 'KhuyenMai', name: 'Khuyến Mãi' },
  { id: 'ThongBao', name: 'Thông Báo' },
  { id: 'TinTuc', name: 'Tin Tức' },
];

export default function NewsPage() {
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 4; // 4 bài viết / trang

  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);

  // Helper: lưu lượt xem vào localStorage
  const saveViewCount = (articleId: number, count: number) => {
    try {
      const saved = JSON.parse(localStorage.getItem('news_view_counts') || '{}') as Record<number, number>;
      saved[articleId] = count;
      localStorage.setItem('news_view_counts', JSON.stringify(saved));
    } catch {}
  };

  // Helper: merge view count từ localStorage vào danh sách bài viết
  const mergeViewCounts = (list: ArticleItem[]): ArticleItem[] => {
    try {
      const saved = JSON.parse(localStorage.getItem('news_view_counts') || '{}') as Record<number, number>;
      if (Object.keys(saved).length === 0) return list;
      return list.map((a) => saved[a.id] !== undefined ? { ...a, viewCount: saved[a.id] } : a);
    } catch {
      return list;
    }
  };

  useEffect(() => {
    async function loadNews() {
      try {
        const res = await fetchApi<any>('/api/NewsArticles?pageSize=50');
        let fetched: ArticleItem[] = [];
        if (res.data && Array.isArray(res.data.items)) {
          fetched = res.data.items;
        } else if (Array.isArray(res.data)) {
          fetched = res.data;
        }
        
        if (fetched.length > 0) {
          // Lọc chỉ hiển thị các bài viết đã xuất bản (isPublished) từ CSDL
          const publishedFetched = fetched.filter((item) => item.isPublished !== false);
          
          const normalizedFetched = publishedFetched.map((item, idx) => ({
            ...item,
            id: item.id || 1000 + idx,
            category: (item.category || 'TinTuc').trim(),
            thumbnailUrl: item.thumbnailUrl || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
          }));

          // Đồng bộ chính xác 100% với CSDL Backend / Trang quản trị Admin
          setArticles(mergeViewCounts(normalizedFetched));
        } else {
          // Chỉ dùng dữ liệu mẫu khi CSDL rỗng hoàn toàn
          setArticles(mergeViewCounts(initialArticles));
        }
      } catch {
        // Merge view count từ localStorage vào fallback
        setArticles(mergeViewCounts(initialArticles));
      }
    }
    loadNews();
  }, []);

  // Xử lý đọc bài viết và TỰ ĐỘNG TĂNG LƯỢT XEM
  const handleOpenArticle = (item: ArticleItem) => {
    const updatedView = item.viewCount + 1;
    setSelectedArticle({ ...item, viewCount: updatedView });

    // Tự động tăng lượt xem trong state
    setArticles((prev) =>
      prev.map((a) => (a.id === item.id || a.title === item.title ? { ...a, viewCount: updatedView } : a))
    );

    // Lưu lượt xem vào localStorage để giữ sau khi reload trang
    saveViewCount(item.id, updatedView);

    // Gửi request API tăng view nếu có slug
    if (item.slug) {
      fetchApi(`/api/NewsArticles/slug/${item.slug}`).catch(() => {});
    }
  };

  // Chuẩn hóa so khớp danh mục
  const normalizeCat = (cat: string) => {
    const c = (cat || '').toLowerCase().replace(/[\s-_/]/g, '');
    if (c.includes('hdkt') || c.includes('huongdan') || c.includes('kythuat')) return 'HDKT';
    if (c.includes('khuyenmai') || c.includes('uudai') || c.includes('giamgia')) return 'KhuyenMai';
    if (c.includes('thongbao') || c.includes('baotri')) return 'ThongBao';
    return 'TinTuc';
  };

  // Lọc theo Danh mục & Tìm kiếm
  const filteredArticles = articles.filter((a) => {
    const catCode = normalizeCat(a.category);
    const matchesCat = selectedCategory === 'ALL' || catCode === selectedCategory;
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Phân trang
  const totalPages = Math.ceil(filteredArticles.length / pageSize) || 1;
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-10 pb-16">
      
      {/* Header With Background Image */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-slate-900 border-b border-slate-800 text-white">
        {/* Background Image Container */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transform scale-105"
          style={{ 
            backgroundImage: "url('/images/news-banner.webp')",
            backgroundPosition: 'center 45%'
          }}
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-blue-950/80 backdrop-blur-[0.5px]" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold backdrop-blur-md">
            <Newspaper className="w-3.5 h-3.5" />
            <span>Tin Tức & Kiến Thức Máy Chủ</span>
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Cẩm Nang Công Nghệ Cloud
          </h1>
          <p className="text-sm font-normal text-slate-200 leading-relaxed max-w-xl mx-auto">
            Cập nhật tin tức hạ tầng, hướng dẫn kỹ thuật cài đặt Nginx/Docker và chương trình ưu đãi mới nhất.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          {categoryList.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentPage(1);
                }}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="flex items-center justify-between gap-4 max-w-xl mx-auto bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết theo từ khóa..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-transparent text-xs font-medium text-slate-900 outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Article Grid */}
      {paginatedArticles.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-sm">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Không tìm thấy bài viết nào trong chuyên mục này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginatedArticles.map((item, index) => {
            const uniqueKey = `art-${item.id}-${index}-${item.title.slice(0, 10)}`;
            const catCode = normalizeCat(item.category);
            const catName = catCode === 'HDKT' ? 'Hướng Dẫn Kỹ Thuật' : catCode === 'KhuyenMai' ? 'Khuyến Mãi' : catCode === 'ThongBao' ? 'Thông Báo' : 'Tin Tức';
            
            return (
              <article
                key={uniqueKey}
                onClick={() => handleOpenArticle(item)}
                className="rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all flex flex-col justify-between overflow-hidden group cursor-pointer"
              >
                {/* Thumbnail Image */}
                <div className="relative h-52 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 badge-pill bg-white/90 backdrop-blur-md text-slate-800 font-bold shadow-sm text-[10px]">
                    {catName}
                  </span>
                </div>

                <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(item.publishedAt || item.createdAt)}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        <Eye className="w-3.5 h-3.5" />
                        {item.viewCount.toLocaleString()} lượt xem
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed font-medium">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Đọc Bài Viết <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* PHÂN TRANG (PAGINATION) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                currentPage === pageNum
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* POPUP MODAL ĐỌC BÀI VIẾT */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="badge-pill bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedArticle.category === 'HDKT' ? 'Hướng Dẫn Kỹ Thuật' : selectedArticle.category === 'KhuyenMai' ? 'Khuyến Mãi' : selectedArticle.category === 'ThongBao' ? 'Thông Báo' : 'Tin Tức'}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 leading-tight">
                  {selectedArticle.title}
                </h2>
                <div className="flex items-center gap-4 text-xs text-slate-400 font-medium mt-2">
                  <span>📅 {formatDate(selectedArticle.publishedAt || selectedArticle.createdAt)}</span>
                  <span className="text-blue-600 font-semibold">👁️ {selectedArticle.viewCount} lượt xem</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedArticle(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden h-64 w-full bg-slate-100 shadow-sm">
              <img
                src={selectedArticle.thumbnailUrl}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs font-semibold text-slate-700 leading-relaxed italic">
              "{selectedArticle.summary}"
            </div>

            <div className="prose prose-sm max-w-none text-slate-800 text-xs leading-relaxed space-y-4 whitespace-pre-line font-normal">
              {selectedArticle.content}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Đã sao chép liên kết bài viết thành công!');
                }}
                className="btn-pill btn-pill-secondary text-xs flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" /> Chia Sẻ Bài Viết
              </button>

              <button
                onClick={() => setSelectedArticle(null)}
                className="btn-pill btn-pill-primary text-xs"
              >
                Đóng Cửa Sổ
              </button>
            </div>

          </div>
        </div>
      )}

      </div>
    </div>
  );
}
