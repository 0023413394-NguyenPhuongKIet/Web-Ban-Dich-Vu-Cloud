using CloudService.Domain.Entities;

namespace CloudService.Application.Interfaces;

/// <summary>
/// Repository cho ServiceCategory.
/// </summary>
public interface IServiceCategoryRepository
{
    Task<ServiceCategory?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy category kèm navigation ServicePlans (dùng cho logic Deactivate).
    /// </summary>
    Task<ServiceCategory?> GetByIdWithPlansAsync(int id, CancellationToken cancellationToken = default);

    Task<List<ServiceCategory>> GetAllAsync(bool includeInactive = false, CancellationToken cancellationToken = default);

    Task<(List<ServiceCategory> Items, int TotalCount)> GetPagedAsync(
        int pageNumber, int pageSize, bool includeInactive = false, string? searchTerm = null,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> SlugExistsAsync(string slug, int? excludeId = null, CancellationToken cancellationToken = default);

    Task AddAsync(ServiceCategory entity, CancellationToken cancellationToken = default);
    void Update(ServiceCategory entity);
}
