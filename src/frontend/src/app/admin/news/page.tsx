'use client';

import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles,
  Search,
  BookOpen,
  Bold,
  Italic,
  List,
  Heading,
  Code,
  Link as LinkIcon,
  X
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { formatDate } from '@/lib/formatters';

interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  thumbnailUrl: string;
  isPublished: boolean;
  viewCount: number;
  authorName?: string;
  createdAt: string;
}

const sampleArticles: ArticleItem[] = [
  {
    id: 1,
    title: 'Hướng Dẫn Cài Đặt Web Server Nginx Trên Cloud VPS Ubuntu 24.04',
    slug: 'huong-dan-cai-dat-web-server-nginx-tren-cloud-vps-ubuntu-2404',
    summary: 'Bài viết hướng dẫn từng bước cấu hình máy chủ web Nginx, SSL Let\'s Encrypt và tối ưu hiệu năng trên Linux Ubuntu.',
    content: '## 1. Giới thiệu Nginx\nNginx là máy chủ web mã nguồn mở có hiệu năng cao.\n\n### 2. Cài đặt\n```bash\nsudo apt update && sudo apt install nginx -y\n```\n\n### 3. Kiểm tra dịch vụ\n```bash\nsudo systemctl status nginx\n```',
    category: 'HDKT',
    thumbnailUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800',
    isPublished: true,
    viewCount: 1250,
    authorName: 'Quản trị viên',
    createdAt: '2026-08-18T08:00:00Z',
  },
  {
    id: 2,
    title: 'Bùng Nổ Khuyến Mãi Cloud VPS SSD Giảm 50% Trọn Đời Năm 2026',
    slug: 'bung-no-khuyen-mai-cloud-vps-ssd-giam-50-tron-doi-2026',
    summary: 'Nhận ngay ưu đãi giảm 50% trọn đời khi đăng ký gói Cloud VPS Pro hoặc Business tại hệ thống CloudVerse.',
    content: '## Chương trình ưu đãi\n- Giảm trực tiếp **50%** chi phí chu kỳ năm.\n- Tặng chứng chỉ SSL cao cấp miễn phí.\n- Mã khuyến mãi: **CLOUD50**',
    category: 'KhuyenMai',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800',
    isPublished: true,
    viewCount: 3420,
    authorName: 'Biên tập viên',
    createdAt: '2026-08-19T09:30:00Z',
  },
  {
    id: 3,
    title: 'Thông Báo Nâng Cấp Hạ Tầng Mạng Data Center Tier III',
    slug: 'thong-bao-nang-cap-ha-tang-mang-datacenter-tier-3',
    summary: 'CloudVerse tiến hành nâng cấp dung lượng cổng mạng quốc tế lên 100Gbps nhằm đảm bảo độ trễ tối ưu nhất.',
    content: '## Lịch bảo trì\n- **Thời gian:** 01:00 - 03:00 Chủ Nhật.\n- **Phạm vi:** Hạ tầng mạng Region HCM.\n- **Mức độ ảnh hưởng:** Không gián đoạn dịch vụ chính.',
    category: 'ThongBao',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
    isPublished: true,
    viewCount: 890,
    authorName: 'Quản trị viên',
    createdAt: '2026-08-20T10:15:00Z',
  }
];

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Editor Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('HDKT');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await fetchApi<any>('/api/NewsArticles?pageSize=50');
      let fetched: ArticleItem[] = [];
      if (res.data && Array.isArray(res.data.items)) {
        fetched = res.data.items;
      } else if (res.data && Array.isArray(res.data)) {
        fetched = res.data;
      }

      if (fetched.length > 0) {
        setArticles(fetched);
      } else {
        setArticles(sampleArticles);
      }
    } catch {
      setArticles(sampleArticles);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const openCreateModal = () => {
    setEditingArticle(null);
    setTitle('');
    setSummary('');
    setContent('## Tiêu đề bài viết\n\nNội dung chi tiết viết bằng định dạng **Markdown** hoặc *Rich Text* tại đây...');
    setCategory('HDKT');
    setThumbnailUrl('https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800');
    setIsPublished(true);
    setMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (article: ArticleItem) => {
    setEditingArticle(article);
    setTitle(article.title);
    setSummary(article.summary);
    setContent(article.content);
    setCategory(article.category);
    setThumbnailUrl(article.thumbnailUrl);
    setIsPublished(article.isPublished);
    setMessage(null);
    setIsModalOpen(true);
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    setContent((prev) => prev + `\n${prefix}Văn bản mẫu${suffix}`);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Bẫy lỗi chống mã độc HTML / XSS Injection
    const maliciousPattern = /<[^>]*>|javascript:|onerror=|onload=|eval\(|<script|<iframe|<style|<di/i;
    if (maliciousPattern.test(title)) {
      setMessage('Tiêu đề chứa thẻ HTML hoặc ký tự không an toàn (ví dụ: <...>, <di>). Vui lòng chỉ nhập văn bản thuần túy.');
      return;
    }
    if (maliciousPattern.test(summary)) {
      setMessage('Tóm tắt bài viết chứa mã HTML hoặc thẻ không hợp lệ. Vui lòng chỉ nhập văn bản mô tả.');
      return;
    }
    // Đối với nội dung Markdown, cho phép định dạng Markdown nhưng chặn các thẻ HTML nguy hiểm (<script>, <iframe>, <di>,...)
    const dangerousHtml = /<script|<iframe|<object|<embed|<form|javascript:|onload=|onerror=|<di\b|<div/i;
    if (dangerousHtml.test(content)) {
      setMessage('Nội dung chứa thẻ HTML nguy hiểm (ví dụ: <script>, <iframe>, <div>, <di>...). Vui lòng sử dụng cú pháp Markdown chuẩn (##, **, -, ```) thay vì thẻ HTML.');
      return;
    }

    setSaving(true);

    const payload = {
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      category,
      thumbnailUrl: thumbnailUrl.trim(),
      isPublished,
    };

    try {
      if (editingArticle) {
        // Cập nhật bài viết
        await fetchApi(`/api/NewsArticles/${editingArticle.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        // Tạo mới bài viết
        await fetchApi<any>('/api/NewsArticles', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      await loadArticles();
      setIsModalOpen(false);
    } catch {
      // Cập nhật local nếu API offline
      if (editingArticle) {
        setArticles((prev) =>
          prev.map((a) =>
            a.id === editingArticle.id ? { ...a, ...payload } : a
          )
        );
      } else {
        const newArt: ArticleItem = {
          id: Math.floor(Math.random() * 900) + 100,
          title,
          slug: title.toLowerCase().replace(/\s+/g, '-'),
          summary,
          content,
          category,
          thumbnailUrl,
          isPublished,
          viewCount: 0,
          authorName: 'Tôi (Editor)',
          createdAt: new Date().toISOString(),
        };
        setArticles((prev) => [newArt, ...prev]);
      }
      setIsModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  // Trạng thái modal xác nhận xóa bài viết
  const [deleteNewsId, setDeleteNewsId] = useState<number | null>(null);

  const confirmDeleteNews = async () => {
    if (!deleteNewsId) return;
    const id = deleteNewsId;
    try {
      await fetchApi(`/api/NewsArticles/${id}`, { method: 'DELETE' });
      await loadArticles();
    } catch {
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setDeleteNewsId(null);
    }
  };

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="badge-pill bg-blue-50 text-blue-700 border border-blue-200">
            Quản Trị Nội Dung (Admin & Editor)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Quản Lý Tin Tức & Blog
          </h1>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            Soạn thảo bài viết chuẩn Markdown / Rich Text, hướng dẫn kỹ thuật và thông báo khuyến mãi
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="btn-pill btn-pill-primary text-xs"
          >
            <Plus className="w-4 h-4" />
            Viết Bài Mới
          </button>

          <button
            onClick={loadArticles}
            disabled={loading}
            className="btn-pill btn-pill-secondary text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm max-w-md">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm bài viết theo tiêu đề hoặc danh mục..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs font-medium text-slate-900 outline-none"
        />
      </div>

      {/* Article List Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-3 shadow-sm">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Chưa có bài viết nào trong hệ thống.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="text-[11px] uppercase font-bold text-slate-500 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4">Bài Viết</th>
                  <th className="p-4">Chuyên Mục</th>
                  <th className="p-4">Tác Giả</th>
                  <th className="p-4">Lượt Xem</th>
                  <th className="p-4">Ngày Đăng</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 max-w-sm">
                      <div className="font-bold text-slate-900 line-clamp-1">{art.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{art.summary}</div>
                    </td>
                    <td className="p-4">
                      <span className="badge-pill bg-slate-100 text-slate-800 font-semibold text-[10px]">
                        {art.category === 'HDKT' ? 'Hướng Dẫn' : art.category === 'KhuyenMai' ? 'Khuyến Mãi' : 'Thông Báo'}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      {art.authorName || 'Biên tập viên'}
                    </td>
                    <td className="p-4 font-mono font-bold text-blue-600">
                      {art.viewCount.toLocaleString()}
                    </td>
                    <td className="p-4 text-slate-500 font-mono">
                      {formatDate(art.createdAt)}
                    </td>
                    <td className="p-4">
                      {art.isPublished ? (
                        <span className="badge-pill bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Đã xuất bản
                        </span>
                      ) : (
                        <span className="badge-pill bg-slate-100 text-slate-600">
                          Bản nháp
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(art)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                          title="Chỉnh sửa bài viết"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteNewsId(art.id)}
                          className="p-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                          title="Xóa bài viết"
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
      )}

      {/* Modal Soạn Thảo / Chỉnh Sửa Bài Viết */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="badge-pill bg-blue-50 text-blue-700 border border-blue-200">
                  {editingArticle ? 'Chỉnh Sửa Bài Viết' : 'Soạn Thảo Bài Viết Mới'}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  {editingArticle ? 'Cập Nhật Nội Dung Tin Tức' : 'Tạo Bài Viết & Hướng Dẫn Kỹ Thuật'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSaveArticle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu Đề Bài Viết *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Hướng dẫn cấu hình Nginx Reverse Proxy trên Ubuntu..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chuyên Mục *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="HDKT">Hướng Dẫn Kỹ Thuật</option>
                    <option value="KhuyenMai">Tin Tức Khuyến Mãi</option>
                    <option value="ThongBao">Thông Báo Hệ Thống</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ảnh Đại Diện (URL)</label>
                  <input
                    type="text"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tóm Tắt Ngắn (Summary) *</label>
                <textarea
                  rows={2}
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Rich Markdown Editor Toolbar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">Nội Dung Soạn Thảo (Markdown) *</label>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => insertMarkdown('### ')}
                      className="p-1 rounded hover:bg-white text-slate-600"
                      title="Tiêu đề H3"
                    >
                      <Heading className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('**', '**')}
                      className="p-1 rounded hover:bg-white text-slate-600"
                      title="Chữ đậm"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('*', '*')}
                      className="p-1 rounded hover:bg-white text-slate-600"
                      title="Chữ nghiêng"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('- ')}
                      className="p-1 rounded hover:bg-white text-slate-600"
                      title="Danh sách gạch đầu dòng"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('```\n', '\n```')}
                      className="p-1 rounded hover:bg-white text-slate-600"
                      title="Khối mã nguồn Code"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <textarea
                  rows={8}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Soạn thảo nội dung theo chuẩn Markdown..."
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="publishCheck"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="publishCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Xuất bản ngay (Hiển thị ra ngoài trang tin tức công khai)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-pill btn-pill-secondary text-xs"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-pill btn-pill-primary text-xs"
                >
                  {saving ? 'Đang Lưu Bài Viết...' : editingArticle ? 'Cập Nhật Bài Viết' : 'Xuất Bản Bài Viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA BÀI VIẾT */}
      {deleteNewsId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Xác Nhận Xóa Bài Viết?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Hành động này không thể hoàn tác. Bài viết sẽ bị xóa vĩnh viễn khỏi trang tin tức và cơ sở dữ liệu.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={confirmDeleteNews}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
              >
                Xác Nhận Xóa
              </button>
              <button
                onClick={() => setDeleteNewsId(null)}
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
