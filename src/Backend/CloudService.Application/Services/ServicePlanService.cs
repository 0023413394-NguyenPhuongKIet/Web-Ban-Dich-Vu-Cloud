using CloudService.Application.Common.Models;
using CloudService.Application.DTOs.Services;
using CloudService.Application.Interfaces;
using CloudService.Domain.Entities;
using CloudService.Domain.Exceptions;

namespace CloudService.Application.Services;

/// <summary>
/// Service xử lý nghiệp vụ cho Gói dịch vụ.
/// </summary>
public class ServicePlanService
{
    private readonly IServicePlanRepository _planRepo;
    private readonly IServiceCategoryRepository _categoryRepo;
    private readonly IPlanPriceRepository _priceRepo;
    private readonly IUnitOfWork _unitOfWork;

    public ServicePlanService(
        IServicePlanRepository planRepo,
        IServiceCategoryRepository categoryRepo,
        IPlanPriceRepository priceRepo,
        IUnitOfWork unitOfWork)
    {
        _planRepo = planRepo;
        _categoryRepo = categoryRepo;
        _priceRepo = priceRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<ServicePlanDto>> GetAllPagedAsync(
        int pageNumber = 1, int pageSize = 10,
        int? categoryId = null, bool? isFeatured = null, bool includeInactive = false,
        string? searchTerm = null, string? sortBy = null, string? sortDirection = null,
        CancellationToken cancellationToken = default)
    {
        var (items, totalCount) = await _planRepo.GetPagedAsync(
            pageNumber, pageSize, categoryId, isFeatured, includeInactive,
            searchTerm, sortBy, sortDirection, cancellationToken);

        var dtos = new List<ServicePlanDto>();
        foreach (var plan in items)
        {
            var prices = await _priceRepo.GetCurrentPricesByPlanIdAsync(plan.Id, cancellationToken);
            dtos.Add(MapToDto(plan, prices));
        }

        return new PagedResult<ServicePlanDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<ServicePlanDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var plan = await _planRepo.GetByIdWithDetailsAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(ServicePlan), id);

        var prices = await _priceRepo.GetCurrentPricesByPlanIdAsync(plan.Id, cancellationToken);
        return MapToDto(plan, prices);
    }

    public async Task<ServicePlanDto> CreateAsync(CreateServicePlanDto dto, CancellationToken cancellationToken = default)
    {
        // Validate category tồn tại
        if (!await _categoryRepo.ExistsAsync(dto.ServiceCategoryId, cancellationToken))
            throw new NotFoundException(nameof(ServiceCategory), dto.ServiceCategoryId);

        var plan = new ServicePlan
        {
            ServiceCategoryId = dto.ServiceCategoryId,
            Name = dto.Name,
            Code = dto.Code,
            Description = dto.Description,
            SpecsJson = dto.SpecsJson,
            IsFeatured = dto.IsFeatured,
            IsActive = true
        };

        await _planRepo.AddAsync(plan, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(plan, new List<PlanPrice>());
    }

    public async Task<ServicePlanDto> UpdateAsync(int id, UpdateServicePlanDto dto, CancellationToken cancellationToken = default)
    {
        var plan = await _planRepo.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(ServicePlan), id);

        plan.Name = dto.Name;
        plan.Code = dto.Code;
        plan.Description = dto.Description;
        plan.SpecsJson = dto.SpecsJson;
        plan.IsFeatured = dto.IsFeatured;
        plan.UpdatedAt = DateTime.UtcNow;

        _planRepo.Update(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var prices = await _priceRepo.GetCurrentPricesByPlanIdAsync(plan.Id, cancellationToken);
        return MapToDto(plan, prices);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var plan = await _planRepo.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(ServicePlan), id);

        plan.IsActive = false;
        plan.IsDeleted = true;
        plan.UpdatedAt = DateTime.UtcNow;

        _planRepo.Update(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static ServicePlanDto MapToDto(ServicePlan entity, List<PlanPrice> currentPrices)
    {
        return new ServicePlanDto
        {
            Id = entity.Id,
            ServiceCategoryId = entity.ServiceCategoryId,
            CategoryName = entity.Category?.Name ?? string.Empty,
            Name = entity.Name,
            Code = entity.Code,
            Description = entity.Description,
            SpecsJson = entity.SpecsJson,
            QrCodeUrl = entity.QrCodeUrl,
            IsFeatured = entity.IsFeatured,
            IsActive = entity.IsActive,
            CurrentPrices = currentPrices.Select(p => new PlanPriceDto
            {
                Id = p.Id,
                ServicePlanId = p.ServicePlanId,
                BillingCycle = p.BillingCycle,
                OriginalPrice = p.OriginalPrice,
                SellingPrice = p.SellingPrice,
                EffectiveDate = p.EffectiveDate,
                IsCurrent = p.IsCurrent
            }).ToList()
        };
    }
}
