using CloudService.Application.DTOs.Promotions;
using CloudService.Application.Interfaces;
using CloudService.Application.Services;
using CloudService.Domain.Entities;
using CloudService.Domain.Exceptions;
using Moq;
using Xunit;

namespace CloudService.UnitTests.Services;

/// <summary>
/// Bộ kiểm thử Đơn vị cho PromotionService (Application Layer)
/// </summary>
public class PromotionServiceTests
{
    private readonly Mock<IPromotionRepository> _promotionRepoMock;
    private readonly Mock<IServicePlanRepository> _servicePlanRepoMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly PromotionService _service;

    public PromotionServiceTests()
    {
        _promotionRepoMock = new Mock<IPromotionRepository>();
        _servicePlanRepoMock = new Mock<IServicePlanRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        _service = new PromotionService(
            _promotionRepoMock.Object,
            _servicePlanRepoMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task CreateAsync_WhenValidData_ShouldCreateSuccessfully()
    {
        // Arrange
        var dto = new CreatePromotionDto
        {
            Code = "cloud2026", // Thử nghiệm nhập chữ thường -> sẽ được tự động viết hoa
            Title = "Khuyến mãi Cloud 2026",
            DiscountPercent = 25,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(1),
            IsActive = true
        };

        _promotionRepoMock.Setup(r => r.CodeExistsAsync("CLOUD2026", null, default))
            .ReturnsAsync(false);

        // Act
        var result = await _service.CreateAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("CLOUD2026", result.Code);
        Assert.Equal(25, result.DiscountPercent);
        _promotionRepoMock.Verify(r => r.AddAsync(It.IsAny<Promotion>(), default), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(default), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_WhenDuplicateCode_ShouldThrowDomainException()
    {
        // Arrange
        var dto = new CreatePromotionDto
        {
            Code = "DUPLICATE",
            Title = "Trùng lặp",
            DiscountPercent = 10,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(10)
        };

        _promotionRepoMock.Setup(r => r.CodeExistsAsync("DUPLICATE", null, default))
            .ReturnsAsync(true);

        // Act & Assert
        await Assert.ThrowsAsync<DomainException>(() => _service.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_WhenEndDateBeforeStartDate_ShouldThrowDomainException()
    {
        // Arrange
        var dto = new CreatePromotionDto
        {
            Code = "INVALID_DATE",
            Title = "Sai ngày",
            DiscountPercent = 10,
            StartDate = DateTime.UtcNow.AddDays(10),
            EndDate = DateTime.UtcNow.AddDays(1) // End trước Start
        };

        // Act & Assert
        await Assert.ThrowsAsync<DomainException>(() => _service.CreateAsync(dto));
    }

    [Fact]
    public async Task ApplyPromotionAsync_WhenValidCoupon_ShouldReturnSuccessWithDiscount()
    {
        // Arrange
        var promo = new Promotion
        {
            Code = "SALE20",
            DiscountPercent = 20,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(10),
            IsActive = true
        };

        _promotionRepoMock.Setup(r => r.GetByCodeAsync("SALE20", default))
            .ReturnsAsync(promo);

        var request = new ApplyPromotionRequestDto
        {
            Code = "sale20",
            OriginalPrice = 1000000
        };

        // Act
        var result = await _service.ApplyPromotionAsync(request);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(1000000, result.OriginalPrice);
        Assert.Equal(200000, result.DiscountAmount); // Giảm 200k
        Assert.Equal(800000, result.FinalPrice);      // Còn 800k
    }

    [Fact]
    public async Task ApplyPromotionAsync_WhenNotFound_ShouldReturnFailed()
    {
        // Arrange
        _promotionRepoMock.Setup(r => r.GetByCodeAsync("NOTFOUND", default))
            .ReturnsAsync((Promotion?)null);

        var request = new ApplyPromotionRequestDto
        {
            Code = "NOTFOUND",
            OriginalPrice = 500000
        };

        // Act
        var result = await _service.ApplyPromotionAsync(request);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Contains("không tồn tại", result.Message);
        Assert.Equal(500000, result.FinalPrice); // Giá không đổi
    }
}
