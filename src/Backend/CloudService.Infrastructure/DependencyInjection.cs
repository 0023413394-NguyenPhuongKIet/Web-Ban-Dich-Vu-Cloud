using CloudService.Application.Common.Interfaces;
using CloudService.Application.Interfaces;
using CloudService.Infrastructure.Data;
using CloudService.Infrastructure.Repositories;
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

        // Register Repositories (PR#3, PR#5, PR#7 & PR#8)
        services.AddScoped<IServiceCategoryRepository, ServiceCategoryRepository>();
        services.AddScoped<IServicePlanRepository, ServicePlanRepository>();
        services.AddScoped<IPlanPriceRepository, PlanPriceRepository>();
        services.AddScoped<INewsArticleRepository, NewsArticleRepository>();
        services.AddScoped<IPromotionRepository, PromotionRepository>();
        services.AddScoped<IAuditLogRepository, AuditLogRepository>();
        services.AddScoped<IAffiliateRepository, AffiliateRepository>();
        services.AddScoped<IOrderRequestRepository, OrderRequestRepository>();
        services.AddScoped<IDashboardRepository, DashboardRepository>();

        // Register Unit of Work (PR#3)
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Register Authentication & QR Code Services (PR#4 & PR#7)
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IQrCodeService, QrCodeService>();

        return services;
    }
}
