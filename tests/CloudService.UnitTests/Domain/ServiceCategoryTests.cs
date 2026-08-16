using CloudService.Domain.Entities;
using CloudService.Domain.Exceptions;

namespace CloudService.UnitTests.Domain;

/// <summary>
/// Test Domain logic cho ServiceCategory.
/// </summary>
public class ServiceCategoryTests
{
    [Fact]
    public void Deactivate_Should_ThrowDomainException_When_HasActivePlans()
    {
        // Arrange
        var category = new ServiceCategory
        {
            Id = 1,
            Name = "VPS",
            Slug = "vps",
            IsActive = true,
            ServicePlans = new List<ServicePlan>
            {
                new ServicePlan { Id = 1, Name = "VPS Basic", IsActive = true, IsDeleted = false }
            }
        };

        // Act & Assert
        var ex = Assert.Throws<DomainException>(() => category.Deactivate());
        Assert.Contains("Không thể xóa danh mục còn gói dịch vụ đang hoạt động", ex.Message);
    }

    [Fact]
    public void Deactivate_Should_Succeed_When_NoActivePlans()
    {
        // Arrange
        var category = new ServiceCategory
        {
            Id = 1,
            Name = "VPS",
            Slug = "vps",
            IsActive = true,
            ServicePlans = new List<ServicePlan>
            {
                new ServicePlan { Id = 1, Name = "VPS Basic", IsActive = false, IsDeleted = true }
            }
        };

        // Act
        category.Deactivate();

        // Assert
        Assert.False(category.IsActive);
    }
}
