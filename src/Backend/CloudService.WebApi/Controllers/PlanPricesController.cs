using System.Security.Claims;
using CloudService.Application.DTOs.AuditLog;
using CloudService.Application.DTOs.Services;
using CloudService.Application.Interfaces;
using CloudService.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudService.WebApi.Controllers;

/// <summary>
/// API quản lý Giá gói dịch vụ theo chu kỳ thanh toán (Monthly/Yearly).
/// </summary>
[ApiController]
[Route("api/plans/{planId}/prices")]
public class PlanPricesController : ControllerBase
{
    private readonly PlanPriceService _service;
    private readonly IAuditLogService _auditLogService;

    public PlanPricesController(PlanPriceService service, IAuditLogService auditLogService)
    {
        _service = service;
        _auditLogService = auditLogService;
    }

    /// <summary>
    /// Lấy lịch sử giá của một gói dịch vụ.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPriceHistory(int planId, CancellationToken cancellationToken)
    {
        var result = await _service.GetPriceHistoryAsync(planId, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Thiết lập giá mới cho gói dịch vụ. Giá cũ sẽ được lưu lại trong lịch sử và ghi nhận Audit Log.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetPrice(int planId, [FromBody] SetPlanPriceDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.SetPriceAsync(planId, dto, cancellationToken);

        // Ghi nhận Audit Log: Ai sửa giá, gói nào, chu kỳ nào, số tiền mới
        var userName = User.Identity?.Name ?? User.FindFirst(ClaimTypes.Name)?.Value ?? "Quản trị viên";
        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        
        await _auditLogService.LogAsync(new CreateAuditLogDto
        {
            Action = "UpdatePrice",
            EntityName = "PlanPrice",
            EntityId = planId.ToString(),
            Details = $"Người dùng '{userName}' đã cập nhật giá gói dịch vụ #{planId} [{dto.BillingCycle}] thành: {dto.SellingPrice:N0} đ (Giá gốc: {dto.OriginalPrice:N0} đ).",
            IpAddress = clientIp
        }, cancellationToken);

        return StatusCode(StatusCodes.Status201Created, result);
    }
}

