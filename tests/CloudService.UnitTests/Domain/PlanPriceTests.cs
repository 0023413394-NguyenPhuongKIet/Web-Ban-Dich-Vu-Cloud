using CloudService.Domain.Entities;
using CloudService.Domain.Exceptions;

namespace CloudService.UnitTests.Domain;

/// <summary>
/// Test Domain logic cho PlanPrice.
/// </summary>
public class PlanPriceTests
{
    [Fact]
    public void Create_Should_Succeed_When_ValidPrices()
    {
        // Act
        var price = PlanPrice.Create(1, "Monthly", 100_000m, 80_000m);

        // Assert
        Assert.Equal(1, price.ServicePlanId);
        Assert.Equal("Monthly", price.BillingCycle);
        Assert.Equal(100_000m, price.OriginalPrice);
        Assert.Equal(80_000m, price.SellingPrice);
        Assert.True(price.IsCurrent);
    }

    [Fact]
    public void Create_Should_ThrowDomainException_When_NegativeOriginalPrice()
    {
        // Act & Assert
        var ex = Assert.Throws<DomainException>(() =>
            PlanPrice.Create(1, "Monthly", -100m, 80_000m));

        Assert.Contains("Giá gốc không được phép âm", ex.Message);
    }

    [Fact]
    public void Create_Should_ThrowDomainException_When_NegativeSellingPrice()
    {
        // Act & Assert
        var ex = Assert.Throws<DomainException>(() =>
            PlanPrice.Create(1, "Monthly", 100_000m, -50m));

        Assert.Contains("Giá bán không được phép âm", ex.Message);
    }

    [Fact]
    public void MarkAsNotCurrent_Should_Set_IsCurrent_False()
    {
        // Arrange
        var price = PlanPrice.Create(1, "Monthly", 100_000m, 80_000m);
        Assert.True(price.IsCurrent);

        // Act
        price.MarkAsNotCurrent();

        // Assert
        Assert.False(price.IsCurrent);
    }
}
