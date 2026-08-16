using CloudService.Application.DTOs.Services;
using CloudService.Application.Services;
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

    public PlanPricesController(PlanPriceService service)
    {
        _service = service;
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
    /// Thiết lập giá mới cho gói dịch vụ. Giá cũ sẽ được lưu lại trong lịch sử.
    /// </summary>
    // TODO(PR4): Add [Authorize(Roles = "Admin")]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetPrice(int planId, [FromBody] SetPlanPriceDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.SetPriceAsync(planId, dto, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, result);
    }
}
