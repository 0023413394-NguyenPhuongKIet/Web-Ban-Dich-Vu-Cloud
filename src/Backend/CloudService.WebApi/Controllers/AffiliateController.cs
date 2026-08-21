using CloudService.Application.Common.Models;
using CloudService.Application.DTOs.Affiliate;
using CloudService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudService.WebApi.Controllers;

/// <summary>
/// API Đăng ký và Quản lý Tiếp thị liên kết Affiliate (PR#8)
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AffiliateController : ControllerBase
{
    private readonly IAffiliateService _affiliateService;

    public AffiliateController(IAffiliateService affiliateService)
    {
        _affiliateService = affiliateService;
    }

    /// <summary>
    /// [Public] Gửi đơn đăng ký tham gia chương trình Affiliate
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AffiliateApplicationDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Register([FromBody] RegisterAffiliateDto dto, CancellationToken cancellationToken)
    {
        var result = await _affiliateService.RegisterAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// [Admin, Editor] Lấy danh sách các đơn đăng ký Affiliate (lọc & phân trang)
    /// Editor chỉ có quyền xem, không duyệt/từ chối
    /// </summary>
    [HttpGet("applications")]
    [Authorize(Roles = "Admin,Editor")]
    [ProducesResponseType(typeof(PagedResult<AffiliateApplicationDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetApplications([FromQuery] AffiliateQueryDto query, CancellationToken cancellationToken)
    {
        var result = await _affiliateService.GetApplicationsAsync(query, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// [Admin, Editor] Xem chi tiết 1 đơn đăng ký Affiliate theo ID
    /// Editor chỉ có quyền xem, không duyệt/từ chối
    /// </summary>
    [HttpGet("applications/{id:int}")]
    [Authorize(Roles = "Admin,Editor")]
    [ProducesResponseType(typeof(AffiliateApplicationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _affiliateService.GetByIdAsync(id, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    /// <summary>
    /// [Admin] Cập nhật trạng thái (Phê duyệt / Từ chối) đơn đăng ký Affiliate
    /// </summary>
    [HttpPut("applications/{id:int}/status")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(AffiliateApplicationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateAffiliateStatusDto dto, CancellationToken cancellationToken)
    {
        var result = await _affiliateService.UpdateStatusAsync(id, dto, cancellationToken);
        return Ok(result);
    }
}
