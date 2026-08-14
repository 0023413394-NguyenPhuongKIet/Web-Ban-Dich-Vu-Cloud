using Microsoft.Extensions.DependencyInjection;

namespace CloudService.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Register Application services here (e.g. Services, UseCases, Validators, Mappers)
        return services;
    }
}
