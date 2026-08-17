using CloudService.Application.DTOs.Promotions;
using CloudService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudService.WebApi.Controllers;

/// <summary>
/// API Quản lý và Áp dụng Mã Giảm Giá / Khuyến Mãi (PR#7)
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PromotionsController : ControllerBase
{
    private readonly IPromotionService _promotionService;

    public PromotionsController(IPromotionService promotionService)
    {
        _promotionService = promotionService;
    }

    /// <summary>
    /// [Admin/Editor] Lấy toàn bộ danh sách khuyến mãi trong hệ thống
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Editor")]
    [ProducesResponseType(typeof(IEnumerable<PromotionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await _promotionService.GetAllAsync(cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// [Public] Lấy danh sách các khuyến mãi đang có hiệu lực tại thời điểm hiện tại
    /// Khách hàng có thể xem danh sách coupon để chọn mã giảm giá thích hợp khi mua dịch vụ
    /// </summary>
    /// <param name="servicePlanId">Lọc mã áp dụng riêng cho gói dịch vụ (tùy chọn)</param>
    [HttpGet("active")]
    [ProducesResponseType(typeof(IEnumerable<PromotionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActivePromotions([FromQuery] int? servicePlanId, CancellationToken cancellationToken)
    {
        var result = await _promotionService.GetActivePromotionsAsync(servicePlanId, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// [Admin/Editor] Lấy thông tin chi tiết một mã khuyến mãi theo ID
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Editor")]
    [ProducesResponseType(typeof(PromotionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await _promotionService.GetByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// [Admin/Editor] Tạo mới một chương trình / mã khuyến mãi
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Editor")]
    [ProducesResponseType(typeof(PromotionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreatePromotionDto dto, CancellationToken cancellationToken)
    {
        var result = await _promotionService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// [Admin/Editor] Cập nhật thông tin chương trình khuyến mãi
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Editor")]
    [ProducesResponseType(typeof(PromotionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdatePromotionDto dto, CancellationToken cancellationToken)
    {
        var result = await _promotionService.UpdateAsync(id, dto, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// [Admin] Xóa chương trình khuyến mãi (Xóa mềm Soft-delete)
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        await _promotionService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// [Admin/Editor] Bật / Tắt trạng thái kích hoạt của mã khuyến mãi
    /// </summary>
    [HttpPatch("{id:int}/toggle-active")]
    [Authorize(Roles = "Admin,Editor")]
    [ProducesResponseType(typeof(PromotionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleActive([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await _promotionService.ToggleActiveAsync(id, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// [Public] Áp dụng mã giảm giá khi đặt mua dịch vụ
    /// Luồng hoạt động: Nhập mã Code và Giá gốc -> API xác thực tính hợp lệ (thời hạn, gói áp dụng) và trả về số tiền được giảm cùng giá thanh toán cuối cùng.
    /// </summary>
    [HttpPost("apply")]
    [ProducesResponseType(typeof(ApplyPromotionResultDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> ApplyPromotion([FromBody] ApplyPromotionRequestDto dto, CancellationToken cancellationToken)
    {
        var result = await _promotionService.ApplyPromotionAsync(dto, cancellationToken);
        return Ok(result);
    }
}
