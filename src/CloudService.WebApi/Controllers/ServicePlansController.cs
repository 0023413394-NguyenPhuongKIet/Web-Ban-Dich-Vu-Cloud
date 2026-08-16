using CloudService.Application.DTOs.Services;
using CloudService.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CloudService.WebApi.Controllers;

/// <summary>
/// API quản lý Gói dịch vụ (VPS Basic, VPS Pro...).
/// </summary>
[ApiController]
[Route("api/plans")]
public class ServicePlansController : ControllerBase
{
    private readonly ServicePlanService _service;

    public ServicePlansController(ServicePlanService service)
    {
        _service = service;
    }

    /// <summary>
    /// Lấy danh sách gói dịch vụ (có phân trang, lọc, sắp xếp).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] int? categoryId = null,
        [FromQuery] bool? isFeatured = null,
        [FromQuery] bool includeInactive = false,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortDirection = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _service.GetAllPagedAsync(
            pageNumber, pageSize, categoryId, isFeatured, includeInactive,
            searchTerm, sortBy, sortDirection, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết gói dịch vụ kèm giá hiện hành.
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Thêm mới gói dịch vụ.
    /// </summary>
    // TODO(PR4): Add [Authorize(Roles = "Admin")]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Create([FromBody] CreateServicePlanDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Cập nhật thông tin gói dịch vụ.
    /// </summary>
    // TODO(PR4): Add [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateServicePlanDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.UpdateAsync(id, dto, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Xóa (soft-delete) gói dịch vụ.
    /// </summary>
    // TODO(PR4): Add [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _service.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
