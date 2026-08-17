# PR#8: Quản trị & Thống kê (Dashboard, Xuất Excel, Audit Log, Affiliate) - API Specification

Tài liệu tả chi tiết từng REST API Backend được triển khai trong **PR#8**, bao gồm Request, Query Parameters, Request Body và Response JSON mẫu.

---

## 🛠️ Chi Tiết Chi Tiết Từng API

---

### 📊 1. API Dashboard & Thống Kê (`DashboardController`)

#### 1.1 `GET /api/Dashboard/summary`
* **Mô tả:** Lấy dữ liệu tổng quan thống kê hệ thống dành cho trang Dashboard Quản trị.
* **Xác thực:** Yêu cầu Token JWT với Role `Admin` (`Authorization: Bearer <token>`).
* **Request Parameters:** Không có.
* **Response `200 OK` (JSON):**
```json
{
  "totalRevenue": 15000000.00,
  "totalOrders": 25,
  "ordersByStatus": {
    "Completed": 20,
    "Pending": 3,
    "Processing": 1,
    "Cancelled": 1
  },
  "totalUsers": 100,
  "totalActiveServicePlans": 12,
  "totalNewsArticles": 8,
  "totalAffiliateApplications": 4,
  "recentOrders": [
    {
      "id": 25,
      "customerName": "Nguyễn Văn A",
      "customerEmail": "a.nguyen@example.com",
      "servicePlanName": "Cloud VPS Business 1",
      "totalAmount": 500000.00,
      "status": "Completed",
      "createdAt": "2026-08-17T14:30:00Z"
    }
  ],
  "monthlyRevenue": [
    {
      "year": 2026,
      "month": 8,
      "revenue": 15000000.00,
      "orderCount": 20
    }
  ]
}
```

---

### 📄 2. API Xuất Báo Cáo Excel / CSV (`ReportsController`)

#### 2.1 `GET /api/Reports/export/orders`
* **Mô tả:** Xuất toàn bộ danh sách đơn đặt hàng ra tệp định dạng CSV/Excel.
* **Xác thực:** Yêu cầu Token JWT với Role `Admin` (`Authorization: Bearer <token>`).
* **Request Parameters:** Không có.
* **Response `200 OK`:** Tệp nhị phân `text/csv` mã hóa UTF-8 BOM.
* **Header đính kèm:** `Content-Disposition: attachment; filename="Orders_Export_20260817_220000.csv"`

#### 2.2 `GET /api/Reports/export/audit-logs`
* **Mô tả:** Xuất nhật ký hệ thống ra tệp định dạng CSV/Excel theo bộ lọc.
* **Xác thực:** Yêu cầu Token JWT với Role `Admin` (`Authorization: Bearer <token>`).
* **Query Parameters:** `UserId`, `Action`, `EntityName`, `FromDate`, `ToDate` (Tùy chọn).
* **Response `200 OK`:** Tệp nhị phân `text/csv` mã hóa UTF-8 BOM.

#### 2.3 `GET /api/Reports/export/affiliates`
* **Mô tả:** Xuất danh sách các đơn đăng ký Affiliate ra tệp định dạng CSV/Excel.
* **Xác thực:** Yêu cầu Token JWT với Role `Admin` (`Authorization: Bearer <token>`).
* **Query Parameters:** `Status`, `SearchTerm` (Tùy chọn).
* **Response `200 OK`:** Tệp nhị phân `text/csv` mã hóa UTF-8 BOM.

---

### 🛡️ 3. API Audit Log - Nhật Ký Hệ Thống (`AuditLogsController`)

#### 3.1 `GET /api/AuditLogs`
* **Mô tả:** Lấy danh sách lịch sử thao tác hệ thống có phân trang và bộ lọc.
* **Xác thực:** Yêu cầu Token JWT với Role `Admin` (`Authorization: Bearer <token>`).
* **Query Parameters:**
  - `pageNumber` (int, mặc định = `1`)
  - `pageSize` (int, mặc định = `10`)
  - `userId` (int?, tùy chọn): Lọc theo ID người thực hiện.
  - `action` (string?, tùy chọn): Lọc theo hành động (`CREATE`, `UPDATE`, `DELETE`, `LOGIN`...).
  - `entityName` (string?, tùy chọn): Lọc theo tên thực thể (`ServicePlan`, `Promotion`...).
  - `fromDate` (DateTime?, tùy chọn): Thời gian từ ngày.
  - `toDate` (DateTime?, tùy chọn): Thời gian đến ngày.
* **Response `200 OK` (JSON):**
```json
{
  "items": [
    {
      "id": 105,
      "userId": 1,
      "userName": "Quản trị viên hệ thống",
      "action": "CREATE",
      "entityName": "ServicePlan",
      "entityId": "12",
      "details": "Tạo mới gói dịch vụ Cloud VPS Pro 2026",
      "ipAddress": "192.168.1.10",
      "createdAt": "2026-08-17T15:00:00Z"
    }
  ],
  "totalCount": 1,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 1,
  "hasPreviousPage": false,
  "hasNextPage": false
}
```

---

### 🤝 4. API Affiliate - Tiếp Thị Liên Kết (`AffiliateController`)

#### 4.1 `POST /api/Affiliate/register`
* **Mô tả:** Gửi đơn đăng ký đối tác Tiếp thị liên kết (Affiliate).
* **Xác thực:** `Public` (Không yêu cầu đăng nhập).
* **Request Body (JSON):**
```json
{
  "fullName": "Trần Văn B",
  "email": "affiliate.partner@example.com",
  "phone": "0912345678",
  "websiteUrl": "https://mytechblog.vn",
  "promotionPlan": "Quảng bá qua bài viết hướng dẫn trên Blog công nghệ và kênh Youtube 50k subscribers"
}
```
* **Response `201 Created` (JSON):**
```json
{
  "id": 5,
  "fullName": "Trần Văn B",
  "email": "affiliate.partner@example.com",
  "phone": "0912345678",
  "websiteUrl": "https://mytechblog.vn",
  "promotionPlan": "Quảng bá qua bài viết hướng dẫn trên Blog công nghệ và kênh Youtube 50k subscribers",
  "status": "Pending",
  "createdAt": "2026-08-17T15:10:00Z"
}
```

#### 4.2 `GET /api/Affiliate/applications`
* **Mô tả:** Xem danh sách các đơn đăng ký Affiliate dành cho Admin (lọc & phân trang).
* **Xác thực:** Yêu cầu Token JWT với Role `Admin` (`Authorization: Bearer <token>`).
* **Query Parameters:**
  - `pageNumber` (int, mặc định = `1`)
  - `pageSize` (int, mặc định = `10`)
  - `status` (string?, tùy chọn): `Pending`, `Approved`, `Rejected`.
  - `searchTerm` (string?, tùy chọn): Tìm kiếm theo tên, email, sđt hoặc website.
* **Response `200 OK` (JSON):**
```json
{
  "items": [
    {
      "id": 5,
      "fullName": "Trần Văn B",
      "email": "affiliate.partner@example.com",
      "phone": "0912345678",
      "websiteUrl": "https://mytechblog.vn",
      "promotionPlan": "Quảng bá qua bài viết hướng dẫn trên Blog công nghệ",
      "status": "Pending",
      "createdAt": "2026-08-17T15:10:00Z"
    }
  ],
  "totalCount": 1,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 1,
  "hasPreviousPage": false,
  "hasNextPage": false
}
```

#### 4.3 `GET /api/Affiliate/applications/{id}`
* **Mô tả:** Xem thông tin chi tiết của 1 đơn đăng ký Affiliate theo ID.
* **Xác thực:** Yêu cầu Token JWT với Role `Admin` (`Authorization: Bearer <token>`).
* **Path Parameter:** `id` (int) - ID của đơn đăng ký.
* **Response `200 OK` (JSON):** Trả về đối tượng `AffiliateApplicationDto`.
* **Response `404 Not Found` (JSON):** Khi ID không tồn tại.

#### 4.4 `PUT /api/Affiliate/applications/{id}/status`
* **Mô tả:** Admin phê duyệt hoặc từ chối đơn đăng ký Affiliate.
* **Xác thực:** Yêu cầu Token JWT với Role `Admin` (`Authorization: Bearer <token>`).
* **Path Parameter:** `id` (int) - ID của đơn đăng ký.
* **Request Body (JSON):**
```json
{
  "status": "Approved",
  "note": "Đã xác minh trang blog công nghệ hợp lệ"
}
```
* **Response `200 OK` (JSON):**
```json
{
  "id": 5,
  "fullName": "Trần Văn B",
  "email": "affiliate.partner@example.com",
  "phone": "0912345678",
  "websiteUrl": "https://mytechblog.vn",
  "promotionPlan": "Quảng bá qua bài viết hướng dẫn trên Blog công nghệ",
  "status": "Approved",
  "createdAt": "2026-08-17T15:10:00Z"
}
```

---

## 🧪 Đơn Vị Kiểm Thử (Unit Tests)

Bộ kiểm thử đơn vị nằm trong `tests/CloudService.UnitTests`:
- `DashboardServiceTests.cs`: Đã test tính toán chính xác tổng doanh thu, đếm số lượng theo trạng thái và biểu đồ tháng.
- `AuditLogServiceTests.cs`: Đã test lưu nhật ký thao tác và truy vấn phân trang.
- `AffiliateServiceTests.cs`: Đã test quy trình đăng ký và duyệt/từ chối trạng thái.
- `ExportServiceTests.cs`: Đã test tạo byte array định dạng CSV UTF-8 BOM không bị rỗng.
