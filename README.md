# Website Bán Dịch Vụ Cloud (VPS, Hosting, Domain...)

Dự án Bài tập lớn cuối kỳ - Học phần: **Phát triển phần mềm hướng đối tượng (IN4211)** - Trường Đại học Đồng Tháp.

---

## 🏗️ Kiến trúc Hệ thống (Clean Architecture 4 Tầng)

Dự án tuân thủ mô hình **Clean Architecture 4 tầng** tiêu chuẩn:

```text
       ┌───────────────────────────────────────────┐
       │             CloudService.WebApi           │  (REST API Controllers, Swagger, DI)
       └─────────────────────┬─────────────────────┘
                             │
       ┌─────────────────────▼─────────────────────┐
       │         CloudService.Infrastructure       │  (EF Core / Dapper, DB Context, Services)
       └─────────────────────┬─────────────────────┘
                             │
       ┌─────────────────────▼─────────────────────┐
       │          CloudService.Application         │  (Interfaces, DTOs, Use Cases, CQRS/Services)
       └─────────────────────┬─────────────────────┘
                             │
       ┌─────────────────────▼─────────────────────┐
       │            CloudService.Domain            │  (Entities, Enums, Value Objects)
       └───────────────────────────────────────────┘
```

### Chi tiết các tầng:
1. **`CloudService.Domain`**: Chứa Core Business Logic, Entities (`ServiceCategory`, `ServicePlan`, `OrderRequest`, `AppUser`, v.v.), Enums, Domain Exceptions. Không phụ thuộc vào bất kỳ thư viện bên ngoài nào.
2. **`CloudService.Application`**: Chứa Interfaces (`IRepository`, `IUnitOfWork`, `IAuthService`), DTOs, Business Rules. Phụ thuộc vào `Domain`.
3. **`CloudService.Infrastructure`**: Cài đặt thực tế cho các interface ở tầng `Application` (DbContext kết nối SQL Server, Repositories, Hash BCrypt, QRCoder, Serilog). Phụ thuộc vào `Application`.
4. **`CloudService.WebApi`**: Tầng giao tiếp REST API (ASP.NET Core Web API), đăng ký Dependency Injection, phân quyền JWT, Swagger/OpenAPI. Phụ thuộc vào `Application` và `Infrastructure`.

---

## 🛠️ Công nghệ sử dụng

- **Backend:** ASP.NET Core Web API (.NET 8/9), Entity Framework Core / Dapper.
- **Frontend:** Next.js (React, TypeScript, App Router).
- **Unit Testing:** xUnit + Moq.
- **Bảo mật:** JWT Authentication, Refresh Token, BCrypt Password Hashing, Role-based (Admin, Editor).
- **DevOps / CI-CD:** Docker, Docker Compose, GitHub Actions.

---

## 🚀 Hướng dẫn Khởi chạy Dự án (Chạy Cục bộ)

### 1. Khởi chạy Backend Web API
```bash
# Di chuyển vào thư mục WebApi
cd src/Backend/CloudService.WebApi

# Chạy dự án WebApi
dotnet run
```
* **Swagger UI:** Mở trình duyệt và truy cập `https://localhost:7000/swagger` (hoặc HTTP port tương ứng khi chạy) để xem giao diện Swagger OpenAPI.
* **Health Check API:** Truy cập `GET /api/health` để kiểm tra kết nối API.

### 2. Chạy Unit Tests
```bash
dotnet test
```

### 3. Khởi chạy Frontend (Next.js)
```bash
cd src/frontend

# Cài đặt thư viện (nếu chưa cài)
npm install

# Khởi chạy máy chủ phát triển Next.js
npm run dev
```
* Truy cập ứng dụng Next.js tại: `http://localhost:3000`

---

## 📌 Danh sách các Pull Request (PR Roadmap)
- [x] **PR#1:** Khởi tạo cấu trúc solution Clean Architecture 4 tầng, dự án Next.js Frontend, Swagger và README.
- [x] **PR#2:** Cơ sở dữ liệu (Entities, DbContext, Migration SQL Server).
- [ ] **PR#3:** Dịch vụ & Bảng giá (CRUD danh mục, gói dịch vụ, giá theo chu kỳ).
- [ ] **PR#4:** Đăng nhập & Phân quyền (JWT, Refresh Token, Role Admin/Editor).
- [ ] **PR#5:** Tin tức / Blog (CRUD bài viết, tìm kiếm, phân trang).
- [ ] **PR#6:** Đặt dịch vụ (Form đăng ký, quy trình xử lý đơn hàng).
- [ ] **PR#7:** Khuyến mãi & QR Code (Mã QR cho gói dịch vụ, khuyến mãi có thời hạn).
- [ ] **PR#8:** Quản trị & Thống kê (Dashboard, xuất Excel, Audit Log, Affiliate).
- [ ] **PR#9:** Tích hợp Frontend (Giao diện Landing Page & Admin Dashboard).
- [ ] **PR#10:** Docker & CI/CD (Dockerfile, docker-compose, GitHub Actions).
