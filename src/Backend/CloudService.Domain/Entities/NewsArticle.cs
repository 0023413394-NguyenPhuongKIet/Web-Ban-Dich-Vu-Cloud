using CloudService.Domain.Common;

namespace CloudService.Domain.Entities;

public class NewsArticle : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string Category { get; set; } = string.Empty; // HDKT, KhuyenMai, ThongBao...
    public bool IsPublished { get; set; } = true;
    public int AuthorId { get; set; }

    // Navigation properties
    public AppUser Author { get; set; } = null!;
}
