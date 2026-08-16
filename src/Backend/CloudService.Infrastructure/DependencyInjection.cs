using CloudService.Application.Common.Interfaces;
using CloudService.Infrastructure.Data;
using CloudService.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CloudService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        // Đăng ký dịch vụ Bảo mật JWT và Sinh mã QR vào Dependency Injection Container
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IQrCodeService, QrCodeService>();

        return services;
    }
}


