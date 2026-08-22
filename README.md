# ☁️ CloudService Platform — Hệ Thống Bán Dịch Vụ Cloud (VPS, Hosting, Server, Cloud Storage)

> **Báo cáo Dự án Bài tập lớn cuối kỳ**  
> **Học phần:** Phát triển phần mềm hướng đối tượng (IN4211)  
> **Trường:** Trường Đại học Đồng Tháp (DThU)  
> **Kiến trúc:** Clean Architecture 4 Tầng + Microservices-ready Containerization  

---

## 📑 Mục Lục
1. [Giới Thiệu Dự Án](#-giới-thiệu-dự-án)
2. [Tính Năng Nổi Bật](#-tính-năng-nổi-bật)
3. [Kiến Trúc Hệ Thống (Clean Architecture 4 Tầng)](#-kiến-trúc-hệ-thống-clean-architecture-4-tầng)
4. [Công Nghệ Sử Dụng (Tech Stack)](#-công-nghệ-sử-dụng-tech-stack)
5. [Tài Khoản Đăng Nhập Mặc Định](#-tài-khoản-đăng-nhập-mặc-định)
6. [Hướng Dẫn Cài Đặt & Khởi Chạy](#-hướng-dẫn-cài-đặt--khởi-chạy)
   - [Cách 1: Khởi chạy bằng Docker Compose (Khuyên dùng)](#cách-1-khởi-chạy-bằng-docker-compose-nhanh-nhất)
   - [Cách 2: Khởi chạy Cục bộ (Local Development)](#cách-2-khởi-chạy-cục-bộ-local-development)
7. [Kiểm Thử & Test Coverage (xUnit + Moq + Coverlet)](#-kiểm-thử--test-coverage)
8. [Quy Trình CI/CD & DevOps](#-quy-trình-cicd--devops)
9. [Lộ Trình 10 Pull Requests (PR Roadmap)](#-lộ-trình-10-pull-requests-pr-roadmap)

---

## 🌟 Giới Thiệu Dự Án

**CloudService Platform** là hệ thống Web bán và quản lý dịch vụ Điện toán đám mây toàn diện (Cloud VPS, Dedicated Server, Web Hosting, Cloud Storage, SSL), được thiết kế và hiện thực hóa dựa trên các nguyên lý lập trình hướng đối tượng (OOP: Encapsulation, Inheritance, Polymorphism, Abstraction) kết hợp các nguyên tắc thiết kế **SOLID** và mẫu kiến trúc **Clean Architecture**.

Hệ thống cung cấp trải nghiệm mượt mà cho khách hàng cá nhân/doanh nghiệp từ khâu khám phá dịch vụ, tính toán chi phí linh hoạt theo chu kỳ (tháng/năm/trả góp chu kỳ 3 tháng), thanh toán tự động qua VietQR, áp dụng mã giảm giá, cho tới bảng quản trị chuyên sâu dành cho Quản trị viên và Biên tập viên.

---

## ✨ Tính Năng Nổi Bật

### 🌐 1. Phân Hệ Người Dùng & Khách Hàng (Landing Page & Client Portal)
* **Trang Chủ Hiện Đại:** Hero banner công nghệ, thanh tìm kiếm gói dịch vụ tức thì, thống kê năng lực hạ tầng Data Center đạt chuẩn Tier III tại Việt Nam, Tin tức nổi bật và các Mã khuyến mãi đang chạy.
* **Bảng Giá & Gói Dịch Vụ (`/services`):** Lọc theo danh mục (Cloud VPS, Cloud Server, Web Hosting...), xem chi tiết thông số kỹ thuật (vCPU, RAM, SSD NVMe, Băng thông), chuyển đổi chu kỳ thanh toán với ưu đãi giảm giá năm.
* **Đăng Ký Mua & Thanh Toán VietQR (`/order/[planId]`):** Form đăng ký mua gói, bẫy lỗi hợp lệ dữ liệu, tích hợp mã VietQR động hỗ trợ chuyển khoản nhanh kèm nội dung giao dịch.
* **Thanh Toán Theo Chu Kỳ / Trả Góp 3 Tháng:** Hỗ trợ thanh toán từng đợt chu kỳ, tự động khấu trừ vào tổng gói gốc, tính toán lịch hẹn hạn đóng đợt kế tiếp (`nextDueDate`).
* **Trang Khuyến Mãi (`/promotions`):** Hiển thị danh sách coupon giảm giá đang chạy, sao chép mã 1 chạm (`WELCOME2026`, `CLOUD2026`, `CLOUD50`...), mã QR khuyến mãi.
* **Trang Tin Tức & Blog Công Nghệ (`/news`):** Tìm kiếm bài viết, lọc theo chủ đề (Bảo mật Cloud, DevOps, Kubernetes...), phân trang chuẩn SEO.
* **Khách Hàng & Đánh Giá (`/customers`):** Bục vinh danh **TOP 3 Khách Hàng Chi Tiêu Cao Nhất** (Top 1 Cúp Vàng, Top 2 Bạc, Top 3 Đồng), form gửi nhận xét đánh giá với cơ chế chống XSS.
* **Liên Hệ Đa Kênh (`/contact`):** Form gửi yêu cầu tư vấn với kiểm tra Regex họ tên tiếng Việt có dấu, số điện thoại Việt Nam (10 số), email hợp lệ và chống tấn công script.
* **Trang Giới Thiệu (`/about`):** Tầm nhìn, sứ mệnh, cam kết SLA 99.99% và sơ đồ hạ tầng trung tâm dữ liệu.
* **Cổng Tiếp Thị Liên Kết Affiliate (`/affiliate`):** Đăng ký làm đại lý/cộng tác viên nhận hoa hồng lên tới 20%.
* **Quản Lý Đơn Hàng Của Tôi (`/my-orders`):** Khách hàng theo dõi trạng thái đơn hàng (Chờ duyệt, Đang xử lý, Hoàn tất), xem số tiền còn lại và nút thanh toán chu kỳ.

### 🛡️ 2. Phân Hệ Quản Trị Hệ Thống (Admin & Editor Portal)
* **Tổng Quan & Thống Kê (`/admin/dashboard`):** Biểu đồ doanh thu theo tháng, thống kê tỷ lệ dịch vụ bán chạy, số lượng đơn hàng mới, khách hàng mới.
* **Quản Lý Đơn Hàng (`/admin/orders`):** Bộ lọc đa năng (tìm kiếm tài khoản/khách/gói, sắp xếp theo thời gian mới ↔ cũ, lọc giá tiền cao ↔ thấp, lọc trạng thái), duyệt thanh toán đơn toàn phần và duyệt chu kỳ đợt 1.
* **Quản Lý Gói Dịch Vụ & Bảng Giá (`/admin/services`):** Thêm, sửa, xóa, cấu hình thông số kỹ thuật (JSON specs), quản lý bảng giá theo chu kỳ tháng/năm.
* **Quản Lý Mã Khuyến Mãi (`/admin/promotions`):** Thiết lập tỷ lệ chiết khấu (%), thời hạn bắt đầu/kết thúc, giới hạn theo từng gói hoặc toàn sàn, kích hoạt/tạm khóa mã.
* **Quản Lý Đánh Giá (`/admin/reviews`):** Xem xét phản hồi của khách hàng, lọc theo số sao, xóa đánh giá không phù hợp.
* **Quản Lý Tin Tức & Bài Viết (`/admin/news`):** Soạn thảo bài viết, tải ảnh thumbnail, gắn thẻ tag, xuất bản tin tức.
* **Quản Lý Người Dùng & Phân Quyền (`/admin/users`):** Danh sách người dùng, cấp quyền Admin/Editor/User, khóa tài khoản.
* **Báo Cáo & Xuất Dữ Liệu (`/admin/reports`):** Xuất báo cáo doanh thu, đơn hàng, khách hàng ra định dạng file Excel (.xlsx) và CSV.
* **Nhật Ký Hệ Thống (`/admin/audit-logs`):** Ghi vết toàn bộ hành vi quan trọng (đăng nhập, đăng ký, thay đổi giá, duyệt đơn) phục vụ kiểm toán an toàn thông tin.

---

## 🏗️ Kiến Trúc Hệ Thống (Clean Architecture 4 Tầng)

Dự án tuân thủ mô hình **Clean Architecture (Onion Architecture)** phân tách độc lập các mối quan tâm:

```text
               ┌─────────────────────────────────────────────────────────┐
               │                   CloudService.WebApi                   │
               │      (RESTful API Controllers, Swagger/OpenAPI,         │
               │       JWT Auth Middleware, Rate Limiting, CORS)         │
               └────────────────────────────┬────────────────────────────┘
                                            │
               ┌────────────────────────────▼────────────────────────────┐
               │               CloudService.Infrastructure               │
               │   (EF Core 9, SQL Server, Repositories, QRCoder,        │
               │    BCrypt Hashing, Serilog Audit, Excel Exporter)       │
               └────────────────────────────┬────────────────────────────┘
                                            │
               ┌────────────────────────────▼────────────────────────────┐
               │                CloudService.Application                 │
               │    (Interfaces, DTOs, Business Use Cases & Services,    │
               │     Validation Rules, Domain Event Handlers)            │
               └────────────────────────────┬────────────────────────────┘
                                            │
               ┌────────────────────────────▼────────────────────────────┐
               │                   CloudService.Domain                   │
               │    (Entities, Aggregate Roots, Domain Exceptions,       │
               │     Enums, Value Objects, OOP Business Logic)           │
               └─────────────────────────────────────────────────────────┘
```

### Chi tiết vai trò từng tầng:
1. **`CloudService.Domain`**: Lõi trung tâm chứa thực thể nghiệp vụ (`ServicePlan`, `Promotion`, `OrderRequest`, `AppUser`, `AuditLog`...), các quy tắc nghiệp vụ thuần túy (OOP methods như `IsValid()`, `CalculateDiscount()`, `ToggleActive()`), Domain Exceptions. Hoàn toàn không phụ thuộc vào bất kỳ thư viện bên ngoài nào.
2. **`CloudService.Application`**: Chứa định nghĩa giao diện (`IRepository`, `IUnitOfWork`, `IAuthService`, `IPromotionService`...), Data Transfer Objects (DTOs), xử lý các Use Case và luồng nghiệp vụ.
3. **`CloudService.Infrastructure`**: Hiện thực hóa các interface ở tầng Application: truy xuất CSDL qua Entity Framework Core 9 và Dapper, lưu vết Audit Log vào SQL Server, sinh mã QR PNG với QRCoder, mã hóa mật khẩu BCrypt.
4. **`CloudService.WebApi`**: Tầng giao tiếp ngoại vi cung cấp các đầu mối REST API, cấu hình Dependency Injection, bảo mật JWT Token, xử lý Global Exception Middleware và tài liệu hóa qua Swagger UI.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Thành Phần | Công Nghệ / Thư Viện | Phiên Bản |
|---|---|---|
| **Backend Framework** | ASP.NET Core Web API (C#) | .NET 9.0 LTS |
| **ORM / Data Access** | Entity Framework Core, Dapper | 9.0.0 |
| **Database** | Microsoft SQL Server | 2022 |
| **Frontend Framework** | Next.js (App Router), React, TypeScript | Next.js 16.3.1, React 19 |
| **Styling & Icons** | Tailwind CSS, Lucide React | v3.4 / Latest |
| **Authentication** | JWT Bearer Token, Refresh Token, BCrypt.Net | 8.22.0 |
| **Tiện ích Backend** | QRCoder (VietQR), ClosedXML (Excel export) | 1.8.0 |
| **Unit Test & Mocking** | xUnit, Moq | xUnit 2.9.2, Moq 4.20.72 |
| **Code Coverage** | Coverlet Collector, ReportGenerator | Coverlet 6.0.2, ReportGen 5.5 |
| **DevOps & Container** | Docker, Docker Compose, GitHub Actions | Multi-stage build |

---

## 🔑 Tài Khoản Đăng Nhập Mặc Định

Cơ sở dữ liệu được tự động nạp dữ liệu mẫu (Seed Data) khi khởi chạy lần đầu:

| Quyền hạn | Tên đăng nhập / Email | Mật khẩu mặc định | Ghi chú |
|---|---|---|---|
| 👑 **Administrator** | `admin` / `admin@cloudservice.vn` | `Admin@123` | Toàn quyền quản trị hệ thống |
| ✍️ **Editor** | `editor` / `editor@cloudservice.vn` | `Editor@123` | Quản lý tin tức, dịch vụ & khuyến mãi |
| 👤 **Khách hàng** | `customer` / `customer@gmail.com` | `Customer@123` | Tài khoản khách hàng mẫu |

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### Cách 1: Khởi chạy bằng Docker Compose (Nhanh nhất)

Chỉ cần một lệnh duy nhất để khởi tạo toàn bộ Database SQL Server, Backend API và Frontend:

```bash
# 1. Clone repository
git clone https://github.com/0023413394-NguyenPhuongKiet/Web-Ban-Dich-Vu-Cloud.git
cd Web-Ban-Dich-Vu-Cloud

# 2. Build và khởi động 3 containers (Database + Backend + Frontend)
docker-compose up -d --build
```

* 🌐 **Giao diện Người dùng (Frontend Next.js):** [http://localhost:3000](http://localhost:3000)
* 📡 **API Backend (.NET 9 Web API):** [http://localhost:5286](http://localhost:5286)
* 📖 **Swagger OpenAPI UI:** [http://localhost:5286/swagger](http://localhost:5286/swagger)
* 🗄️ **SQL Server 2022:** `localhost:1433` (`sa` / `YourPassword123!`)

---

### Cách 2: Khởi chạy Cục bộ (Local Development)

#### 1. Cấu hình CSDL SQL Server:
Đảm bảo đã cài đặt SQL Server hoặc SQL LocalDB. Cập nhật chuỗi kết nối trong file `src/Backend/CloudService.WebApi/appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=CloudServiceDb;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

#### 2. Chạy Backend API:
```bash
cd src/Backend/CloudService.WebApi
dotnet restore
dotnet run
```
* Swagger UI sẵn sàng tại: `http://localhost:5286/swagger` hoặc `https://localhost:7000/swagger`

#### 3. Chạy Frontend Next.js:
```bash
cd src/frontend
npm install
npm run dev
```
* Mở trình duyệt truy cập: `http://localhost:3000`

---

## 🧪 Kiểm Thử & Test Coverage

Hệ thống được thiết kế bài bản với bộ **33 Test Cases** bao phủ các tầng Domain và Application theo đúng tiêu chuẩn đánh giá môn học:

```
src/Backend/CloudService.UnitTests/
├── Domain/
│   └── PromotionEntityTests.cs      # 14 tests: Kiểm tra logic nghiệp vụ IsValid, CalculateDiscount, ToggleActive
└── Application/
    ├── OrderServiceTests.cs         # 11 tests: Mocking IOrderRepository, validate số điện thoại, email, plan
    └── PromotionServiceTests.cs     #  8 tests: Mocking IPromotionRepository, áp dụng mã, kiểm tra hạn dùng
```

### 1. Chạy toàn bộ Unit Tests:
```powershell
cd src/Backend
dotnet test CloudService.UnitTests/CloudService.UnitTests.csproj --verbosity normal
```

### 2. Chạy Test và Xuất Báo Cáo Độ Phủ Mã (Code Coverage):
```powershell
cd src/Backend

# Thu thập dữ liệu Coverage Cobertura
dotnet test CloudService.UnitTests/CloudService.UnitTests.csproj --collect:"XPlat Code Coverage" --results-directory ./TestResults

# Xuất báo cáo trực quan dạng HTML bằng ReportGenerator
reportgenerator -reports:"TestResults/**/coverage.cobertura.xml" -targetdir:"TestResults/CoverageReport" -reporttypes:"Html;TextSummary"

# Mở báo cáo HTML trên trình duyệt
start TestResults/CoverageReport/index.html
```

📊 **Kết quả Test Coverage:**
* ✅ **Tổng số test:** 33/33 tests **PASSED (100%)**
* 🎯 `Promotion Entity`: **96.8%** Line Coverage
* 🎯 `ServicePlan Entity`: **91.6%** Line Coverage
* 🎯 `OrderRequest Entity`: **85.7%** Line Coverage
* 🎯 `OrderService`: **75.5%** Line Coverage

---

## 🔄 Quy Trình CI/CD & DevOps

Dự án áp dụng quy trình tích hợp và chuyển giao liên tục (**CI/CD**) thông qua **GitHub Actions** (`.github/workflows/ci.yml`) với 3 luồng kiểm thử tự động trên mỗi commit/pull request:

1. **Backend CI Pipeline:** Cài đặt .NET 9 SDK → `dotnet restore` → `dotnet build` → Chạy tự động **33 Unit Tests** và kiểm tra lỗi biên dịch.
2. **Frontend CI Pipeline:** Cài đặt Node.js 20.x → `npm ci` → Kiểm tra TypeScript & ESLint → `npm run build` ứng dụng Next.js.
3. **Docker Build Pipeline:** Sử dụng Docker Buildx kiểm thử build độc lập Docker Image cho Backend và Frontend để đảm bảo tính sẵn sàng triển khai.

---

## 📌 Lộ Trình 10 Pull Requests (PR Roadmap)

Toàn bộ quá trình phát triển được phân chia và quản lý khoa học qua 10 Pull Requests chuẩn hóa:

- [x] **PR#1: Project Setup & Architecture Skeleton**
  - Khởi tạo Solution .NET 9 Clean Architecture 4 tầng (`Domain`, `Application`, `Infrastructure`, `WebApi`).
  - Khởi tạo dự án Next.js 16 (TypeScript, Tailwind CSS). Cấu hình Swagger/OpenAPI, Dependency Injection và tài liệu dự án.
- [x] **PR#2: Database Design & Entity Framework Core**
  - Thiết kế Entities: `ServiceCategory`, `ServicePlan`, `PlanPrice`, `Promotion`, `OrderRequest`, `AppUser`, `Role`, `NewsArticle`, `AuditLog`.
  - Cấu hình `ApplicationDbContext`, Fluent API, Migrations và cơ chế Database Seeder tự động.
- [x] **PR#3: Services & Pricing Management**
  - Hiện thực CRUD danh mục dịch vụ, gói Cloud VPS/Hosting, thông số kỹ thuật dạng JSON.
  - Xây dựng bảng giá theo chu kỳ (tháng, năm), xử lý Unit of Work và Repository Pattern.
- [x] **PR#4: Authentication, Authorization & Security**
  - Xây dựng API Đăng nhập, Đăng ký, Cấp phát JWT Access Token & Refresh Token.
  - Phân quyền người dùng theo Role (`Admin`, `Editor`, `Customer`), mã hóa mật khẩu với `BCrypt.Net`.
- [x] **PR#5: News, Blog & Knowledge Base**
  - Xây dựng hệ thống quản lý bài viết tin tức công nghệ, hướng dẫn kỹ thuật Cloud.
  - Hỗ trợ lọc theo danh mục, tìm kiếm từ khóa, tính toán lượt xem (`ViewCount`) và phân trang dữ liệu.
- [x] **PR#6: Order Management & Billing Flow**
  - Xây dựng quy trình đặt mua dịch vụ, tạo mã đơn hàng chuẩn hóa `ORD-YYYYMMDD-XXXX`.
  - Hỗ trợ thanh toán toàn phần và thanh toán theo chu kỳ/trả góp 3 tháng. Validate chặt chẽ số điện thoại, email, trạng thái đơn hàng.
- [x] **PR#7: Promotions, Discount Engine & VietQR Code**
  - Xây dựng công cụ tính toán giảm giá (Coupon Engine) hỗ trợ theo % chiết khấu, thời hạn sử dụng.
  - Tích hợp thư viện `QRCoder` sinh ảnh mã QR chuyển khoản VietQR tự động theo gói dịch vụ.
- [x] **PR#8: Administration, Audit Logs & Reporting**
  - Xây dựng Dashboard thống kê doanh thu theo tháng, biểu đồ tỷ lệ dịch vụ.
  - Hệ thống ghi vết nhật ký kiểm toán `AuditLog` cho các thao tác nhạy cảm, cổng đăng ký `Affiliate`, xuất báo cáo doanh thu Excel.
- [x] **PR#9: Full-Featured Next.js Frontend Integration**
  - Tích hợp giao diện Landing Page (Trang chủ, Dịch vụ, Khuyến mãi, Tin tức, Giới thiệu, Khách hàng & Top 3 Vinh danh, Liên hệ).
  - Tích hợp giao diện Quản trị Admin Dashboard (Quản lý Đơn hàng với bộ lọc 3 chiều, Dịch vụ, Khuyến mãi, Đánh giá, Tin tức, Người dùng, Audit Logs).
- [x] **PR#10: Unit Testing, Test Coverage, Docker & CI/CD Pipeline**
  - Xây dựng bộ Unit Test 33 test cases với `xUnit + Moq`, cấu hình `Coverlet` và `ReportGenerator` xuất báo cáo độ phủ mã.
  - Đóng gói Dockerfile đa tầng (Multi-stage build), cấu hình `docker-compose.yml` và thiết lập luồng tự động hóa `GitHub Actions CI/CD`.

---

## 👥 Nhóm Tác Giả & Bản Quyền

* **Sinh viên thực hiện:** Nguyễn Phương Kiệt
* **Đơn vị:** Khoa Kỹ thuật & Công nghệ — Trường Đại học Đồng Tháp
* **Môn học:** Phát triển phần mềm hướng đối tượng (IN4211)
* **Giấy phép:** MIT License © 2026 CloudService Platform. All rights reserved.
