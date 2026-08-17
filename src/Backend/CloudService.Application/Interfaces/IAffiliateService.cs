using CloudService.Application.Common.Models;
using CloudService.Application.DTOs.Affiliate;

namespace CloudService.Application.Interfaces;

/// <summary>
/// Service quản lý đăng ký và phê duyệt Affiliate.
/// </summary>
public interface IAffiliateService
{
    Task<AffiliateApplicationDto> RegisterAsync(RegisterAffiliateDto dto, CancellationToken cancellationToken = default);
    Task<PagedResult<AffiliateApplicationDto>> GetApplicationsAsync(AffiliateQueryDto query, CancellationToken cancellationToken = default);
    Task<AffiliateApplicationDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<AffiliateApplicationDto> UpdateStatusAsync(int id, UpdateAffiliateStatusDto dto, CancellationToken cancellationToken = default);
}
