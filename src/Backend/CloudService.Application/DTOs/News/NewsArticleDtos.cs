namespace CloudService.Application.DTOs.News;

/// <summary>
/// DTO thông tin rút gọn của bài viết hiển thị trên danh sách
/// </summary>
public record NewsArticleDto(
    int Id,
    string Title,
    string Slug,
    string Summary,
    string? ThumbnailUrl,
    string Category,
    bool IsPublished,
    int ViewCount,
    DateTime? PublishedAt,
    DateTime CreatedAt,
    int AuthorId,
    string AuthorName
);

/// <summary>
/// DTO chi tiết đầy đủ nội dung bài viết
/// </summary>
public record NewsArticleDetailDto(
    int Id,
    string Title,
    string Slug,
    string Summary,
    string Content,
    string? ThumbnailUrl,
    string Category,
    bool IsPublished,
    int ViewCount,
    DateTime? PublishedAt,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    int AuthorId,
    string AuthorName,
    string AuthorEmail
);

/// <summary>
/// DTO tạo mới bài viết
/// </summary>
public record CreateNewsArticleDto(
    string Title,
    string Summary,
    string Content,
    string Category,
    string? ThumbnailUrl,
    bool IsPublished = true
);

/// <summary>
/// DTO cập nhật bài viết
/// </summary>
public record UpdateNewsArticleDto(
    string Title,
    string Summary,
    string Content,
    string Category,
    string? ThumbnailUrl,
    bool IsPublished
);

/// <summary>
/// DTO bộ lọc tìm kiếm và phân trang bài viết
/// </summary>
public record NewsArticleFilterDto(
    string? Keyword = null,
    string? Category = null,
    bool? IsPublished = null,
    int Page = 1,
    int PageSize = 10,
    string SortBy = "CreatedAt",
    bool SortDescending = true
);
