using CloudService.Domain.Entities;
using CloudService.Domain.Exceptions;
using Xunit;

namespace CloudService.UnitTests.Domain;

/// <summary>
/// Bộ kiểm thử Đơn vị (Unit Tests) cho Domain Entity Promotion.
/// Kiểm tra logic nghiệp vụ giảm giá, kiểm tra hạn sử dụng và ràng buộc gói dịch vụ.
/// </summary>
public class PromotionTests
{
    [Fact]
    public void IsValid_WhenActiveAndWithinDateRange_ShouldReturnTrue()
    {
        // Arrange
        var promo = new Promotion
        {
            Code = "TEST20",
            DiscountPercent = 20,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(10),
            IsActive = true,
            IsDeleted = false
        };

        // Act
        var isValid = promo.IsValid();

        // Assert
        Assert.True(isValid);
    }

    [Fact]
    public void IsValid_WhenExpired_ShouldReturnFalse()
    {
        // Arrange
        var promo = new Promotion
        {
            Code = "EXPIRED",
            DiscountPercent = 10,
            StartDate = DateTime.UtcNow.AddDays(-20),
            EndDate = DateTime.UtcNow.AddDays(-1), // Đã hết hạn
            IsActive = true,
            IsDeleted = false
        };

        // Act
        var isValid = promo.IsValid();

        // Assert
        Assert.False(isValid);
    }

    [Fact]
    public void IsValid_WhenInactiveOrDeleted_ShouldReturnFalse()
    {
        // Arrange
        var promoInactive = new Promotion
        {
            Code = "INACTIVE",
            DiscountPercent = 10,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(10),
            IsActive = false, // Bị tắt
            IsDeleted = false
        };

        var promoDeleted = new Promotion
        {
            Code = "DELETED",
            DiscountPercent = 10,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(10),
            IsActive = true,
            IsDeleted = true // Bị xóa mềm
        };

        // Act & Assert
        Assert.False(promoInactive.IsValid());
        Assert.False(promoDeleted.IsValid());
    }

    [Fact]
    public void IsValid_WithSpecificServicePlanId_ShouldMatchOnlyTargetPlan()
    {
        // Arrange
        var promo = new Promotion
        {
            Code = "VPSONLY",
            ServicePlanId = 5, // Chỉ áp dụng cho gói 5
            DiscountPercent = 15,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(10),
            IsActive = true
        };

        // Act & Assert
        Assert.True(promo.IsValid(targetPlanId: 5));  // Đúng gói
        Assert.False(promo.IsValid(targetPlanId: 10)); // Khác gói
    }

    [Theory]
    [InlineData(1000000, 20, 200000, 800000)] // Giá 1.000.000đ giảm 20% -> giảm 200.000đ, còn 800.000đ
    [InlineData(500000, 50, 250000, 250000)]   // Giá 500.000đ giảm 50% -> giảm 250.000đ, còn 250.000đ
    [InlineData(200000, 100, 200000, 0)]      // Giảm 100% -> miễn phí 0đ
    public void CalculateDiscount_WhenValid_ShouldCalculateCorrectAmounts(
        decimal originalPrice, double discountPercent, decimal expectedDiscount, decimal expectedFinalPrice)
    {
        // Arrange
        var promo = new Promotion
        {
            Code = "CALCTEST",
            DiscountPercent = discountPercent,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(10),
            IsActive = true
        };

        // Act
        var (discountAmount, finalPrice) = promo.CalculateDiscount(originalPrice);

        // Assert
        Assert.Equal(expectedDiscount, discountAmount);
        Assert.Equal(expectedFinalPrice, finalPrice);
    }

    [Fact]
    public void CalculateDiscount_WhenExpired_ShouldThrowDomainException()
    {
        // Arrange
        var promo = new Promotion
        {
            Code = "EXPIRED_CALC",
            DiscountPercent = 20,
            StartDate = DateTime.UtcNow.AddDays(-20),
            EndDate = DateTime.UtcNow.AddDays(-5),
            IsActive = true
        };

        // Act & Assert
        Assert.Throws<DomainException>(() => promo.CalculateDiscount(1000000));
    }
}
