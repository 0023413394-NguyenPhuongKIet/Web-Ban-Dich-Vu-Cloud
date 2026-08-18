using CloudService.Application.DTOs.Affiliate;
using CloudService.Application.Interfaces;
using CloudService.Domain.Entities;
using CloudService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CloudService.Infrastructure.Repositories;

public class AffiliateRepository : IAffiliateRepository
{
    private readonly ApplicationDbContext _context;

    public AffiliateRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AffiliateApplication> AddAsync(AffiliateApplication entity, CancellationToken cancellationToken = default)
    {
        await _context.AffiliateApplications.AddAsync(entity, cancellationToken);
        return entity;
    }

    public async Task<AffiliateApplication?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.AffiliateApplications
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<(List<AffiliateApplication> Items, int TotalCount)> GetPagedAsync(AffiliateQueryDto query, CancellationToken cancellationToken = default)
    {
        var dbQuery = BuildFilterQuery(query);

        var totalCount = await dbQuery.CountAsync(cancellationToken);
        var items = await dbQuery
            .OrderByDescending(a => a.CreatedAt)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<List<AffiliateApplication>> GetAllFilteredAsync(AffiliateQueryDto query, CancellationToken cancellationToken = default)
    {
        return await BuildFilterQuery(query)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public Task UpdateAsync(AffiliateApplication entity, CancellationToken cancellationToken = default)
    {
        _context.AffiliateApplications.Update(entity);
        return Task.CompletedTask;
    }

    private IQueryable<AffiliateApplication> BuildFilterQuery(AffiliateQueryDto query)
    {
        var dbQuery = _context.AffiliateApplications.AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Status))
        {
            dbQuery = dbQuery.Where(a => a.Status == query.Status);
        }

        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
        {
            var search = query.SearchTerm.ToLower();
            dbQuery = dbQuery.Where(a =>
                a.FullName.ToLower().Contains(search) ||
                a.Email.ToLower().Contains(search) ||
                a.Phone.Contains(search) ||
                a.WebsiteUrl.ToLower().Contains(search));
        }

        return dbQuery;
    }
}
