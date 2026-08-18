using CloudService.Application.DTOs.Dashboard;

namespace CloudService.Application.Interfaces;

/// <summary>
/// Service quản lý và tổng hợp dữ liệu Dashboard Quản trị.
/// </summary>
public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default);
}
