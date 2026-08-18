using CloudService.Application.DTOs.Affiliate;
using CloudService.Application.DTOs.AuditLog;
using CloudService.Application.Interfaces;
using CloudService.Application.Services;
using CloudService.Domain.Entities;
using Moq;
using Xunit;

namespace CloudService.UnitTests.Services;

public class ExportServiceTests
{
    private readonly Mock<IOrderRequestRepository> _orderRepoMock;
    private readonly Mock<IAuditLogRepository> _auditLogRepoMock;
    private readonly Mock<IAffiliateRepository> _affiliateRepoMock;
    private readonly ExportService _service;

    public ExportServiceTests()
    {
        _orderRepoMock = new Mock<IOrderRequestRepository>();
        _auditLogRepoMock = new Mock<IAuditLogRepository>();
        _affiliateRepoMock = new Mock<IAffiliateRepository>();

        _service = new ExportService(
            _orderRepoMock.Object,
            _auditLogRepoMock.Object,
            _affiliateRepoMock.Object);
    }

    [Fact]
    public async Task ExportOrdersToExcelAsync_ShouldReturnNonEmptyCsvBytes()
    {
        // Arrange
        _orderRepoMock.Setup(r => r.GetAllWithServicePlanAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OrderRequest>
            {
                new OrderRequest
                {
                    Id = 1,
                    CustomerName = "Nguyễn Văn A",
                    CustomerEmail = "a@example.com",
                    CustomerPhone = "0123456789",
                    CompanyName = "Công ty A",
                    BillingCycle = "Monthly",
                    TotalAmount = 500000m,
                    Status = "Completed",
                    ServicePlan = new ServicePlan { Name = "VPS Pro" }
                }
            });

        // Act
        var result = await _service.ExportOrdersToExcelAsync();

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Length > 0);
    }

    [Fact]
    public async Task ExportAuditLogsToExcelAsync_ShouldReturnNonEmptyCsvBytes()
    {
        // Arrange
        _auditLogRepoMock.Setup(r => r.GetAllFilteredAsync(It.IsAny<AuditLogQueryDto>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AuditLog>
            {
                new AuditLog { Id = 1, Action = "UPDATE", EntityName = "Promotion", IpAddress = "127.0.0.1" }
            });

        // Act
        var result = await _service.ExportAuditLogsToExcelAsync(new AuditLogQueryDto());

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Length > 0);
    }

    [Fact]
    public async Task ExportAffiliatesToExcelAsync_ShouldReturnNonEmptyCsvBytes()
    {
        // Arrange
        _affiliateRepoMock.Setup(r => r.GetAllFilteredAsync(It.IsAny<AffiliateQueryDto>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AffiliateApplication>
            {
                new AffiliateApplication { Id = 1, FullName = "Lê Văn D", Email = "d@example.com", Status = "Approved" }
            });

        // Act
        var result = await _service.ExportAffiliatesToExcelAsync(new AffiliateQueryDto());

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Length > 0);
    }
}
