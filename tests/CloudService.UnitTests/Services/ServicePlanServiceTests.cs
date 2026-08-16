using CloudService.Application.DTOs.Services;
using CloudService.Application.Interfaces;
using CloudService.Application.Services;
using CloudService.Domain.Entities;
using CloudService.Domain.Exceptions;
using Moq;

namespace CloudService.UnitTests.Services;

/// <summary>
/// Unit tests cho ServicePlanService.
/// </summary>
public class ServicePlanServiceTests
{
    private readonly Mock<IServicePlanRepository> _planRepoMock;
    private readonly Mock<IServiceCategoryRepository> _categoryRepoMock;
    private readonly Mock<IPlanPriceRepository> _priceRepoMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly ServicePlanService _service;

    public ServicePlanServiceTests()
    {
        _planRepoMock = new Mock<IServicePlanRepository>();
        _categoryRepoMock = new Mock<IServiceCategoryRepository>();
        _priceRepoMock = new Mock<IPlanPriceRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _service = new ServicePlanService(
            _planRepoMock.Object,
            _categoryRepoMock.Object,
            _priceRepoMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task CreateAsync_Should_Succeed_When_CategoryExists()
    {
        // Arrange
        _categoryRepoMock.Setup(r => r.ExistsAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var dto = new CreateServicePlanDto
        {
            ServiceCategoryId = 1,
            Name = "VPS Basic",
            Code = "VPS-01",
            Description = "Gói VPS cơ bản",
            SpecsJson = "{\"CPU\": 1, \"RAM\": \"1GB\"}"
        };

        // Act
        var result = await _service.CreateAsync(dto);

        // Assert
        Assert.Equal("VPS Basic", result.Name);
        _planRepoMock.Verify(r => r.AddAsync(It.IsAny<ServicePlan>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_Should_ThrowNotFoundException_When_CategoryNotExists()
    {
        // Arrange
        _categoryRepoMock.Setup(r => r.ExistsAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var dto = new CreateServicePlanDto { ServiceCategoryId = 999, Name = "Test" };

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => _service.CreateAsync(dto));
    }

    [Fact]
    public async Task GetByIdAsync_Should_ThrowNotFoundException_When_PlanNotExists()
    {
        // Arrange
        _planRepoMock.Setup(r => r.GetByIdWithDetailsAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ServicePlan?)null);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => _service.GetByIdAsync(999));
    }

    [Fact]
    public async Task DeleteAsync_Should_SoftDelete_When_PlanExists()
    {
        // Arrange
        var plan = new ServicePlan { Id = 1, Name = "VPS Basic", IsActive = true, IsDeleted = false };
        _planRepoMock.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(plan);

        // Act
        await _service.DeleteAsync(1);

        // Assert
        Assert.False(plan.IsActive);
        Assert.True(plan.IsDeleted);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
