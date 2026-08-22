export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface PlanPrice {
  id: number;
  servicePlanId: number;
  billingCycle: 'monthly' | 'yearly';
  originalPrice: number;
  sellingPrice: number;
  isDefault: boolean;
  isCurrent: boolean;
}

export interface ServicePlan {
  id: number;
  serviceCategoryId: number;
  name: string;
  code: string;
  description?: string;
  specsJson?: string;
  qrCodeUrl?: string;
  isFeatured: boolean;
  isActive: boolean;
  category?: ServiceCategory;
  planPrices?: PlanPrice[];
}

export interface CreateOrderRequest {
  servicePlanId: number;
  quantity: number;
  note?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string;
  billingCycle: string;
}

export interface OrderResponse {
  id: number;
  orderCode: string;
  servicePlanName: string;
  quantity: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  note?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  billingCycle: string;
}

export interface Promotion {
  id: number;
  code: string;
  name?: string;
  title?: string;
  discountPercent: number;
  discountAmount?: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount?: number;
  isActive: boolean;
  isCurrentlyValid?: boolean;
  createdAt?: string;
}

export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  thumbnailUrl?: string;
  category: string;
  tags?: string;
  viewCount: number;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  totalUsers: number;
  totalActiveServicePlans: number;
  totalNewsArticles: number;
  totalAffiliateApplications: number;
  recentOrders: Array<{
    id: number;
    customerName: string;
    customerEmail: string;
    servicePlanName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
  monthlyRevenue: Array<{
    year: number;
    month: number;
    revenue: number;
    orderCount: number;
  }>;
}

export interface AuditLog {
  id: number;
  userId?: number;
  userName?: string;
  performedBy?: string;
  action: string;
  entityName: string;
  entityId?: string;
  details?: string;
  ipAddress: string;
  createdAt: string;
}

export interface AffiliateApplication {
  id: number;
  userId?: number;
  fullName: string;
  email: string;
  phone: string;
  websiteUrl: string;
  promotionPlan: string;
  status: string;
  note?: string;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface UserAuth {
  token: string;
  username: string;
  email: string;
  role: string;
  userId: number;
}
