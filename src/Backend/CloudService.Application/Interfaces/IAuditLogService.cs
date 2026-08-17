using CloudService.Application.Common.Models;
using CloudService.Application.DTOs.AuditLog;

namespace CloudService.Application.Interfaces;

/// <summary>
/// Service quản lý nhật ký hệ thống (Audit Log).
/// </summary>
public interface IAuditLogService
{
    Task<PagedResult<AuditLogDto>> GetAuditLogsAsync(AuditLogQueryDto query, CancellationToken cancellationToken = default);
    Task LogAsync(CreateAuditLogDto dto, CancellationToken cancellationToken = default);
}
