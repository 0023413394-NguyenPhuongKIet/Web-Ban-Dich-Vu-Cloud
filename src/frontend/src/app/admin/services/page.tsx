'use client';

import React, { useEffect, useState } from 'react';
import { 
  Server, 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  Search, 
  X, 
  Cpu, 
  Zap, 
  HardDrive, 
  Globe, 
  DollarSign 
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { formatCurrency } from '@/lib/formatters';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

interface ServicePlanItem {
  id: number;
  serviceCategoryId: number;
  categoryName?: string;
  name: string;
  code: string;
  description: string;
  cpu: string;
  ram: string;
  storage: string;
  bandwidth: string;
  monthlyPrice: number;
  yearlyPrice: number;
  qrCodeUrl?: string;
  redirectLink?: string;
  isActive: boolean;
}

const initialCategories: CategoryItem[] = [
  { id: 1, name: 'VPS / Cloud Server', slug: 'vps-cloud-server', description: 'Máy chủ ảo hiệu năng cao NVMe Enterprise', displayOrder: 1, isActive: true },
  { id: 2, name: 'Hosting / Web Hosting', slug: 'hosting-web-hosting', description: 'Lưu trữ website tốc độ cao LiteSpeed Cache', displayOrder: 2, isActive: true },
  { id: 3, name: 'Domain / Tên Miền', slug: 'domain-ten-mien', description: 'Đăng ký tên miền quốc tế và Việt Nam', displayOrder: 3, isActive: true },
  { id: 4, name: 'Email / Email Server', slug: 'email-email-server', description: 'Hệ thống email doanh nghiệp theo tên miền riêng', displayOrder: 4, isActive: true },
];

const initialPlans: ServicePlanItem[] = [
  {
    id: 1,
    serviceCategoryId: 1,
    categoryName: 'VPS / Cloud Server',
    name: 'Cloud VPS Starter',
    code: 'VPS-STARTER',
    description: 'Phù hợp cho blog cá nhân, website WordPress và thử nghiệm ứng dụng nhỏ.',
    cpu: '1 Core Intel Xeon',
    ram: '1 GB DDR4 ECC',
    storage: '25 GB NVMe Enterprise',
    bandwidth: '1 Gbps Không Giới Hạn',
    monthlyPrice: 99000,
    yearlyPrice: 948000,
    qrCodeUrl: '/images/QR-code.jpg',
    redirectLink: '/order/1',
    isActive: true,
  },
  {
    id: 2,
    serviceCategoryId: 1,
    categoryName: 'VPS / Cloud Server',
    name: 'Cloud VPS Pro',
    code: 'VPS-PRO',
    description: 'Cấu hình tối ưu cho cửa hàng online, website doanh nghiệp và API hiệu năng cao.',
    cpu: '2 Core Intel Xeon',
    ram: '4 GB DDR4 ECC',
    storage: '60 GB NVMe Enterprise',
    bandwidth: '1 Gbps Không Giới Hạn',
    monthlyPrice: 249000,
    yearlyPrice: 2388000,
    qrCodeUrl: '/images/QR-code.jpg',
    redirectLink: '/order/2',
    isActive: true,
  },
  {
    id: 3,
    serviceCategoryId: 1,
    categoryName: 'VPS / Cloud Server',
    name: 'Cloud VPS Business',
    code: 'VPS-BUSINESS',
    description: 'Sức mạnh vượt trội cho hệ thống thương mại điện tử và cơ sở dữ liệu lớn.',
    cpu: '4 Core Intel Xeon',
    ram: '8 GB DDR4 ECC',
    storage: '120 GB NVMe Enterprise',
    bandwidth: '1 Gbps Không Giới Hạn',
    monthlyPrice: 499000,
    yearlyPrice: 4788000,
    qrCodeUrl: '/images/QR-code.jpg',
    redirectLink: '/order/3',
    isActive: true,
  },
  {
    id: 4,
    serviceCategoryId: 2,
    categoryName: 'Hosting / Web Hosting',
    name: 'Hosting LiteSpeed Basic',
    code: 'HOSTING-BASIC',
    description: 'Tăng tốc độ tải trang gấp 5 lần với Web Server LiteSpeed Cache bản quyền.',
    cpu: '1 vCPU Share',
    ram: '1 GB RAM',
    storage: '10 GB SSD NVMe',
    bandwidth: 'Không giới hạn',
    monthlyPrice: 49000,
    yearlyPrice: 468000,
    qrCodeUrl: '/images/QR-code.jpg',
    redirectLink: '/order/4',
    isActive: true,
  },
  {
    id: 5,
    serviceCategoryId: 2,
    categoryName: 'Hosting / Web Hosting',
    name: 'Hosting LiteSpeed Pro',
    code: 'HOSTING-PRO',
    description: 'Hỗ trợ không giới hạn tên miền phụ, chứng chỉ SSL miễn phí trọn đời.',
    cpu: '2 vCPU Share',
    ram: '2 GB RAM',
    storage: '30 GB SSD NVMe',
    bandwidth: 'Không giới hạn',
    monthlyPrice: 99000,
    yearlyPrice: 948000,
    qrCodeUrl: '/images/QR-code.jpg',
    redirectLink: '/order/5',
    isActive: true,
  },
  {
    id: 6,
    serviceCategoryId: 3,
    categoryName: 'Domain / Tên Miền',
    name: 'Domain Quốc Tế .COM / .NET',
    code: 'DOMAIN-COM',
    description: 'Khẳng định thương hiệu trực tuyến với tên miền quốc tế phổ biến nhất thế giới.',
    cpu: 'DNS Anycast',
    ram: 'Khóa Tên Miền',
    storage: 'Ẩn Thông Tin WHOIS',
    bandwidth: 'Quản trị tự động 24/7',
    monthlyPrice: 280000,
    yearlyPrice: 280000,
    qrCodeUrl: '/images/QR-code.jpg',
    redirectLink: '/order/6',
    isActive: true,
  }
];

export default function AdminServicesManagementPage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'categories'>('plans');
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [plans, setPlans] = useState<ServicePlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [role, setRole] = useState<string>('');

  // Modals
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedPlanQr, setSelectedPlanQr] = useState<ServicePlanItem | null>(null);

  // Form Plan states
  const [editingPlan, setEditingPlan] = useState<ServicePlanItem | null>(null);
  const [planName, setPlanName] = useState('');
  const [planCode, setPlanCode] = useState('');
  const [planCatId, setPlanCatId] = useState<number>(1);
  const [planDesc, setPlanDesc] = useState('');
  const [planCpu, setPlanCpu] = useState('');
  const [planRam, setPlanRam] = useState('');
  const [planStorage, setPlanStorage] = useState('');
  const [planBandwidth, setPlanBandwidth] = useState('');
  const [planMonthlyPrice, setPlanMonthlyPrice] = useState<number>(99000);
  const [planYearlyPrice, setPlanYearlyPrice] = useState<number>(948000);
  const [planQrUrl, setPlanQrUrl] = useState('/images/QR-code.jpg');
  const [planRedirectLink, setPlanRedirectLink] = useState('/order/1');

  // Form Cat states
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const r = localStorage.getItem('role') || '';
    setRole(r);
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const localSavedPlans = JSON.parse(localStorage.getItem('admin_managed_service_plans') || '[]');
    const localSavedCats = JSON.parse(localStorage.getItem('admin_managed_service_categories') || '[]');

    if (localSavedCats.length > 0) {
      setCategories(localSavedCats);
    } else {
      setCategories(initialCategories);
    }

    if (localSavedPlans.length > 0) {
      setPlans(localSavedPlans);
    } else {
      setPlans(initialPlans);
    }

    setLoading(false);
  };

  // Mở modal thêm/sửa gói
  const handleOpenPlanModal = (planItem?: ServicePlanItem) => {
    setMessage(null);
    setErrorMsg(null);

    // Đảm bảo lấy danh sách categories mới nhất hiện có
    const latestCats = categories.length > 0 ? categories : JSON.parse(localStorage.getItem('admin_managed_service_categories') || '[]');

    if (planItem) {
      setEditingPlan(planItem);
      setPlanName(planItem.name);
      setPlanCode(planItem.code);
      setPlanCatId(planItem.serviceCategoryId);
      setPlanDesc(planItem.description);
      setPlanCpu(planItem.cpu);
      setPlanRam(planItem.ram);
      setPlanStorage(planItem.storage);
      setPlanBandwidth(planItem.bandwidth);
      setPlanMonthlyPrice(planItem.monthlyPrice);
      setPlanYearlyPrice(planItem.yearlyPrice);
      setPlanQrUrl(planItem.qrCodeUrl || '/images/QR-code.jpg');
      setPlanRedirectLink(planItem.redirectLink || `/order/${planItem.id}`);
    } else {
      setEditingPlan(null);
      setPlanName('');
      setPlanCode('');
      setPlanCatId(latestCats[0]?.id || 1);
      setPlanDesc('');
      setPlanCpu('2 Core Intel Xeon');
      setPlanRam('4 GB DDR4 ECC');
      setPlanStorage('50 GB NVMe Enterprise');
      setPlanBandwidth('1 Gbps Không Giới Hạn');
      setPlanMonthlyPrice(199000);
      setPlanYearlyPrice(Math.round(199000 * 12 * 0.8));
      setPlanQrUrl('/images/QR-code.jpg');
      setPlanRedirectLink('/order/1');
    }
    setIsPlanModalOpen(true);
  };

  // Mở modal thêm/sửa danh mục
  const handleOpenCatModal = (catItem?: CategoryItem) => {
    setMessage(null);
    setErrorMsg(null);
    if (catItem) {
      setEditingCat(catItem);
      setCatName(catItem.name);
      setCatSlug(catItem.slug);
      setCatDesc(catItem.description || '');
    } else {
      setEditingCat(null);
      setCatName('');
      setCatSlug('');
      setCatDesc('');
    }
    setIsCatModalOpen(true);
  };

  // Lưu gói dịch vụ
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation chống HTML / XSS Injection
    const xssPattern = /<[^>]*>|javascript:|onerror=|onload=|<script|<di/i;
    if (xssPattern.test(planName) || xssPattern.test(planDesc) || xssPattern.test(planCpu)) {
      setErrorMsg('Thông tin gói chứa thẻ HTML hoặc ký tự không an toàn.');
      return;
    }

    const catObj = categories.find((c) => c.id === Number(planCatId));
    const newPlanId = editingPlan ? editingPlan.id : Math.floor(Math.random() * 900) + 10;
    const newPlanItem: ServicePlanItem = {
      id: newPlanId,
      serviceCategoryId: Number(planCatId),
      categoryName: catObj ? catObj.name : 'VPS / Cloud Server',
      name: planName.trim(),
      code: planCode.trim().toUpperCase() || `PLAN-${Date.now()}`,
      description: planDesc.trim(),
      cpu: planCpu.trim(),
      ram: planRam.trim(),
      storage: planStorage.trim(),
      bandwidth: planBandwidth.trim(),
      monthlyPrice: Number(planMonthlyPrice),
      yearlyPrice: Number(planYearlyPrice),
      qrCodeUrl: planQrUrl.trim() || '/images/QR-code.jpg',
      redirectLink: planRedirectLink.trim() || `/order/${newPlanId}`,
      isActive: true,
    };

    let updatedPlans: ServicePlanItem[] = [];
    const currentUsername = typeof window !== 'undefined' ? (localStorage.getItem('username') || 'admin') : 'admin';
    const isPriceChanged = editingPlan && (editingPlan.monthlyPrice !== Number(planMonthlyPrice) || editingPlan.yearlyPrice !== Number(planYearlyPrice));

    if (editingPlan) {
      updatedPlans = plans.map((p) => (p.id === editingPlan.id ? newPlanItem : p));
      setMessage(`Đã cập nhật thành công gói "${newPlanItem.name}".`);

      // Ghi nhận Audit Log qua API
      fetchApi('/api/AuditLogs', {
        method: 'POST',
        body: JSON.stringify({
          action: isPriceChanged ? 'UpdatePrice' : 'Update',
          entityName: 'ServicePlan',
          entityId: String(editingPlan.id),
          details: isPriceChanged
            ? `Quản trị viên '${currentUsername}' đã thay đổi giá gói '${newPlanItem.name}' thành: ${Number(planMonthlyPrice).toLocaleString('vi-VN')} đ/tháng, ${Number(planYearlyPrice).toLocaleString('vi-VN')} đ/năm.`
            : `Quản trị viên '${currentUsername}' đã cập nhật thông tin gói dịch vụ '${newPlanItem.name}' (${newPlanItem.cpu}, ${newPlanItem.ram}, ${newPlanItem.storage}).`
        })
      }).catch(() => {});
    } else {
      updatedPlans = [newPlanItem, ...plans];
      setMessage(`Đã thêm mới thành công gói "${newPlanItem.name}".`);

      // Ghi nhận Audit Log tạo gói mới
      fetchApi('/api/AuditLogs', {
        method: 'POST',
        body: JSON.stringify({
          action: 'Create',
          entityName: 'ServicePlan',
          entityId: String(newPlanItem.id),
          details: `Quản trị viên '${currentUsername}' đã tạo mới gói dịch vụ '${newPlanItem.name}' với giá ${Number(planMonthlyPrice).toLocaleString('vi-VN')} đ/tháng.`
        })
      }).catch(() => {});
    }

    setPlans(updatedPlans);
    localStorage.setItem('admin_managed_service_plans', JSON.stringify(updatedPlans));
    setIsPlanModalOpen(false);
  };

  // Xóa gói dịch vụ
  const [deletePlanId, setDeletePlanId] = useState<number | null>(null);
  const [deleteCatId, setDeleteCatId] = useState<number | null>(null);

  const confirmDeletePlan = () => {
    if (!deletePlanId) return;
    const planToDelete = plans.find((p) => p.id === deletePlanId);
    const updated = plans.filter((p) => p.id !== deletePlanId);
    const currentUsername = typeof window !== 'undefined' ? (localStorage.getItem('username') || 'admin') : 'admin';

    // Ghi nhận Audit Log xóa gói
    fetchApi('/api/AuditLogs', {
      method: 'POST',
      body: JSON.stringify({
        action: 'Delete',
        entityName: 'ServicePlan',
        entityId: String(deletePlanId),
        details: `Quản trị viên '${currentUsername}' đã xóa gói dịch vụ '${planToDelete?.name || deletePlanId}'.`
      })
    }).catch(() => {});

    setPlans(updated);
    localStorage.setItem('admin_managed_service_plans', JSON.stringify(updated));
    setMessage(`Đã xóa thành công gói dịch vụ "${planToDelete?.name || deletePlanId}".`);
    setDeletePlanId(null);
  };

  // Lưu danh mục
  const handleSaveCat = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const xssPattern = /<[^>]*>|javascript:|onerror=|onload=|<script|<di/i;
    if (xssPattern.test(catName) || xssPattern.test(catDesc)) {
      setErrorMsg('Tên hoặc mô tả danh mục chứa thẻ HTML không an toàn.');
      return;
    }

    const currentCats = categories.length > 0 ? categories : initialCategories;
    const newCatId = editingCat ? editingCat.id : Math.max(...currentCats.map((c) => c.id), 0) + 1;

    const newCatItem: CategoryItem = {
      id: newCatId,
      name: catName.trim(),
      slug: catSlug.trim() || catName.toLowerCase().replace(/\s+/g, '-'),
      description: catDesc.trim(),
      displayOrder: currentCats.length + 1,
      isActive: true,
    };

    let updatedCats: CategoryItem[] = [];
    if (editingCat) {
      updatedCats = currentCats.map((c) => (c.id === editingCat.id ? newCatItem : c));
      setMessage(`Đã cập nhật danh mục "${newCatItem.name}".`);
    } else {
      updatedCats = [...currentCats, newCatItem];
      setMessage(`Đã thêm mới danh mục "${newCatItem.name}".`);
    }

    setCategories(updatedCats);
    localStorage.setItem('admin_managed_service_categories', JSON.stringify(updatedCats));
    setIsCatModalOpen(false);
  };

  // Xóa danh mục
  const confirmDeleteCat = () => {
    if (!deleteCatId) return;
    const catToDelete = categories.find((c) => c.id === deleteCatId);
    const updated = categories.filter((c) => c.id !== deleteCatId);
    setCategories(updated);
    localStorage.setItem('admin_managed_service_categories', JSON.stringify(updated));
    setMessage(`Đã xóa thành công danh mục "${catToDelete?.name || deleteCatId}".`);
    setDeleteCatId(null);
  };

  const filteredPlans = plans.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="badge-pill bg-blue-50 text-blue-700 border border-blue-200">
            Quản Trị Bảng Giá &amp; Cấu Hình
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Quản Lý Gói Dịch Vụ &amp; Danh Mục
          </h1>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            Thêm, sửa, xóa danh mục dịch vụ, cấu hình phần cứng, giá niêm yết và mã QR thanh toán
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'plans' ? (
            <button
              onClick={() => handleOpenPlanModal()}
              className="btn-pill btn-pill-primary text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Thêm Gói Dịch Vụ Mới
            </button>
          ) : (
            <button
              onClick={() => handleOpenCatModal()}
              className="btn-pill btn-pill-primary text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Thêm Danh Mục Mới
            </button>
          )}

          <button
            onClick={loadData}
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'plans'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Gói Cấu Hình &amp; Bảng Giá ({plans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'categories'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Danh Mục Dịch Vụ ({categories.length})</span>
        </button>
      </div>

      {/* TAB 1: DANH SÁCH GÓI CẤU HÌNH & GIÁ */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Tìm gói theo tên hoặc mã..."
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
                    <th className="p-4">Tên Gói &amp; Mã</th>
                    <th className="p-4">Danh Mục</th>
                    <th className="p-4">Cấu Hình Phần Cứng</th>
                    <th className="p-4">Giá Hàng Tháng</th>
                    <th className="p-4">Giá 1 Năm</th>
                    <th className="p-4 text-center">Mã QR</th>
                    <th className="p-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredPlans.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-blue-600 font-mono font-bold">{item.code}</div>
                      </td>
                      <td className="p-4">
                        <span className="badge-pill bg-blue-50 text-blue-700 border border-blue-200 text-[10px]">
                          {item.categoryName || 'Cloud VPS'}
                        </span>
                      </td>
                      <td className="p-4 text-[11px] text-slate-600 space-y-0.5">
                        <div>• <strong>CPU:</strong> {item.cpu}</div>
                        <div>• <strong>RAM:</strong> {item.ram} | <strong>SSD:</strong> {item.storage}</div>
                      </td>
                      <td className="p-4 font-mono font-extrabold text-slate-900 text-sm">
                        {formatCurrency(item.monthlyPrice)}
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-600 text-xs">
                        {formatCurrency(item.yearlyPrice)}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => { setSelectedPlanQr(item); setIsQrModalOpen(true); }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors inline-flex items-center gap-1 text-[11px] font-bold"
                        >
                          <QrCode className="w-4 h-4 text-blue-600" />
                          <span>Xem QR</span>
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenPlanModal(item)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors"
                            title="Chỉnh sửa gói"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletePlanId(item.id)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
                            title="Xóa gói"
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
      )}

      {/* TAB 2: DANH MỤC DỊCH VỤ */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="text-[11px] uppercase font-bold text-slate-500 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4">Tên Danh Mục</th>
                  <th className="p-4">Slug / Đường Dẫn</th>
                  <th className="p-4">Mô Tả Danh Mục</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">
                      {cat.name}
                    </td>
                    <td className="p-4 font-mono text-slate-500 text-[11px]">
                      {cat.slug}
                    </td>
                    <td className="p-4 text-slate-600 max-w-md">
                      {cat.description || 'Chưa có mô tả'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenCatModal(cat)}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors"
                          title="Chỉnh sửa danh mục"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteCatId(cat.id)}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
                          title="Xóa danh mục"
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

      {/* MODAL 1: THÊM / SỬA GÓI CẤU HÌNH & BẢNG GIÁ */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="badge-pill bg-blue-50 text-blue-700 border border-blue-200">
                  {editingPlan ? 'Chỉnh Sửa Gói Dịch Vụ' : 'Thêm Mới Gói Dịch Vụ'}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  {editingPlan ? editingPlan.name : 'Thiết Lập Cấu Hình & Bảng Giá'}
                </h3>
              </div>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên Gói Dịch Vụ *</label>
                  <input
                    type="text"
                    required
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="Ví dụ: Cloud VPS Ultra"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mã Gói (Code) *</label>
                  <input
                    type="text"
                    required
                    value={planCode}
                    onChange={(e) => setPlanCode(e.target.value)}
                    placeholder="VPS-ULTRA"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold uppercase font-mono focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Danh Mục Dịch Vụ *</label>
                <select
                  value={planCatId}
                  onChange={(e) => setPlanCatId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô Tả Gói</label>
                <textarea
                  rows={2}
                  value={planDesc}
                  onChange={(e) => setPlanDesc(e.target.value)}
                  placeholder="Mô tả cấu hình và đối tượng khách hàng sử dụng..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Thông số phần cứng */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Cấu Hình Phần Cứng</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Vi Xử Lý CPU</label>
                    <input
                      type="text"
                      value={planCpu}
                      onChange={(e) => setPlanCpu(e.target.value)}
                      placeholder="4 Core Intel Xeon"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Dung Lượng RAM</label>
                    <input
                      type="text"
                      value={planRam}
                      onChange={(e) => setPlanRam(e.target.value)}
                      placeholder="8 GB DDR4 ECC"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Ổ Cứng SSD/NVMe</label>
                    <input
                      type="text"
                      value={planStorage}
                      onChange={(e) => setPlanStorage(e.target.value)}
                      placeholder="100 GB NVMe Enterprise"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Băng Thông</label>
                    <input
                      type="text"
                      value={planBandwidth}
                      onChange={(e) => setPlanBandwidth(e.target.value)}
                      placeholder="1 Gbps Không Giới Hạn"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bảng giá & QR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giá Hàng Tháng (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={planMonthlyPrice}
                    onChange={(e) => {
                      const mVal = Number(e.target.value) || 0;
                      setPlanMonthlyPrice(mVal);
                      // Tự động tính giá 1 năm: nhân 12 tháng và chiết khấu giảm 20% (nhân 0.8)
                      const calculatedYearly = Math.round(mVal * 12 * 0.8);
                      setPlanYearlyPrice(calculatedYearly);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold font-mono focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">Giá 1 Năm (VNĐ)</label>
                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Tự tính: x12 tháng - 20%
                    </span>
                  </div>
                  <input
                    type="number"
                    readOnly
                    value={planYearlyPrice}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-extrabold font-mono text-emerald-700 cursor-not-allowed outline-none select-none"
                    title="Giá 1 năm được hệ thống tự động tính dựa trên đơn giá tháng x 12 và chiết khấu ưu đãi 20%"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ảnh Mã QR Thanh Toán Trực Tiếp
                  </label>
                  <input
                    type="text"
                    value={planQrUrl}
                    onChange={(e) => setPlanQrUrl(e.target.value)}
                    placeholder="/images/QR-code.jpg"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Đường dẫn ảnh QR chuyển khoản ngân hàng VietQR</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Đường Link Chuyển Hướng Đặt Hàng *</span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Mã QR Giới Thiệu</span>
                  </label>
                  <input
                    type="text"
                    value={planRedirectLink}
                    onChange={(e) => setPlanRedirectLink(e.target.value)}
                    placeholder="/order/1 hoặc https://domain.com/order/1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Đường link dẫn tới trang đặt hàng & nhập thông tin thanh toán</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 btn-pill btn-pill-primary text-xs py-3 font-bold"
                >
                  {editingPlan ? 'Lưu Thay Đổi Gói' : 'Tạo Gói Dịch Vụ'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="btn-pill btn-pill-secondary text-xs py-3"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: THÊM / SỬA DANH MỤC */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCat ? 'Sửa Danh Mục Dịch Vụ' : 'Thêm Danh Mục Mới'}
              </h3>
              <button onClick={() => setIsCatModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCat} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Danh Mục *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Ví dụ: Cloud Server GPU"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Đường Dẫn Slug *</label>
                <input
                  type="text"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="cloud-server-gpu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô Tả Danh Mục</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Mô tả danh mục dịch vụ..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button type="submit" className="flex-1 btn-pill btn-pill-primary text-xs py-3 font-bold">
                  {editingCat ? 'Cập Nhật' : 'Tạo Danh Mục'}
                </button>
                <button type="button" onClick={() => setIsCatModalOpen(false)} className="btn-pill btn-pill-secondary text-xs py-3">
                  Đóng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: XEM MÃ QR THANH TOÁN & MÃ QR ĐIỀU HƯỚNG GÓI */}
      {isQrModalOpen && selectedPlanQr && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 text-center space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="badge-pill bg-blue-50 text-blue-700 border border-blue-200">
                  Hệ Thống Mã QR Song Song
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Mã QR Gói {selectedPlanQr.name}
                </h3>
              </div>
              <button onClick={() => setIsQrModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* QR 1: Chuyển hướng tới trang đặt hàng thanh toán */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 flex flex-col items-center justify-between space-y-2">
                <span className="text-[11px] font-extrabold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-md">
                  1. Mã QR Trang Giới Thiệu (Link Đặt Hàng)
                </span>
                {(() => {
                  const targetUrl = selectedPlanQr.redirectLink?.startsWith('http')
                    ? selectedPlanQr.redirectLink
                    : (typeof window !== 'undefined' ? `${window.location.origin}${selectedPlanQr.redirectLink || `/order/${selectedPlanQr.id}`}` : `http://localhost:3000${selectedPlanQr.redirectLink || `/order/${selectedPlanQr.id}`}`);
                  return (
                    <>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(targetUrl)}&margin=10`}
                        alt="QR Điều Hướng Đặt Hàng"
                        className="w-36 h-36 rounded-xl object-contain shadow-sm border border-white bg-white p-1"
                      />
                      <div className="text-left w-full space-y-1">
                        <p className="text-[10px] text-slate-500 font-medium">Link đích quét mã:</p>
                        <p className="text-[11px] font-mono text-blue-800 font-bold break-all bg-white/80 p-1.5 rounded-lg border border-blue-100">
                          {selectedPlanQr.redirectLink || `/order/${selectedPlanQr.id}`}
                        </p>
                      </div>
                    </>
                  );
                })()}
                <p className="text-[10px] text-slate-500 italic">Quét để mở trang nhập thông tin và cấu hình thanh toán</p>
              </div>

              {/* QR 2: Mã QR thanh toán trực tiếp */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex flex-col items-center justify-between space-y-2">
                <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-md">
                  2. Mã QR Thanh Toán Trực Tiếp
                </span>
                <img
                  src={selectedPlanQr.qrCodeUrl || '/images/QR-code.jpg'}
                  alt="QR Thanh Toán"
                  className="w-36 h-36 rounded-xl object-contain shadow-sm border border-white bg-white p-1"
                />
                <div className="text-left w-full space-y-1">
                  <p className="text-[10px] text-slate-500 font-medium">Giá gói dịch vụ:</p>
                  <p className="text-[11px] font-mono text-emerald-800 font-extrabold bg-white/80 p-1.5 rounded-lg border border-emerald-100">
                    {formatCurrency(selectedPlanQr.monthlyPrice)} / tháng
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 italic">Ảnh QR thanh toán trực tiếp qua tài khoản ngân hàng</p>
              </div>
            </div>

            <button
              onClick={() => setIsQrModalOpen(false)}
              className="w-full btn-pill btn-pill-secondary text-xs py-2.5"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA GÓI DỊCH VỤ */}
      {deletePlanId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Xác Nhận Xóa Gói Dịch Vụ?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Gói cấu hình và bảng giá này sẽ bị gỡ bỏ khỏi hệ thống và không còn hiển thị cho khách đặt hàng.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={confirmDeletePlan}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
              >
                Xác Nhận Xóa
              </button>
              <button
                onClick={() => setDeletePlanId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Hủy Bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA DANH MỤC */}
      {deleteCatId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Xác Nhận Xóa Danh Mục?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Danh mục dịch vụ này sẽ bị xóa khỏi menu và các bộ lọc ngoài trang chủ.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={confirmDeleteCat}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
              >
                Xác Nhận Xóa
              </button>
              <button
                onClick={() => setDeleteCatId(null)}
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
