using CloudService.Domain.Entities;

namespace CloudService.Application.Interfaces;

/// <summary>
/// Repository cho ServicePlan.
/// </summary>
public interface IServicePlanRepository
{
    Task<ServicePlan?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy plan kèm Category và Current Prices.
    /// </summary>
    Task<ServicePlan?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default);

    Task<(List<ServicePlan> Items, int TotalCount)> GetPagedAsync(
        int pageNumber, int pageSize,
        int? categoryId = null, bool? isFeatured = null, bool includeInactive = false,
        string? searchTerm = null, string? sortBy = null, string? sortDirection = null,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);

    Task AddAsync(ServicePlan entity, CancellationToken cancellationToken = default);
    void Update(ServicePlan entity);
}
