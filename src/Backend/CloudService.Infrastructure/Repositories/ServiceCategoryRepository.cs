using CloudService.Application.Interfaces;
using CloudService.Domain.Entities;
using CloudService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CloudService.Infrastructure.Repositories;

public class ServiceCategoryRepository : IServiceCategoryRepository
{
    private readonly ApplicationDbContext _context;

    public ServiceCategoryRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceCategory?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceCategories
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<ServiceCategory?> GetByIdWithPlansAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceCategories
            .Include(c => c.ServicePlans)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<List<ServiceCategory>> GetAllAsync(bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var query = _context.ServiceCategories.AsQueryable();

        if (!includeInactive)
            query = query.Where(c => c.IsActive);

        return await query.OrderBy(c => c.DisplayOrder).ToListAsync(cancellationToken);
    }

    public async Task<(List<ServiceCategory> Items, int TotalCount)> GetPagedAsync(
        int pageNumber, int pageSize, bool includeInactive = false, string? searchTerm = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.ServiceCategories.AsQueryable();

        if (!includeInactive)
            query = query.Where(c => c.IsActive);

        if (!string.IsNullOrWhiteSpace(searchTerm))
            query = query.Where(c => c.Name.Contains(searchTerm) || (c.Description != null && c.Description.Contains(searchTerm)));

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(c => c.DisplayOrder)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Include(c => c.ServicePlans)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceCategories.AnyAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<bool> SlugExistsAsync(string slug, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.ServiceCategories.Where(c => c.Slug == slug);
        if (excludeId.HasValue)
            query = query.Where(c => c.Id != excludeId.Value);

        return await query.AnyAsync(cancellationToken);
    }

    public async Task AddAsync(ServiceCategory entity, CancellationToken cancellationToken = default)
    {
        await _context.ServiceCategories.AddAsync(entity, cancellationToken);
    }

    public void Update(ServiceCategory entity)
    {
        _context.ServiceCategories.Update(entity);
    }
}
