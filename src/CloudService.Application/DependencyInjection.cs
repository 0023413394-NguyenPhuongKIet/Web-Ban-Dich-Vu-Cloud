using CloudService.Application.Interfaces;
using CloudService.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace CloudService.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Register Application services (PR#3)
        services.AddScoped<ServiceCategoryService>();
        services.AddScoped<ServicePlanService>();
        services.AddScoped<PlanPriceService>();

        // Register Promotion Service (PR#7)
        services.AddScoped<IPromotionService, PromotionService>();

        return services;
    }
}
