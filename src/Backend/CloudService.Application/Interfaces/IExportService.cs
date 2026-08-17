using CloudService.Application.DTOs.AuditLog;
using CloudService.Application.DTOs.Affiliate;

namespace CloudService.Application.Interfaces;

/// <summary>
/// Service xuất báo cáo Excel cho dữ liệu hệ thống.
/// </summary>
public interface IExportService
{
    Task<byte[]> ExportOrdersToExcelAsync(CancellationToken cancellationToken = default);
    Task<byte[]> ExportAuditLogsToExcelAsync(AuditLogQueryDto query, CancellationToken cancellationToken = default);
    Task<byte[]> ExportAffiliatesToExcelAsync(AffiliateQueryDto query, CancellationToken cancellationToken = default);
}
