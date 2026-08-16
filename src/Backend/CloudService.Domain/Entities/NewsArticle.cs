using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using CloudService.Domain.Common;
using CloudService.Domain.Exceptions;

namespace CloudService.Domain.Entities;

/// <summary>
/// Entity biểu diễn bài viết Tin tức / Blog / Hướng dẫn kỹ thuật (PR#5)
/// </summary>
public class NewsArticle : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string Category { get; set; } = string.Empty; // HDKT (Hướng dẫn kỹ thuật), KhuyenMai (Khuyến mãi), ThongBao (Thông báo), TinTuc (Tin tức)
    public bool IsPublished { get; set; } = true;
    public int ViewCount { get; set; } = 0;
    public DateTime? PublishedAt { get; set; }
    public int AuthorId { get; set; }

    // Navigation properties
    public AppUser Author { get; set; } = null!;

    /// <summary>
    /// Tạo bài viết mới kèm chuẩn hóa Slug và thời gian xuất bản
    /// </summary>
    public static NewsArticle Create(
        string title,
        string summary,
        string content,
        string category,
        int authorId,
        string? thumbnailUrl = null,
        bool isPublished = true)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("Tiêu đề bài viết không được để trống.");

        if (string.IsNullOrWhiteSpace(content))
            throw new DomainException("Nội dung bài viết không được để trống.");

        if (string.IsNullOrWhiteSpace(category))
            throw new DomainException("Chuyên mục bài viết không được để trống.");

        var article = new NewsArticle
        {
            Title = title.Trim(),
            Slug = GenerateSlug(title),
            Summary = summary?.Trim() ?? string.Empty,
            Content = content.Trim(),
            Category = category.Trim(),
            AuthorId = authorId,
            ThumbnailUrl = thumbnailUrl?.Trim(),
            IsPublished = isPublished,
            ViewCount = 0,
            PublishedAt = isPublished ? DateTime.UtcNow : null,
            CreatedAt = DateTime.UtcNow
        };

        return article;
    }

    /// <summary>
    /// Cập nhật thông tin bài viết
    /// </summary>
    public void Update(
        string title,
        string summary,
        string content,
        string category,
        string? thumbnailUrl,
        bool isPublished)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("Tiêu đề bài viết không được để trống.");

        if (string.IsNullOrWhiteSpace(content))
            throw new DomainException("Nội dung bài viết không được để trống.");

        if (string.IsNullOrWhiteSpace(category))
            throw new DomainException("Chuyên mục bài viết không được để trống.");

        // Nếu tiêu đề thay đổi, sinh lại Slug mới
        if (!string.Equals(Title, title.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            Slug = GenerateSlug(title);
        }

        Title = title.Trim();
        Summary = summary?.Trim() ?? string.Empty;
        Content = content.Trim();
        Category = category.Trim();
        ThumbnailUrl = thumbnailUrl?.Trim();
        
        // Nếu chuyển từ chưa xuất bản sang xuất bản thì gán PublishedAt
        if (!IsPublished && isPublished && PublishedAt == null)
        {
            PublishedAt = DateTime.UtcNow;
        }

        IsPublished = isPublished;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Tăng lượt xem bài viết
    /// </summary>
    public void IncrementViewCount()
    {
        ViewCount++;
    }

    /// <summary>
    /// Xuất bản bài viết
    /// </summary>
    public void Publish()
    {
        IsPublished = true;
        PublishedAt ??= DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Ẩn bài viết khỏi trang công khai
    /// </summary>
    public void Unpublish()
    {
        IsPublished = false;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Thuật toán chuyển đổi Tiêu đề Tiếng Việt có dấu thành Slug thân thiện SEO
    /// Ví dụ: "Hướng Dẫn Cài Đặt VPS Ubuntu 24.04!" -> "huong-dan-cai-dat-vps-ubuntu-24-04"
    /// </summary>
    public static string GenerateSlug(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return string.Empty;

        // 1. Chuyển chữ thường
        var normalizedString = text.Trim().ToLowerInvariant();

        // 2. Chuyển ký tự 'đ' và 'Đ' sang 'd'
        normalizedString = normalizedString.Replace("đ", "d").Replace("Đ", "d");

        // 3. Tách dấu thanh tiếng Việt (FormD)
        var stringBuilder = new StringBuilder();
        var formD = normalizedString.Normalize(NormalizationForm.FormD);

        foreach (var ch in formD)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(ch);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(ch);
            }
        }

        // 4. Chuẩn hóa về lại FormC
        var cleanString = stringBuilder.ToString().Normalize(NormalizationForm.FormC);

        // 5. Thay thế ký tự đặc biệt không phải chữ/số thành dấu gạch ngang '-'
        cleanString = Regex.Replace(cleanString, @"[^a-z0-9\s-]", "");

        // 6. Chuyển nhiều khoảng trắng/gạch nối liên tiếp thành 1 dấu gạch nối duy nhất
        cleanString = Regex.Replace(cleanString, @"[\s-]+", " ").Trim();
        cleanString = Regex.Replace(cleanString, @"\s", "-");

        return cleanString;
    }
}
