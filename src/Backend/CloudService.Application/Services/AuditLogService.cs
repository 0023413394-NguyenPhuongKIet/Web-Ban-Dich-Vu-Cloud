using CloudService.Application.Common.Models;
using CloudService.Application.DTOs.AuditLog;
using CloudService.Application.Interfaces;
using CloudService.Domain.Entities;

namespace CloudService.Application.Services;

/// <summary>
/// Service quản lý truy vấn và ghi nhận nhật ký thao tác (Audit Log).
/// </summary>
public class AuditLogService : IAuditLogService
{
    private readonly IAuditLogRepository _auditLogRepo;
    private readonly IUnitOfWork _unitOfWork;

    public AuditLogService(IAuditLogRepository auditLogRepo, IUnitOfWork unitOfWork)
    {
        _auditLogRepo = auditLogRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<AuditLogDto>> GetAuditLogsAsync(AuditLogQueryDto query, CancellationToken cancellationToken = default)
    {
        var (items, totalCount) = await _auditLogRepo.GetPagedAsync(query, cancellationToken);

        var dtos = items.Select(a => new AuditLogDto
        {
            Id = a.Id,
            UserId = a.UserId,
            UserName = a.User?.FullName ?? a.User?.Username,
            Action = a.Action,
            EntityName = a.EntityName,
            EntityId = a.EntityId,
            Details = a.Details,
            IpAddress = a.IpAddress,
            CreatedAt = a.CreatedAt
        }).ToList();

        return new PagedResult<AuditLogDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = query.PageNumber,
            PageSize = query.PageSize
        };
    }

    public async Task LogAsync(CreateAuditLogDto dto, CancellationToken cancellationToken = default)
    {
        var log = new AuditLog
        {
            UserId = dto.UserId,
            Action = dto.Action,
            EntityName = dto.EntityName,
            EntityId = dto.EntityId,
            Details = dto.Details,
            IpAddress = string.IsNullOrWhiteSpace(dto.IpAddress) ? "127.0.0.1" : dto.IpAddress,
            CreatedAt = DateTime.UtcNow
        };

        await _auditLogRepo.AddAsync(log, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
