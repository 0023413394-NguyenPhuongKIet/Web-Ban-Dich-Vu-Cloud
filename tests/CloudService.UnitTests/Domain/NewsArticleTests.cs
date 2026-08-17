using CloudService.Domain.Entities;
using CloudService.Domain.Exceptions;

namespace CloudService.UnitTests.Domain;

/// <summary>
/// Unit Tests kiểm tra tính toàn vẹn nghiệp vụ của Entity NewsArticle (PR#5)
/// </summary>
public class NewsArticleTests
{
    [Fact]
    public void GenerateSlug_ShouldConvertVietnameseCharactersAndSpecialCharsProperly()
    {
        // Arrange
        string title = "Hướng Dẫn Cài Đặt VPS Ubuntu 24.04 Cho Người Mới Bắt Đầu!";

        // Act
        string slug = NewsArticle.GenerateSlug(title);

        // Assert
        Assert.Equal("huong-dan-cai-dat-vps-ubuntu-2404-cho-nguoi-moi-bat-dau", slug);
    }

    [Fact]
    public void Create_WithValidData_ShouldInitializeCorrectly()
    {
        // Arrange & Act
        var article = NewsArticle.Create(
            title: "Khuyến Mãi Đám Mây Mùa Hè 2026",
            summary: "Giảm giá 50% tất cả gói Cloud VPS",
            content: "Nội dung chi tiết chương trình khuyến mãi...",
            category: "KhuyenMai",
            authorId: 1,
            thumbnailUrl: "https://cloud.vn/thumb.jpg",
            isPublished: true
        );

        // Assert
        Assert.Equal("Khuyến Mãi Đám Mây Mùa Hè 2026", article.Title);
        Assert.Equal("khuyen-mai-dam-may-mua-he-2026", article.Slug);
        Assert.Equal("KhuyenMai", article.Category);
        Assert.Equal(0, article.ViewCount);
        Assert.True(article.IsPublished);
        Assert.NotNull(article.PublishedAt);
    }

    [Fact]
    public void Create_WithEmptyTitle_ShouldThrowDomainException()
    {
        // Act & Assert
        var ex = Assert.Throws<DomainException>(() =>
            NewsArticle.Create("", "Tóm tắt", "Nội dung", "TinTuc", 1));

        Assert.Contains("Tiêu đề", ex.Message);
    }

    [Fact]
    public void IncrementViewCount_ShouldIncreaseCountByOne()
    {
        // Arrange
        var article = NewsArticle.Create("Tiêu đề test", "Tóm tắt", "Nội dung", "HDKT", 1);
        Assert.Equal(0, article.ViewCount);

        // Act
        article.IncrementViewCount();
        article.IncrementViewCount();

        // Assert
        Assert.Equal(2, article.ViewCount);
    }

    [Fact]
    public void PublishAndUnpublish_ShouldChangeStateCorrectly()
    {
        // Arrange
        var article = NewsArticle.Create("Tiêu đề", "Tóm tắt", "Nội dung", "HDKT", 1, isPublished: false);
        Assert.False(article.IsPublished);

        // Act - Publish
        article.Publish();
        Assert.True(article.IsPublished);
        Assert.NotNull(article.PublishedAt);

        // Act - Unpublish
        article.Unpublish();
        Assert.False(article.IsPublished);
    }
}
