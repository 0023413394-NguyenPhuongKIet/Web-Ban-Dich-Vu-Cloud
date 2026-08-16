using CloudService.Application.DTOs.Services;
using CloudService.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CloudService.WebApi.Controllers;

/// <summary>
/// API Quản lý Khuyến mãi và Sinh mã QR Code (PR#7).
/// </summary>
[ApiController]
[Route("api/promotions")]
public class PromotionsController : ControllerBase
{
    private readonly IPromotionService _promotionService;

    public PromotionsController(IPromotionService promotionService)
    {
        _promotionService = promotionService;
    }

    /// <summary>
    /// Lấy danh sách tất cả khuyến mãi.
    /// </summary>
    /// <param name="includeInactive">Có bao gồm khuyến mãi không hoạt động không (mặc định: false).</param>
    [HttpGet]
    [ProducesResponseType(typeof(List<PromotionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] bool includeInactive = false,
        CancellationToken cancellationToken = default)
    {
        var result = await _promotionService.GetAllAsync(includeInactive, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết khuyến mãi theo ID.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PromotionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _promotionService.GetByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Lấy khuyến mãi theo mã Code.
    /// </summary>
    [HttpGet("code/{code}")]
    [ProducesResponseType(typeof(PromotionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByCode(string code, CancellationToken cancellationToken)
    {
        var result = await _promotionService.GetByCodeAsync(code, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Tạo mới khuyến mãi.
    /// </summary>
    // TODO(PR4): Add [Authorize(Roles = "Admin")]
    [HttpPost]
    [ProducesResponseType(typeof(PromotionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreatePromotionDto dto, CancellationToken cancellationToken)
    {
        var result = await _promotionService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Cập nhật thông tin khuyến mãi.
    /// </summary>
    // TODO(PR4): Add [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(PromotionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePromotionDto dto, CancellationToken cancellationToken)
    {
        var result = await _promotionService.UpdateAsync(id, dto, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Xóa (soft-delete) khuyến mãi.
    /// </summary>
    // TODO(PR4): Add [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _promotionService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Sinh mã QR Code PNG cho khuyến mãi theo Code — trả về file ảnh PNG.
    /// </summary>
    /// <param name="code">Mã khuyến mãi (ví dụ: SUMMER2026).</param>
    [HttpGet("{code}/qrcode")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK, "image/png")]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetQrCode(string code, CancellationToken cancellationToken)
    {
        var pngBytes = await _promotionService.GeneratePromotionQrCodeAsync(code, cancellationToken);
        return File(pngBytes, "image/png", $"promotion-{code.ToUpperInvariant()}-qrcode.png");
    }
}
