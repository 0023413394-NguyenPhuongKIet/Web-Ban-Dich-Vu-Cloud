-- ===================================================================
-- SCRIPT TẠO CƠ SỞ DỮ LIỆU CHUẨN CHO DỰ ÁN BÁN DỊCH VỤ CLOUD (IN4211)
-- Chạy script này trên SQL Server Management Studio (SSMS)
-- ===================================================================

CREATE DATABASE CloudServiceDb;
GO

USE CloudServiceDb;
GO

-- 1. Bảng Role (Phân quyền: Admin, Editor)
CREATE TABLE Roles (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Description NVARCHAR(255) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    IsDeleted BIT NOT NULL DEFAULT 0
);

-- 2. Bảng AppUser (Tài khoản quản trị & biên tập viên)
CREATE TABLE AppUsers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(100) NOT NULL UNIQUE,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(150) NOT NULL,
    RoleId INT NOT NULL CONSTRAINT FK_AppUsers_Roles FOREIGN KEY REFERENCES Roles(Id),
    IsActive BIT NOT NULL DEFAULT 1,
    RefreshToken NVARCHAR(255) NULL,
    RefreshTokenExpiryTime DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    IsDeleted BIT NOT NULL DEFAULT 0
);

-- 3. Bảng ServiceCategory (Danh mục dịch vụ: VPS, Hosting, Domain, SSL...)
CREATE TABLE ServiceCategories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL,
    Slug NVARCHAR(150) NOT NULL UNIQUE,
    Description NVARCHAR(MAX) NULL,
    IconClass NVARCHAR(100) NULL,
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    IsDeleted BIT NOT NULL DEFAULT 0
);

-- 4. Bảng ServicePlan (Gói dịch vụ cụ thể: VPS Pro 1, Cloud Hosting 2...)
CREATE TABLE ServicePlans (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ServiceCategoryId INT NOT NULL CONSTRAINT FK_ServicePlans_ServiceCategories FOREIGN KEY REFERENCES ServiceCategories(Id),
    Name NVARCHAR(150) NOT NULL,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(MAX) NOT NULL,
    SpecsJson NVARCHAR(MAX) NOT NULL, -- CPU, RAM, SSD, Bandwidth...
    QrCodeUrl NVARCHAR(255) NULL,
    IsFeatured BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    IsDeleted BIT NOT NULL DEFAULT 0
);

-- 5. Bảng PlanPrice (Bảng giá theo chu kỳ: Tháng/Năm)
CREATE TABLE PlanPrices (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ServicePlanId INT NOT NULL CONSTRAINT FK_PlanPrices_ServicePlans FOREIGN KEY REFERENCES ServicePlans(Id) ON DELETE CASCADE,
    BillingCycle NVARCHAR(50) NOT NULL, -- Monthly, Yearly
    OriginalPrice DECIMAL(18,2) NOT NULL,
    SellingPrice DECIMAL(18,2) NOT NULL,
    IsDefault BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    IsDeleted BIT NOT NULL DEFAULT 0
);

-- 6. Bảng Promotion (Khuyến mãi có thời hạn)
CREATE TABLE Promotions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ServicePlanId INT NULL CONSTRAINT FK_Promotions_ServicePlans FOREIGN KEY REFERENCES ServicePlans(Id),
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Title NVARCHAR(200) NOT NULL,
    DiscountPercent FLOAT NOT NULL,
    StartDate DATETIME2 NOT NULL,
    EndDate DATETIME2 NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    IsDeleted BIT NOT NULL DEFAULT 0
);

-- 7. Bảng NewsArticle (Tin tức, Blog kiến thức, Khuyến mãi)
CREATE TABLE NewsArticles (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(255) NOT NULL,
    Slug NVARCHAR(255) NOT NULL UNIQUE,
    Summary NVARCHAR(500) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    ThumbnailUrl NVARCHAR(255) NULL,
    Category NVARCHAR(50) NOT NULL, -- HDKT, KhuyenMai, ThongBao
    IsPublished BIT NOT NULL DEFAULT 1,
    AuthorId INT NOT NULL CONSTRAINT FK_NewsArticles_AppUsers FOREIGN KEY REFERENCES AppUsers(Id),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    IsDeleted BIT NOT NULL DEFAULT 0
);

-- 8. Bảng OrderRequest (Tiếp nhận yêu cầu đăng ký dịch vụ từ khách hàng)
CREATE TABLE OrderRequests (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ServicePlanId INT NOT NULL CONSTRAINT FK_OrderRequests_ServicePlans FOREIGN KEY REFERENCES ServicePlans(Id),
    CustomerName NVARCHAR(150) NOT NULL,
    CustomerEmail NVARCHAR(150) NOT NULL,
    CustomerPhone NVARCHAR(50) NOT NULL,
    CompanyName NVARCHAR(200) NULL,
    BillingCycle NVARCHAR(50) NOT NULL,
    TotalAmount DECIMAL(18,2) NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Processing, Completed, Rejected
    Note NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    IsDeleted BIT NOT NULL DEFAULT 0
);

-- 9. Bảng AffiliateApplication (Đăng ký làm đối tác/Affiliate)
CREATE TABLE AffiliateApplications (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL,
    Email NVARCHAR(150) NOT NULL,
    Phone NVARCHAR(50) NOT NULL,
    WebsiteUrl NVARCHAR(255) NULL,
    PromotionPlan NVARCHAR(MAX) NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    IsDeleted BIT NOT NULL DEFAULT 0
);

-- 10. Bảng AuditLog (Nhật ký thao tác hệ thống)
CREATE TABLE AuditLogs (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NULL CONSTRAINT FK_AuditLogs_AppUsers FOREIGN KEY REFERENCES AppUsers(Id),
    Action NVARCHAR(100) NOT NULL,
    EntityName NVARCHAR(100) NOT NULL,
    EntityId NVARCHAR(50) NULL,
    Details NVARCHAR(MAX) NULL,
    IpAddress NVARCHAR(50) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    IsDeleted BIT NOT NULL DEFAULT 0
);
GO

-- CHÈN DỮ LIỆU MẪU BAN ĐẦU
INSERT INTO Roles (Name, Description) VALUES 
('Admin', N'Quản trị viên toàn quyền hệ thống'),
('Editor', N'Biên tập viên quản lý bài viết và đơn hàng');

INSERT INTO ServiceCategories (Name, Slug, Description, DisplayOrder) VALUES
(N'Cloud VPS', 'cloud-vps', N'Máy chủ ảo tốc độ cao, ổ cứng NVMe SSD', 1),
(N'Web Hosting', 'web-hosting', N'Hosting giá rẻ tối ưu cho WordPress', 2),
(N'Tên miền (Domain)', 'domain', N'Đăng ký tên miền Việt Nam và Quốc tế', 3);
GO
