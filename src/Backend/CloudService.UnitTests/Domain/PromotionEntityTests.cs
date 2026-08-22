using CloudService.Domain.Entities;
using CloudService.Domain.Exceptions;
using Xunit;

namespace CloudService.UnitTests.Domain;

/// <summary>
/// Unit tests cho Domain Entity: Promotion
/// Kiểm tra các business rules: IsValid, CalculateDiscount, ToggleActive
/// </summary>
public class PromotionEntityTests
{
    // =====================================================
    // Helpers
    // =====================================================
    private static Promotion CreateValidPromotion(int? planId = null) => new()
    {
        Id = 1,
        Code = "TEST10",
        Title = "Giảm 10% test",
        DiscountPercent = 10,
        StartDate = DateTime.UtcNow.AddDays(-1),
        EndDate = DateTime.UtcNow.AddDays(30),
        IsActive = true,
        IsDeleted = false,
        ServicePlanId = planId
    };

    // =====================================================
    // IsValid tests (TC-01 → TC-05)
    // =====================================================

    /// <summary>TC-01: Promotion đang active, chưa hết hạn → IsValid() = true</summary>
    [Fact]
    public void IsValid_ActiveAndWithinDateRange_ReturnsTrue()
    {
        var promo = CreateValidPromotion();
        Assert.True(promo.IsValid());
    }

    /// <summary>TC-02: Promotion bị IsDeleted → IsValid() = false</summary>
    [Fact]
    public void IsValid_WhenDeleted_ReturnsFalse()
    {
        var promo = CreateValidPromotion();
        promo.IsDeleted = true;
        Assert.False(promo.IsValid());
    }

    /// <summary>TC-03: Promotion IsActive = false → IsValid() = false</summary>
    [Fact]
    public void IsValid_WhenNotActive_ReturnsFalse()
    {
        var promo = CreateValidPromotion();
        promo.IsActive = false;
        Assert.False(promo.IsValid());
    }

    /// <summary>TC-04: Promotion đã hết hạn (EndDate trong quá khứ) → IsValid() = false</summary>
    [Fact]
    public void IsValid_WhenExpired_ReturnsFalse()
    {
        var promo = CreateValidPromotion();
        promo.EndDate = DateTime.UtcNow.AddDays(-1);
        Assert.False(promo.IsValid());
    }

    /// <summary>TC-05: Promotion chưa đến ngày bắt đầu → IsValid() = false</summary>
    [Fact]
    public void IsValid_WhenNotStartedYet_ReturnsFalse()
    {
        var promo = CreateValidPromotion();
        promo.StartDate = DateTime.UtcNow.AddDays(5);
        promo.EndDate = DateTime.UtcNow.AddDays(10);
        Assert.False(promo.IsValid());
    }

    /// <summary>TC-06: Promotion áp dụng cho plan khác → IsValid(planId) = false</summary>
    [Fact]
    public void IsValid_WhenTargetPlanMismatch_ReturnsFalse()
    {
        var promo = CreateValidPromotion(planId: 1);
        Assert.False(promo.IsValid(targetPlanId: 999));
    }

    /// <summary>TC-07: Promotion không ràng buộc plan → IsValid với bất kỳ planId nào = true</summary>
    [Fact]
    public void IsValid_WhenNoPlanRestriction_ReturnsTrue()
    {
        var promo = CreateValidPromotion(planId: null);
        Assert.True(promo.IsValid(targetPlanId: 999));
    }

    // =====================================================
    // CalculateDiscount tests (TC-08 → TC-12)
    // =====================================================

    /// <summary>TC-08: Giảm 10% trên 1,000,000 → DiscountAmount=100,000; FinalPrice=900,000</summary>
    [Fact]
    public void CalculateDiscount_10PercentOn1M_ReturnsCorrectValues()
    {
        var promo = CreateValidPromotion();
        promo.DiscountPercent = 10;

        var (discountAmount, finalPrice) = promo.CalculateDiscount(1_000_000m);

        Assert.Equal(100_000m, discountAmount);
        Assert.Equal(900_000m, finalPrice);
    }

    /// <summary>TC-09: Giảm 50% → FinalPrice = nguyên giá / 2</summary>
    [Fact]
    public void CalculateDiscount_50Percent_ReturnsHalfPrice()
    {
        var promo = CreateValidPromotion();
        promo.DiscountPercent = 50;

        var (_, finalPrice) = promo.CalculateDiscount(500_000m);

        Assert.Equal(250_000m, finalPrice);
    }

    /// <summary>TC-10: Giá gốc = 0 → DiscountAmount = 0, FinalPrice = 0</summary>
    [Fact]
    public void CalculateDiscount_ZeroPrice_ReturnsZero()
    {
        var promo = CreateValidPromotion();

        var (discountAmount, finalPrice) = promo.CalculateDiscount(0m);

        Assert.Equal(0m, discountAmount);
        Assert.Equal(0m, finalPrice);
    }

    /// <summary>TC-11: Giá gốc âm → ném DomainException</summary>
    [Fact]
    public void CalculateDiscount_NegativePrice_ThrowsDomainException()
    {
        var promo = CreateValidPromotion();

        Assert.Throws<DomainException>(() => promo.CalculateDiscount(-1m));
    }

    /// <summary>TC-12: Promotion không hợp lệ (expired) → CalculateDiscount ném DomainException</summary>
    [Fact]
    public void CalculateDiscount_ExpiredPromotion_ThrowsDomainException()
    {
        var promo = CreateValidPromotion();
        promo.EndDate = DateTime.UtcNow.AddDays(-5);

        Assert.Throws<DomainException>(() => promo.CalculateDiscount(100_000m));
    }

    // =====================================================
    // ToggleActive tests (TC-13 → TC-14)
    // =====================================================

    /// <summary>TC-13: ToggleActive(false) → IsActive = false</summary>
    [Fact]
    public void ToggleActive_SetFalse_DeactivatesPromotion()
    {
        var promo = CreateValidPromotion();
        promo.ToggleActive(false);
        Assert.False(promo.IsActive);
    }

    /// <summary>TC-14: ToggleActive(true) → IsActive = true</summary>
    [Fact]
    public void ToggleActive_SetTrue_ActivatesPromotion()
    {
        var promo = CreateValidPromotion();
        promo.IsActive = false;
        promo.ToggleActive(true);
        Assert.True(promo.IsActive);
    }
}
