using CloudService.Application.DTOs.Promotions;
using CloudService.Application.Interfaces;
using CloudService.Application.Services;
using CloudService.Domain.Entities;
using Moq;
using Xunit;

namespace CloudService.UnitTests.Application;

/// <summary>
/// Unit tests cho PromotionService (Application Layer).
/// Kiểm tra logic ApplyPromotion, CreatePromotion validation.
/// </summary>
public class PromotionServiceTests
{
    private readonly Mock<IPromotionRepository> _promoRepoMock;
    private readonly Mock<IServicePlanRepository> _planRepoMock;
    private readonly Mock<IUnitOfWork> _uowMock;
    private readonly PromotionService _sut;

    public PromotionServiceTests()
    {
        _promoRepoMock = new Mock<IPromotionRepository>();
        _planRepoMock = new Mock<IServicePlanRepository>();
        _uowMock = new Mock<IUnitOfWork>();

        _sut = new PromotionService(
            _promoRepoMock.Object,
            _planRepoMock.Object,
            _uowMock.Object);
    }

    // =====================================================
    // Helpers
    // =====================================================
    private static Promotion CreateValidPromotion(string code = "CLOUD20", double percent = 20.0) => new()
    {
        Id = 1,
        Code = code,
        Title = "Giảm 20% cloud",
        DiscountPercent = percent,
        StartDate = DateTime.UtcNow.AddDays(-1),
        EndDate = DateTime.UtcNow.AddDays(30),
        IsActive = true,
        IsDeleted = false,
        ServicePlanId = null
    };

    // =====================================================
    // ApplyPromotionAsync tests (TC-26 → TC-30)
    // =====================================================

    /// <summary>TC-26: Code rỗng → IsSuccess=false, trả về giá gốc</summary>
    [Fact]
    public async Task ApplyPromotionAsync_EmptyCode_ReturnsFailureWithOriginalPrice()
    {
        var dto = new ApplyPromotionRequestDto
        {
            Code = "",
            OriginalPrice = 500_000m
        };

        var result = await _sut.ApplyPromotionAsync(dto);

        Assert.False(result.IsSuccess);
        Assert.Equal(500_000m, result.FinalPrice);
        Assert.Equal(500_000m, result.OriginalPrice);
    }

    /// <summary>TC-27: Code không tồn tại → IsSuccess=false với message "không tồn tại"</summary>
    [Fact]
    public async Task ApplyPromotionAsync_CodeNotFound_ReturnsFailure()
    {
        _promoRepoMock
            .Setup(r => r.GetByCodeAsync("NOTEXIST", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Promotion?)null);

        var dto = new ApplyPromotionRequestDto
        {
            Code = "NOTEXIST",
            OriginalPrice = 300_000m
        };

        var result = await _sut.ApplyPromotionAsync(dto);

        Assert.False(result.IsSuccess);
        Assert.Contains("không tồn tại", result.Message);
    }

    /// <summary>TC-28: Code hợp lệ, giảm 20% → IsSuccess=true, FinalPrice chính xác</summary>
    [Fact]
    public async Task ApplyPromotionAsync_ValidCode_ReturnsSuccessWithDiscount()
    {
        var promo = CreateValidPromotion("CLOUD20", 20);
        _promoRepoMock
            .Setup(r => r.GetByCodeAsync("CLOUD20", It.IsAny<CancellationToken>()))
            .ReturnsAsync(promo);

        var dto = new ApplyPromotionRequestDto
        {
            Code = "CLOUD20",
            OriginalPrice = 1_000_000m
        };

        var result = await _sut.ApplyPromotionAsync(dto);

        Assert.True(result.IsSuccess);
        Assert.Equal(200_000m, result.DiscountAmount);
        Assert.Equal(800_000m, result.FinalPrice);
        Assert.Equal(20.0, result.DiscountPercent);
    }

    /// <summary>TC-29: Code expired → IsSuccess=false với message về hết hạn</summary>
    [Fact]
    public async Task ApplyPromotionAsync_ExpiredCode_ReturnsFailure()
    {
        var promo = CreateValidPromotion("OLDCODE", 15);
        promo.EndDate = DateTime.UtcNow.AddDays(-5); // Hết hạn

        _promoRepoMock
            .Setup(r => r.GetByCodeAsync("OLDCODE", It.IsAny<CancellationToken>()))
            .ReturnsAsync(promo);

        var dto = new ApplyPromotionRequestDto
        {
            Code = "OLDCODE",
            OriginalPrice = 200_000m
        };

        var result = await _sut.ApplyPromotionAsync(dto);

        Assert.False(result.IsSuccess);
        Assert.Equal(200_000m, result.FinalPrice); // Giá không thay đổi
    }

    /// <summary>TC-30: Code chỉ áp dụng cho plan khác → IsSuccess=false</summary>
    [Fact]
    public async Task ApplyPromotionAsync_WrongPlan_ReturnsFailure()
    {
        var promo = CreateValidPromotion("PLAN1ONLY", 10);
        promo.ServicePlanId = 1; // Chỉ áp dụng cho plan 1

        _promoRepoMock
            .Setup(r => r.GetByCodeAsync("PLAN1ONLY", It.IsAny<CancellationToken>()))
            .ReturnsAsync(promo);

        var dto = new ApplyPromotionRequestDto
        {
            Code = "PLAN1ONLY",
            OriginalPrice = 400_000m,
            ServicePlanId = 999 // Plan khác
        };

        var result = await _sut.ApplyPromotionAsync(dto);

        Assert.False(result.IsSuccess);
    }

    // =====================================================
    // CreateAsync validation tests (TC-31 → TC-33)
    // =====================================================

    /// <summary>TC-31: DiscountPercent = 0 → DomainException</summary>
    [Fact]
    public async Task CreateAsync_ZeroDiscountPercent_ThrowsDomainException()
    {
        var dto = new CreatePromotionDto
        {
            Code = "ZERO",
            Title = "Test",
            DiscountPercent = 0,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(30),
            IsActive = true
        };

        await Assert.ThrowsAsync<CloudService.Domain.Exceptions.DomainException>(
            () => _sut.CreateAsync(dto));
    }

    /// <summary>TC-32: DiscountPercent > 100 → DomainException</summary>
    [Fact]
    public async Task CreateAsync_DiscountOver100_ThrowsDomainException()
    {
        var dto = new CreatePromotionDto
        {
            Code = "OVER",
            Title = "Test",
            DiscountPercent = 150,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(30),
            IsActive = true
        };

        await Assert.ThrowsAsync<CloudService.Domain.Exceptions.DomainException>(
            () => _sut.CreateAsync(dto));
    }

    /// <summary>TC-33: EndDate <= StartDate → DomainException</summary>
    [Fact]
    public async Task CreateAsync_EndDateBeforeStartDate_ThrowsDomainException()
    {
        var dto = new CreatePromotionDto
        {
            Code = "BADDATE",
            Title = "Test",
            DiscountPercent = 10,
            StartDate = DateTime.UtcNow.AddDays(10),
            EndDate = DateTime.UtcNow.AddDays(1), // Trước StartDate
            IsActive = true
        };

        await Assert.ThrowsAsync<CloudService.Domain.Exceptions.DomainException>(
            () => _sut.CreateAsync(dto));
    }
}
