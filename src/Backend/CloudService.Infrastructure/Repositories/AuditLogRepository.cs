using CloudService.Application.DTOs.AuditLog;
using CloudService.Application.Interfaces;
using CloudService.Domain.Entities;
using CloudService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CloudService.Infrastructure.Repositories;

public class AuditLogRepository : IAuditLogRepository
{
    private readonly ApplicationDbContext _context;

    public AuditLogRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(AuditLog log, CancellationToken cancellationToken = default)
    {
        await _context.AuditLogs.AddAsync(log, cancellationToken);
    }

    public async Task<(List<AuditLog> Items, int TotalCount)> GetPagedAsync(AuditLogQueryDto query, CancellationToken cancellationToken = default)
    {
        var dbQuery = BuildFilterQuery(query);

        var totalCount = await dbQuery.CountAsync(cancellationToken);
        var items = await dbQuery
            .Include(a => a.User)
            .OrderByDescending(a => a.CreatedAt)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<List<AuditLog>> GetAllFilteredAsync(AuditLogQueryDto query, CancellationToken cancellationToken = default)
    {
        return await BuildFilterQuery(query)
            .Include(a => a.User)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    private IQueryable<AuditLog> BuildFilterQuery(AuditLogQueryDto query)
    {
        var dbQuery = _context.AuditLogs.AsQueryable();

        if (query.UserId.HasValue)
        {
            dbQuery = dbQuery.Where(a => a.UserId == query.UserId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Action))
        {
            dbQuery = dbQuery.Where(a => a.Action.Contains(query.Action));
        }

        if (!string.IsNullOrWhiteSpace(query.EntityName))
        {
            dbQuery = dbQuery.Where(a => a.EntityName.Contains(query.EntityName));
        }

        if (query.FromDate.HasValue)
        {
            dbQuery = dbQuery.Where(a => a.CreatedAt >= query.FromDate.Value);
        }

        if (query.ToDate.HasValue)
        {
            dbQuery = dbQuery.Where(a => a.CreatedAt <= query.ToDate.Value);
        }

        return dbQuery;
    }
}
