using CloudService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CloudService.Infrastructure.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        try
        {
            await context.Database.MigrateAsync();

            var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
            if (adminRole == null)
            {
                adminRole = new Role
                {
                    Name = "Admin",
                    Description = "Quản trị viên toàn quyền hệ thống"
                };
                context.Roles.Add(adminRole);
            }

            var editorRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Editor");
            if (editorRole == null)
            {
                editorRole = new Role
                {
                    Name = "Editor",
                    Description = "Biên tập viên nội dung (tin tức, dịch vụ)"
                };
                context.Roles.Add(editorRole);
            }

            await context.SaveChangesAsync();

            var adminUser = await context.AppUsers.FirstOrDefaultAsync(u => u.Username == "admin");
            if (adminUser == null)
            {
                adminUser = new AppUser
                {
                    Username = "admin",
                    Email = "admin@cloudservice.vn",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    FullName = "Quản trị viên hệ thống",
                    RoleId = adminRole.Id,
                    IsActive = true,
                    IsDeleted = false,
                    CreatedAt = DateTime.UtcNow
                };
                context.AppUsers.Add(adminUser);
            }

            var editorUser = await context.AppUsers.FirstOrDefaultAsync(u => u.Username == "editor");
            if (editorUser == null)
            {
                editorUser = new AppUser
                {
                    Username = "editor",
                    Email = "editor@cloudservice.vn",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Editor@123"),
                    FullName = "Biên tập viên nội dung",
                    RoleId = editorRole.Id,
                    IsActive = true,
                    IsDeleted = false,
                    CreatedAt = DateTime.UtcNow
                };
                context.AppUsers.Add(editorUser);
            }

            await context.SaveChangesAsync();

            if (!await context.Promotions.AnyAsync())
            {
                var now = DateTime.UtcNow;
                var samplePromotions = new List<Promotion>
                {
                    new Promotion
                    {
                        Code = "WELCOME2026",
                        Title = "Khuyến mãi chào mừng năm mới 2026 - Giảm 20% toàn bộ dịch vụ",
                        DiscountPercent = 20.0,
                        StartDate = now.AddDays(-10),
                        EndDate = now.AddDays(90),
                        IsActive = true,
                        IsDeleted = false,
                        CreatedAt = now
                    },
                    new Promotion
                    {
                        Code = "CLOUD50",
                        Title = "Siêu sale Cloud Server - Giảm ngay 50%",
                        DiscountPercent = 50.0,
                        StartDate = now.AddDays(-5),
                        EndDate = now.AddDays(30),
                        IsActive = true,
                        IsDeleted = false,
                        CreatedAt = now
                    },
                    new Promotion
                    {
                        Code = "EXPIRED10",
                        Title = "Mã khuyến mãi đã hết hạn (Mẫu thử nghiệm)",
                        DiscountPercent = 10.0,
                        StartDate = now.AddDays(-60),
                        EndDate = now.AddDays(-5),
                        IsActive = true,
                        IsDeleted = false,
                        CreatedAt = now.AddDays(-60)
                    }
                };

                context.Promotions.AddRange(samplePromotions);
                await context.SaveChangesAsync();
            }

            if (!await context.NewsArticles.AnyAsync())
            {
                var articles = new List<NewsArticle>
                {
                    NewsArticle.Create(
                        title: "Hướng Dẫn Cài Đặt Web Server Nginx Trên Cloud VPS Ubuntu 24.04",
                        summary: "Bài viết hướng dẫn từng bước cấu hình máy chủ web Nginx, SSL Let's Encrypt và tối ưu hiệu năng trên môi trường Linux Ubuntu mới nhất.",
                        content: @"<h2>1. Giới thiệu</h2>
<p>Nginx là một trong những máy chủ web mã nguồn mở phổ biến và có hiệu năng cao nhất hiện nay, thích hợp xử lý hàng triệu kết nối đồng thời.</p>
<h2>2. Cập nhật hệ điều hành</h2>
<pre><code>sudo apt update && sudo apt upgrade -y</code></pre>
<h2>3. Cài đặt Nginx</h2>
<pre><code>sudo apt install nginx -y</code></pre>
<h2>4. Kiểm tra dịch vụ</h2>
<pre><code>sudo systemctl status nginx</code></pre>
<p>Chúc mừng bạn đã hoàn tất cài đặt Nginx trên Cloud VPS!</p>",
                        category: "HDKT",
                        authorId: adminUser.Id,
                        thumbnailUrl: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800",
                        isPublished: true
                    ),
                    NewsArticle.Create(
                        title: "Bùng Nổ Khuyến Mãi Cloud VPS SSD Giảm 50% Trọn Đời Năm 2026",
                        summary: "Nhân dịp chào mừng hạ tầng Cloud Data Center thế hệ mới, nhận ngay ưu đãi giảm giá 50% trọn đời khi đăng ký gói Cloud VPS Pro hoặc Business.",
                        content: @"<h2>Chương trình ưu đãi đặc biệt</h2>
<p>Từ ngày 01/08/2026 đến hết 31/08/2026, quý khách hàng đăng ký dịch vụ Cloud VPS sẽ nhận được:</p>
<ul>
    <li>Giảm trực tiếp <strong>50%</strong> chi phí chu kỳ thanh toán theo năm.</li>
    <li>Miễn phí Backup dữ liệu tự động hàng tuần trị giá 500.000 VNĐ.</li>
    <li>Tặng chứng chỉ bảo mật SSL Cao Cấp.</li>
</ul>
<p>Mã khuyến mãi áp dụng: <strong>CLOUD2026PRO</strong></p>",
                        category: "KhuyenMai",
                        authorId: editorUser.Id,
                        thumbnailUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800",
                        isPublished: true
                    ),
                    NewsArticle.Create(
                        title: "Thông Báo Nâng Cấp Hệ Thống Data Center TP. Hồ Chí Minh",
                        summary: "Lịch bảo trì và nâng cấp định kỳ hệ thống mạng Core Switch 100Gbps tại Trung tâm dữ liệu TP. Hồ Chí Minh nhằm nâng cao độ ổn định dịch vụ.",
                        content: @"<h2>Thông tin nâng cấp hạ tầng</h2>
<p>Kính gửi Quý khách hàng,</p>
<p>Nhằm nâng cao chất lượng dịch vụ và mở rộng băng thông quốc tế, chúng tôi sẽ tiến hành nâng cấp hệ thống Core Network theo lịch trình sau:</p>
<ul>
    <li><strong>Thời gian:</strong> Từ 01:00 đến 03:00 ngày Chủ Nhật.</li>
    <li><strong>Phạm vi ảnh hưởng:</strong> Các dịch vụ Cloud VPS tại Region HCM có thể có độ trễ nhẹ trong 5-10 phút.</li>
</ul>
<p>Rất mong quý khách hàng thông cảm về sự bất tiện này.</p>",
                        category: "ThongBao",
                        authorId: adminUser.Id,
                        thumbnailUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
                        isPublished: true
                    ),
                    NewsArticle.Create(
                        title: "Xu Hướng Điện Toán Đám Mây Và An Ninh Mạng Năm 2026",
                        summary: "Phân tích toàn cảnh công nghệ điện toán đám mây kết hợp AI, mô hình Zero Trust Security và giải pháp sao lưu dự phòng đám mây phân tán.",
                        content: @"<h2>1. Xu hướng AI Native Cloud</h2>
<p>Các hạ tầng Cloud hiện nay tích hợp trực tiếp phần cứng GPU và công cụ học máy tự động hóa giám sát an ninh.</p>
<h2>2. Mô hình bảo mật Zero Trust</h2>
<p>Không tin tưởng bất kỳ kết nối nào dù bên trong hay bên ngoài mạng nội bộ, luôn luôn xác thực danh tính qua JWT và MFA.</p>",
                        category: "TinTuc",
                        authorId: editorUser.Id,
                        thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
                        isPublished: true
                    )
                };

                articles[0].ViewCount = 1250;
                articles[1].ViewCount = 3420;
                articles[2].ViewCount = 890;
                articles[3].ViewCount = 2100;

                context.NewsArticles.AddRange(articles);
                await context.SaveChangesAsync();
            }

            if (!await context.ServiceCategories.AnyAsync())
            {
                var categories = new List<ServiceCategory>
                {
                    new ServiceCategory
                    {
                        Name = "VPS / Cloud Server",
                        Slug = "vps-cloud-server",
                        Description = "Máy chủ ảo VPS hiệu năng cao trên nền tảng Cloud",
                        IconClass = "fa-solid fa-server",
                        DisplayOrder = 1,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new ServiceCategory
                    {
                        Name = "Hosting / Web Hosting",
                        Slug = "hosting-web-hosting",
                        Description = "Dịch vụ lưu trữ website chuyên nghiệp",
                        IconClass = "fa-solid fa-globe",
                        DisplayOrder = 2,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new ServiceCategory
                    {
                        Name = "Domain / Tên Miền",
                        Slug = "domain-ten-mien",
                        Description = "Đăng ký và quản lý tên miền quốc tế, .vn",
                        IconClass = "fa-solid fa-link",
                        DisplayOrder = 3,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new ServiceCategory
                    {
                        Name = "Email / Email Server",
                        Slug = "email-email-server",
                        Description = "Dịch vụ Email Server doanh nghiệp",
                        IconClass = "fa-solid fa-envelope",
                        DisplayOrder = 4,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    }
                };

                context.ServiceCategories.AddRange(categories);
                await context.SaveChangesAsync();
            }

            if (!await context.ServicePlans.AnyAsync())
            {
                var vpsCategory = await context.ServiceCategories.FirstOrDefaultAsync(c => c.Slug == "vps-cloud-server");
                var hostingCategory = await context.ServiceCategories.FirstOrDefaultAsync(c => c.Slug == "hosting-web-hosting");
                var domainCategory = await context.ServiceCategories.FirstOrDefaultAsync(c => c.Slug == "domain-ten-mien");

                if (vpsCategory != null)
                {
                    var vpsPlans = new List<ServicePlan>
                    {
                        new ServicePlan
                        {
                            ServiceCategoryId = vpsCategory.Id,
                            Name = "VPS Starter",
                            Code = "VPS-STARTER",
                            Description = "Gói VPS cơ bản cho website cá nhân và ứng dụng nhỏ",
                            SpecsJson = "{\"cpu\":\"2 vCPU\",\"ram\":\"2 GB\",\"storage\":\"50 GB SSD\",\"bandwidth\":\"1 TB\"}",
                            QrCodeUrl = "",
                            IsFeatured = false,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        },
                        new ServicePlan
                        {
                            ServiceCategoryId = vpsCategory.Id,
                            Name = "VPS Pro",
                            Code = "VPS-PRO",
                            Description = "Gói VPS hiệu năng cao cho doanh nghiệp và ứng dụng chuyên nghiệp",
                            SpecsJson = "{\"cpu\":\"4 vCPU\",\"ram\":\"8 GB\",\"storage\":\"200 GB SSD\",\"bandwidth\":\"5 TB\"}",
                            QrCodeUrl = "",
                            IsFeatured = true,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        },
                        new ServicePlan
                        {
                            ServiceCategoryId = vpsCategory.Id,
                            Name = "VPS Business",
                            Code = "VPS-BUSINESS",
                            Description = "Gói VPS cao cấp cho doanh nghiệp lớn và ứng dụng đòi hỏi hiệu năng cao",
                            SpecsJson = "{\"cpu\":\"8 vCPU\",\"ram\":\"16 GB\",\"storage\":\"500 GB SSD\",\"bandwidth\":\"10 TB\"}",
                            QrCodeUrl = "",
                            IsFeatured = true,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        }
                    };

                    context.ServicePlans.AddRange(vpsPlans);
                    await context.SaveChangesAsync();
                }

                if (hostingCategory != null)
                {
                    var hostingPlans = new List<ServicePlan>
                    {
                        new ServicePlan
                        {
                            ServiceCategoryId = hostingCategory.Id,
                            Name = "Hosting Basic",
                            Code = "HOSTING-BASIC",
                            Description = "Gói hosting cơ bản cho website cá nhân",
                            SpecsJson = "{\"storage\":\"10 GB\",\"bandwidth\":\"100 GB\",\"email_accounts\":\"5\",\"databases\":\"3\"}",
                            QrCodeUrl = "",
                            IsFeatured = false,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        },
                        new ServicePlan
                        {
                            ServiceCategoryId = hostingCategory.Id,
                            Name = "Hosting Pro",
                            Code = "HOSTING-PRO",
                            Description = "Gói hosting cao cấp cho doanh nghiệp nhỏ",
                            SpecsJson = "{\"storage\":\"50 GB\",\"bandwidth\":\"500 GB\",\"email_accounts\":\"20\",\"databases\":\"10\"}",
                            QrCodeUrl = "",
                            IsFeatured = true,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        }
                    };

                    context.ServicePlans.AddRange(hostingPlans);
                    await context.SaveChangesAsync();
                }

                if (domainCategory != null)
                {
                    var domainPlans = new List<ServicePlan>
                    {
                        new ServicePlan
                        {
                            ServiceCategoryId = domainCategory.Id,
                            Name = "Domain .com",
                            Code = "DOMAIN-COM",
                            Description = "Đăng ký tên miền quốc tế .com",
                            SpecsJson = "{\"extension\":\".com\",\"type\":\"International\",\"dns_management\":true}",
                            QrCodeUrl = "",
                            IsFeatured = true,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        },
                        new ServicePlan
                        {
                            ServiceCategoryId = domainCategory.Id,
                            Name = "Domain .vn",
                            Code = "DOMAIN-VN",
                            Description = "Đăng ký tên miền quốc tế .vn",
                            SpecsJson = "{\"extension\":\".vn\",\"type\":\"International\",\"dns_management\":true}",
                            QrCodeUrl = "",
                            IsFeatured = true,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        }
                    };

                    context.ServicePlans.AddRange(domainPlans);
                    await context.SaveChangesAsync();
                }
            }

            if (!await context.PlanPrices.AnyAsync())
            {
                var plans = await context.ServicePlans.ToListAsync();

                foreach (var plan in plans)
                {
                    var basePrice = plan.Code switch
                    {
                        "VPS-STARTER" => 200000,
                        "VPS-PRO" => 600000,
                        "VPS-BUSINESS" => 1200000,
                        "HOSTING-BASIC" => 100000,
                        "HOSTING-PRO" => 300000,
                        "DOMAIN-COM" => 120000,
                        "DOMAIN-VN" => 80000,
                        _ => 150000
                    };

                    var prices = new List<PlanPrice>
                    {
                        new PlanPrice
                        {
                            ServicePlanId = plan.Id,
                            BillingCycle = "monthly",
                            OriginalPrice = basePrice,
                            SellingPrice = basePrice,
                            IsDefault = true,
                            IsCurrent = true,
                            EffectiveDate = DateTime.UtcNow,
                            CreatedAt = DateTime.UtcNow
                        },
                        new PlanPrice
                        {
                            ServicePlanId = plan.Id,
                            BillingCycle = "yearly",
                            OriginalPrice = basePrice * 10,
                            SellingPrice = basePrice * 10,
                            IsDefault = false,
                            IsCurrent = true,
                            EffectiveDate = DateTime.UtcNow,
                            CreatedAt = DateTime.UtcNow
                        }
                    };

                    context.PlanPrices.AddRange(prices);
                }

                await context.SaveChangesAsync();
            }

            logger.LogInformation("[Seeder] Dữ liệu mẫu khởi tạo hoàn tất.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[Seeder] Lỗi khi seed dữ liệu: {Message}", ex.Message);
        }
    }
}