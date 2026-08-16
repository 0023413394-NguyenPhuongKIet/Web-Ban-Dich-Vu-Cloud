using CloudService.Application.Common.Models;
using CloudService.Application.DTOs.Services;
using CloudService.Application.Interfaces;
using CloudService.Domain.Entities;
using CloudService.Domain.Exceptions;

namespace CloudService.Application.Services;

/// <summary>
/// Service xử lý nghiệp vụ cho Danh mục dịch vụ.
/// </summary>
public class ServiceCategoryService
{
    private readonly IServiceCategoryRepository _categoryRepo;
    private readonly IUnitOfWork _unitOfWork;

    public ServiceCategoryService(IServiceCategoryRepository categoryRepo, IUnitOfWork unitOfWork)
    {
        _categoryRepo = categoryRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<ServiceCategoryDto>> GetAllPagedAsync(
        int pageNumber = 1, int pageSize = 10, bool includeInactive = false, string? searchTerm = null,
        CancellationToken cancellationToken = default)
    {
        var (items, totalCount) = await _categoryRepo.GetPagedAsync(
            pageNumber, pageSize, includeInactive, searchTerm, cancellationToken);

        return new PagedResult<ServiceCategoryDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<ServiceCategoryDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await _categoryRepo.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(ServiceCategory), id);

        return MapToDto(category);
    }

    public async Task<ServiceCategoryDto> CreateAsync(CreateServiceCategoryDto dto, CancellationToken cancellationToken = default)
    {
        // Validate slug unique
        if (await _categoryRepo.SlugExistsAsync(dto.Slug, cancellationToken: cancellationToken))
            throw new DomainException($"Slug '{dto.Slug}' đã tồn tại.");

        var category = new ServiceCategory
        {
            Name = dto.Name,
            Slug = dto.Slug,
            Description = dto.Description,
            IconClass = dto.IconClass,
            DisplayOrder = dto.DisplayOrder,
            IsActive = true
        };

        await _categoryRepo.AddAsync(category, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(category);
    }

    public async Task<ServiceCategoryDto> UpdateAsync(int id, UpdateServiceCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var category = await _categoryRepo.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(ServiceCategory), id);

        // Validate slug unique (trừ chính nó)
        if (await _categoryRepo.SlugExistsAsync(dto.Slug, excludeId: id, cancellationToken: cancellationToken))
            throw new DomainException($"Slug '{dto.Slug}' đã tồn tại.");

        category.Name = dto.Name;
        category.Slug = dto.Slug;
        category.Description = dto.Description;
        category.IconClass = dto.IconClass;
        category.DisplayOrder = dto.DisplayOrder;
        category.UpdatedAt = DateTime.UtcNow;

        _categoryRepo.Update(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(category);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await _categoryRepo.GetByIdWithPlansAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(ServiceCategory), id);

        // Domain rule: không xóa category còn plan active
        category.Deactivate();
        category.IsDeleted = true;
        category.UpdatedAt = DateTime.UtcNow;

        _categoryRepo.Update(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static ServiceCategoryDto MapToDto(ServiceCategory entity)
    {
        return new ServiceCategoryDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Slug = entity.Slug,
            Description = entity.Description,
            IconClass = entity.IconClass,
            DisplayOrder = entity.DisplayOrder,
            IsActive = entity.IsActive,
            PlanCount = entity.ServicePlans?.Count(p => !p.IsDeleted) ?? 0
        };
    }
}
