using CloudService.Application.DTOs.Affiliate;
using CloudService.Domain.Entities;

namespace CloudService.Application.Interfaces;

public interface IAffiliateRepository
{
    Task<AffiliateApplication> AddAsync(AffiliateApplication entity, CancellationToken cancellationToken = default);
    Task<AffiliateApplication?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<(List<AffiliateApplication> Items, int TotalCount)> GetPagedAsync(AffiliateQueryDto query, CancellationToken cancellationToken = default);
    Task<List<AffiliateApplication>> GetAllFilteredAsync(AffiliateQueryDto query, CancellationToken cancellationToken = default);
    Task UpdateAsync(AffiliateApplication entity, CancellationToken cancellationToken = default);
}
