using CloudService.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace CloudService.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Register Application services
        services.AddScoped<ServiceCategoryService>();
        services.AddScoped<ServicePlanService>();
        services.AddScoped<PlanPriceService>();
        services.AddScoped<NewsArticleService>();

        return services;
    }
}
