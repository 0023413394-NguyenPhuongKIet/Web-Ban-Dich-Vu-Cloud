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

            await context.SaveChangesAsync();
            logger.LogInformation("[Seeder] Dữ liệu mẫu khởi tạo thành công (Admin/Editor sẵn sàng).");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[Seeder] Lỗi khi seed dữ liệu: {Message}", ex.Message);
        }
    }
}
