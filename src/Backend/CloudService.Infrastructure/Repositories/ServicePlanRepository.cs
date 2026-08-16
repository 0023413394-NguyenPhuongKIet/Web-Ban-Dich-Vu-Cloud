using CloudService.Application.Interfaces;
using CloudService.Domain.Entities;
using CloudService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CloudService.Infrastructure.Repositories;

public class ServicePlanRepository : IServicePlanRepository
{
    private readonly ApplicationDbContext _context;

    public ServicePlanRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ServicePlan?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.ServicePlans
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<ServicePlan?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.ServicePlans
            .Include(p => p.Category)
            .Include(p => p.PlanPrices.Where(pp => pp.IsCurrent))
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<(List<ServicePlan> Items, int TotalCount)> GetPagedAsync(
        int pageNumber, int pageSize,
        int? categoryId = null, bool? isFeatured = null, bool includeInactive = false,
        string? searchTerm = null, string? sortBy = null, string? sortDirection = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.ServicePlans
            .Include(p => p.Category)
            .AsQueryable();

        if (!includeInactive)
            query = query.Where(p => p.IsActive);

        if (categoryId.HasValue)
            query = query.Where(p => p.ServiceCategoryId == categoryId.Value);

        if (isFeatured.HasValue)
            query = query.Where(p => p.IsFeatured == isFeatured.Value);

        if (!string.IsNullOrWhiteSpace(searchTerm))
            query = query.Where(p => p.Name.Contains(searchTerm) || p.Description.Contains(searchTerm));

        // Sorting
        query = sortBy?.ToLower() switch
        {
            "name" => sortDirection?.ToLower() == "desc"
                ? query.OrderByDescending(p => p.Name)
                : query.OrderBy(p => p.Name),
            "createdat" => sortDirection?.ToLower() == "desc"
                ? query.OrderByDescending(p => p.CreatedAt)
                : query.OrderBy(p => p.CreatedAt),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.ServicePlans.AnyAsync(p => p.Id == id, cancellationToken);
    }

    public async Task AddAsync(ServicePlan entity, CancellationToken cancellationToken = default)
    {
        await _context.ServicePlans.AddAsync(entity, cancellationToken);
    }

    public void Update(ServicePlan entity)
    {
        _context.ServicePlans.Update(entity);
    }
}
