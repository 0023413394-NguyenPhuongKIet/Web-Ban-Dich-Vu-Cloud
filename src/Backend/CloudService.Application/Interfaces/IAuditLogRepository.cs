using CloudService.Application.DTOs.AuditLog;
using CloudService.Domain.Entities;

namespace CloudService.Application.Interfaces;

public interface IAuditLogRepository
{
    Task AddAsync(AuditLog log, CancellationToken cancellationToken = default);
    Task<(List<AuditLog> Items, int TotalCount)> GetPagedAsync(AuditLogQueryDto query, CancellationToken cancellationToken = default);
    Task<List<AuditLog>> GetAllFilteredAsync(AuditLogQueryDto query, CancellationToken cancellationToken = default);
}
