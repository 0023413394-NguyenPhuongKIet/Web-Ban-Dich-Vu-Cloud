using CloudService.Application.DTOs.Services;
using CloudService.Application.Interfaces;
using CloudService.Application.Services;
using CloudService.Domain.Entities;
using CloudService.Domain.Exceptions;
using Moq;

namespace CloudService.UnitTests.Services;

/// <summary>
/// Unit tests cho PlanPriceService.
/// </summary>
public class PlanPriceServiceTests
{
    private readonly Mock<IPlanPriceRepository> _priceRepoMock;
    private readonly Mock<IServicePlanRepository> _planRepoMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly PlanPriceService _service;

    public PlanPriceServiceTests()
    {
        _priceRepoMock = new Mock<IPlanPriceRepository>();
        _planRepoMock = new Mock<IServicePlanRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _service = new PlanPriceService(_priceRepoMock.Object, _planRepoMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task SetPriceAsync_Should_CreateNewPrice_And_MarkOldAsNotCurrent()
    {
        // Arrange
        var oldPrice = PlanPrice.Create(1, "Monthly", 100_000m, 80_000m);
        _planRepoMock.Setup(r => r.ExistsAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _priceRepoMock.Setup(r => r.GetCurrentPriceAsync(1, "Monthly", It.IsAny<CancellationToken>()))
            .ReturnsAsync(oldPrice);

        var dto = new SetPlanPriceDto
        {
            BillingCycle = "Monthly",
            OriginalPrice = 120_000m,
            SellingPrice = 100_000m
        };

        // Act
        var result = await _service.SetPriceAsync(1, dto);

        // Assert
        Assert.False(oldPrice.IsCurrent); // Giá cũ đã bị đánh dấu không còn hiện hành
        Assert.Equal(120_000m, result.OriginalPrice);
        Assert.True(result.IsCurrent);
        _priceRepoMock.Verify(r => r.Update(oldPrice), Times.Once);
        _priceRepoMock.Verify(r => r.AddAsync(It.IsAny<PlanPrice>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task SetPriceAsync_Should_ThrowNotFoundException_When_PlanNotExists()
    {
        // Arrange
        _planRepoMock.Setup(r => r.ExistsAsync(999, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var dto = new SetPlanPriceDto { BillingCycle = "Monthly", OriginalPrice = 100_000m, SellingPrice = 80_000m };

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => _service.SetPriceAsync(999, dto));
    }
}
