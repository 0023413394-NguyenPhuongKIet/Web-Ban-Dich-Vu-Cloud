using CloudService.Domain.Entities;

namespace CloudService.Application.Interfaces;

/// <summary>
/// Interface cho Repository quản lý Khuyến mãi (Promotion).
/// </summary>
public interface IPromotionRepository
{
    Task<Promotion?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<List<Promotion>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Promotion?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<bool> CodeExistsAsync(string code, int? excludeId = null, CancellationToken cancellationToken = default);
    Task<List<Promotion>> GetActivePromotionsAsync(int? servicePlanId = null, CancellationToken cancellationToken = default);
    Task AddAsync(Promotion entity, CancellationToken cancellationToken = default);
    void Update(Promotion entity);
    void Delete(Promotion entity);
}
