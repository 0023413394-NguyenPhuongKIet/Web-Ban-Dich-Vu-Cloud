using CloudService.Application.DTOs.Affiliate;
using CloudService.Application.DTOs.AuditLog;
using CloudService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudService.WebApi.Controllers;

/// <summary>
/// API Báo cáo & Xuất file dữ liệu Excel/CSV (PR#8)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ReportsController : ControllerBase
{
    private readonly IExportService _exportService;

    public ReportsController(IExportService exportService)
    {
        _exportService = exportService;
    }

    /// <summary>
    /// [Admin] Xuất danh sách đơn đặt hàng ra file Excel/CSV
    /// </summary>
    [HttpGet("export/orders")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportOrders(CancellationToken cancellationToken)
    {
        var fileBytes = await _exportService.ExportOrdersToExcelAsync(cancellationToken);
        var fileName = $"Orders_Export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
        return File(fileBytes, "text/csv; charset=utf-8", fileName);
    }

    /// <summary>
    /// [Admin] Xuất lịch sử thao tác Audit Logs ra file Excel/CSV
    /// </summary>
    [HttpGet("export/audit-logs")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportAuditLogs([FromQuery] AuditLogQueryDto query, CancellationToken cancellationToken)
    {
        var fileBytes = await _exportService.ExportAuditLogsToExcelAsync(query, cancellationToken);
        var fileName = $"AuditLogs_Export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
        return File(fileBytes, "text/csv; charset=utf-8", fileName);
    }

    /// <summary>
    /// [Admin] Xuất danh sách đăng ký Affiliate ra file Excel/CSV
    /// </summary>
    [HttpGet("export/affiliates")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportAffiliates([FromQuery] AffiliateQueryDto query, CancellationToken cancellationToken)
    {
        var fileBytes = await _exportService.ExportAffiliatesToExcelAsync(query, cancellationToken);
        var fileName = $"Affiliates_Export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
        return File(fileBytes, "text/csv; charset=utf-8", fileName);
    }
}
