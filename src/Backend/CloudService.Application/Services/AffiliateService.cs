using CloudService.Application.Common.Models;
using CloudService.Application.DTOs.Affiliate;
using CloudService.Application.Interfaces;
using CloudService.Domain.Entities;
using CloudService.Domain.Exceptions;

namespace CloudService.Application.Services;

/// <summary>
/// Service quản lý nghiệp vụ Tiếp thị liên kết (Affiliate Application).
/// </summary>
public class AffiliateService : IAffiliateService
{
    private readonly IAffiliateRepository _affiliateRepo;
    private readonly IUnitOfWork _unitOfWork;

    public AffiliateService(IAffiliateRepository affiliateRepo, IUnitOfWork unitOfWork)
    {
        _affiliateRepo = affiliateRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<AffiliateApplicationDto> RegisterAsync(RegisterAffiliateDto dto, CancellationToken cancellationToken = default)
    {
        var application = new AffiliateApplication
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone,
            WebsiteUrl = dto.WebsiteUrl,
            PromotionPlan = dto.PromotionPlan,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        await _affiliateRepo.AddAsync(application, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(application);
    }

    public async Task<PagedResult<AffiliateApplicationDto>> GetApplicationsAsync(AffiliateQueryDto query, CancellationToken cancellationToken = default)
    {
        var (items, totalCount) = await _affiliateRepo.GetPagedAsync(query, cancellationToken);

        var dtos = items.Select(MapToDto).ToList();

        return new PagedResult<AffiliateApplicationDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = query.PageNumber,
            PageSize = query.PageSize
        };
    }

    public async Task<AffiliateApplicationDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var application = await _affiliateRepo.GetByIdAsync(id, cancellationToken);
        if (application == null)
        {
            throw new NotFoundException("Đơn đăng ký Affiliate", id);
        }

        return MapToDto(application);
    }

    public async Task<AffiliateApplicationDto> UpdateStatusAsync(int id, UpdateAffiliateStatusDto dto, CancellationToken cancellationToken = default)
    {
        var application = await _affiliateRepo.GetByIdAsync(id, cancellationToken);
        if (application == null)
        {
            throw new NotFoundException("Đơn đăng ký Affiliate", id);
        }

        application.Status = dto.Status;
        application.UpdatedAt = DateTime.UtcNow;

        await _affiliateRepo.UpdateAsync(application, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(application);
    }

    private static AffiliateApplicationDto MapToDto(AffiliateApplication entity)
    {
        return new AffiliateApplicationDto
        {
            Id = entity.Id,
            FullName = entity.FullName,
            Email = entity.Email,
            Phone = entity.Phone,
            WebsiteUrl = entity.WebsiteUrl,
            PromotionPlan = entity.PromotionPlan,
            Status = entity.Status,
            CreatedAt = entity.CreatedAt
        };
    }
}
