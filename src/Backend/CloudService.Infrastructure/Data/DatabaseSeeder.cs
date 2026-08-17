using CloudService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CloudService.Infrastructure.Data;

/// <summary>
/// DatabaseSeeder: Tự động tạo dữ liệu mẫu (Roles + tài khoản Admin/Editor)
/// khi khởi động ứng dụng lần đầu nếu DB còn trống.
/// Chạy một lần duy nhất — idempotent (an toàn khi chạy nhiều lần).
/// </summary>
public static class DatabaseSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        try
        {
            // 1. Chạy migration nếu database chưa có bảng
            await context.Database.MigrateAsync();

            // 2. Seed Roles nếu chưa có (không set Id cứng để SQL Server tự tăng Identity)
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

            // 3. Seed AppUsers nếu chưa có tài khoản admin / editor
            if (!await context.AppUsers.AnyAsync(u => u.Username == "admin"))
            {
                var adminUser = new AppUser
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

            if (!await context.AppUsers.AnyAsync(u => u.Username == "editor"))
            {
                var editorUser = new AppUser
                {
                    Username = "editor",
                    Email = "editor@cloudservice.vn",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Editor@123"),
                    FullName = "Biên tập viên",
                    RoleId = editorRole.Id,
                    IsActive = true,
                    IsDeleted = false,
                    CreatedAt = DateTime.UtcNow
                };
                context.AppUsers.Add(editorUser);
            }

            // 4. Seed Promotions mẫu nếu chưa có
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
            }

            await context.SaveChangesAsync();
            logger.LogInformation("[Seeder] Dữ liệu mẫu khởi tạo thành công (Admin, Editor, Promotions).");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[Seeder] Lỗi khi seed dữ liệu: {Message}", ex.Message);
        }
    }
}
