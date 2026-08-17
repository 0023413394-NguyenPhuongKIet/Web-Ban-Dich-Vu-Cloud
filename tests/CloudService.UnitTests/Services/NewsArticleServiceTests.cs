using CloudService.Application.Common.Models;
using CloudService.Application.DTOs.News;
using CloudService.Application.Interfaces;
using CloudService.Application.Services;
using CloudService.Domain.Entities;
using CloudService.Domain.Exceptions;
using Moq;

namespace CloudService.UnitTests.Services;

/// <summary>
/// Unit Tests kiểm tra tính đúng đắn của tầng Application NewsArticleService (PR#5)
/// </summary>
public class NewsArticleServiceTests
{
    private readonly Mock<INewsArticleRepository> _mockRepo;
    private readonly Mock<IUnitOfWork> _mockUow;
    private readonly NewsArticleService _service;

    public NewsArticleServiceTests()
    {
        _mockRepo = new Mock<INewsArticleRepository>();
        _mockUow = new Mock<IUnitOfWork>();
        _service = new NewsArticleService(_mockRepo.Object, _mockUow.Object);
    }

    [Fact]
    public async Task GetArticleByIdAsync_WhenNotFound_ShouldThrowNotFoundException()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((NewsArticle?)null);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() =>
            _service.GetArticleByIdAsync(999));
    }

    [Fact]
    public async Task CreateArticleAsync_ShouldHandleDuplicateSlug_AndSaveSuccessfully()
    {
        // Arrange
        var dto = new CreateNewsArticleDto(
            Title: "Hướng Dẫn Cài Đặt VPS",
            Summary: "Tóm tắt bài viết",
            Content: "Nội dung bài viết chi tiết",
            Category: "HDKT",
            ThumbnailUrl: "https://cloud.vn/thumb.jpg",
            IsPublished: true
        );

        // Giả lập Slug gốc đã tồn tại, sau đó Slug kèm số -1 chưa tồn tại
        _mockRepo.SetupSequence(r => r.SlugExistsAsync(It.IsAny<string>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true)   // "huong-dan-cai-dat-vps" -> Đã có
            .ReturnsAsync(false);  // "huong-dan-cai-dat-vps-1" -> Hợp lệ

        _mockRepo.Setup(r => r.AddAsync(It.IsAny<NewsArticle>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _mockUow.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Giả lập GetById sau khi thêm
        _mockRepo.Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(NewsArticle.Create(dto.Title, dto.Summary, dto.Content, dto.Category, 1));

        // Act
        var result = await _service.CreateArticleAsync(dto, 1);

        // Assert
        Assert.NotNull(result);
        _mockRepo.Verify(r => r.AddAsync(It.Is<NewsArticle>(a => a.Slug == "huong-dan-cai-dat-vps-1"), It.IsAny<CancellationToken>()), Times.Once);
        _mockUow.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetArticleBySlugAsync_ShouldCallIncrementViewCount()
    {
        // Arrange
        var article = NewsArticle.Create("Tin Tức Mới", "Tóm tắt", "Nội dung", "TinTuc", 1);
        _mockRepo.Setup(r => r.GetBySlugAsync("tin-tuc-moi", It.IsAny<CancellationToken>()))
            .ReturnsAsync(article);

        _mockRepo.Setup(r => r.IncrementViewCountAsync(article.Id, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.GetArticleBySlugAsync("tin-tuc-moi");

        // Assert
        Assert.NotNull(result);
        _mockRepo.Verify(r => r.IncrementViewCountAsync(article.Id, It.IsAny<CancellationToken>()), Times.Once);
    }
}
