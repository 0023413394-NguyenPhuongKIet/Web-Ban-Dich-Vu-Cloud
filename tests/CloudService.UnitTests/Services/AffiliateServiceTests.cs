using CloudService.Application.DTOs.Affiliate;
using CloudService.Application.Interfaces;
using CloudService.Application.Services;
using CloudService.Domain.Entities;
using CloudService.Domain.Exceptions;
using Moq;
using Xunit;

namespace CloudService.UnitTests.Services;

public class AffiliateServiceTests
{
    private readonly Mock<IAffiliateRepository> _affiliateRepoMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly AffiliateService _service;

    public AffiliateServiceTests()
    {
        _affiliateRepoMock = new Mock<IAffiliateRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _service = new AffiliateService(_affiliateRepoMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task RegisterAsync_ShouldCreatePendingApplication()
    {
        // Arrange
        var dto = new RegisterAffiliateDto
        {
            FullName = "Trần Văn B",
            Email = "affiliate@example.com",
            Phone = "0987654321",
            WebsiteUrl = "https://myblog.com",
            PromotionPlan = "Quảng bá qua Blog và Youtube"
        };

        // Act
        var result = await _service.RegisterAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Pending", result.Status);
        Assert.Equal(dto.FullName, result.FullName);
        Assert.Equal(dto.Email, result.Email);

        _affiliateRepoMock.Verify(r => r.AddAsync(It.IsAny<AffiliateApplication>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateStatusAsync_WhenFound_ShouldUpdateStatus()
    {
        // Arrange
        var existing = new AffiliateApplication
        {
            Id = 1,
            FullName = "Nguyễn Văn C",
            Email = "aff@example.com",
            Status = "Pending"
        };

        _affiliateRepoMock.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        var updateDto = new UpdateAffiliateStatusDto { Status = "Approved" };

        // Act
        var result = await _service.UpdateStatusAsync(1, updateDto);

        // Assert
        Assert.Equal("Approved", result.Status);
        _affiliateRepoMock.Verify(r => r.UpdateAsync(existing, It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateStatusAsync_WhenNotFound_ShouldThrowNotFoundException()
    {
        // Arrange
        _affiliateRepoMock.Setup(r => r.GetByIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((AffiliateApplication?)null);

        var updateDto = new UpdateAffiliateStatusDto { Status = "Approved" };

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => _service.UpdateStatusAsync(999, updateDto));
    }
}
