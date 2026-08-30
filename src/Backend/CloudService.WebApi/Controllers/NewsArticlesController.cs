using System.Security.Claims;
using CloudService.Application.DTOs.News;
using CloudService.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudService.WebApi.Controllers;

/// <summary>
/// API Quản lý Tin tức / Blog / Hướng dẫn kỹ thuật (PR#5)
/// Cho phép người dùng xem tin tức công khai và quản trị viên (Admin/Editor) quản lý bài viết.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Route("api/News")]
public class NewsArticlesController : ControllerBase
{
    private readonly NewsArticleService _newsService;

    public NewsArticlesController(NewsArticleService newsService)
    {
        _newsService = newsService;
    }

    /// <summary>
    /// Lấy danh sách bài viết (Hỗ trợ phân trang, tìm kiếm từ khóa, lọc theo danh mục / trạng thái xuất bản)
    /// </summary>
    /// <param name="filter">Bộ lọc tìm kiếm và phân trang</param>
    /// <param name="cancellationToken">Cancellation Token</param>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetArticles([FromQuery] NewsArticleFilterDto filter, CancellationToken cancellationToken)
    {
        var result = await _newsService.GetPagedArticlesAsync(filter, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết bài viết theo ID
    /// </summary>
    /// <param name="id">Mã ID bài viết</param>
    /// <param name="cancellationToken">Cancellation Token</param>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetArticleById(int id, CancellationToken cancellationToken)
    {
        var result = await _newsService.GetArticleByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết bài viết theo đường dẫn Slug (Tự động tăng số lượt xem ViewCount)
    /// </summary>
    /// <param name="slug">Đường dẫn thân thiện SEO (Ví dụ: huong-dan-cai-dat-vps-ubuntu)</param>
    /// <param name="cancellationToken">Cancellation Token</param>
    [HttpGet("slug/{slug}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetArticleBySlug(string slug, CancellationToken cancellationToken)
    {
        var result = await _newsService.GetArticleBySlugAsync(slug, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Tạo bài viết mới (Yêu cầu đăng nhập tài khoản có quyền Admin hoặc Editor)
    /// </summary>
    /// <param name="dto">Dữ liệu tạo bài viết</param>
    /// <param name="cancellationToken">Cancellation Token</param>
    [Authorize(Roles = "Admin,Editor")]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateArticle([FromBody] CreateNewsArticleDto dto, CancellationToken cancellationToken)
    {
        // Trích xuất AuthorId từ Claims trong JWT Token
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out int authorId))
        {
            return Unauthorized(new { Message = "Không xác định được danh tính người đăng bài." });
        }

        var result = await _newsService.CreateArticleAsync(dto, authorId, cancellationToken);
        return CreatedAtAction(nameof(GetArticleById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Cập nhật nội dung bài viết (Yêu cầu quyền Admin hoặc Editor)
    /// </summary>
    /// <param name="id">Mã ID bài viết</param>
    /// <param name="dto">Dữ liệu cập nhật</param>
    /// <param name="cancellationToken">Cancellation Token</param>
    [Authorize(Roles = "Admin,Editor")]
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateArticle(int id, [FromBody] UpdateNewsArticleDto dto, CancellationToken cancellationToken)
    {
        var result = await _newsService.UpdateArticleAsync(id, dto, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Xóa bài viết (Soft delete, yêu cầu quyền Admin)
    /// </summary>
    /// <param name="id">Mã ID bài viết</param>
    /// <param name="cancellationToken">Cancellation Token</param>
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteArticle(int id, CancellationToken cancellationToken)
    {
        await _newsService.DeleteArticleAsync(id, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Xuất bản hoặc ẩn bài viết (Yêu cầu quyền Admin hoặc Editor)
    /// </summary>
    /// <param name="id">Mã ID bài viết</param>
    /// <param name="isPublished">Trạng thái xuất bản (true: Hiện, false: Ẩn)</param>
    /// <param name="cancellationToken">Cancellation Token</param>
    [Authorize(Roles = "Admin,Editor")]
    [HttpPatch("{id:int}/publish")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> TogglePublish(int id, [FromQuery] bool isPublished, CancellationToken cancellationToken)
    {
        var result = await _newsService.TogglePublishStatusAsync(id, isPublished, cancellationToken);
        return Ok(result);
    }
}
