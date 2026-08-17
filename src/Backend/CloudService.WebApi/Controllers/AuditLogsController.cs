using CloudService.Application.Common.Models;
using CloudService.Application.DTOs.AuditLog;
using CloudService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudService.WebApi.Controllers;

/// <summary>
/// API Quản lý Nhật ký hệ thống Audit Logs (PR#8)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public AuditLogsController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    /// <summary>
    /// [Admin] Lấy danh sách Audit Logs có lọc và phân trang
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<AuditLogDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuditLogs([FromQuery] AuditLogQueryDto query, CancellationToken cancellationToken)
    {
        var result = await _auditLogService.GetAuditLogsAsync(query, cancellationToken);
        return Ok(result);
    }
}
