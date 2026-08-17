using CloudService.Application.DTOs.Dashboard;
using CloudService.Application.Interfaces;
using CloudService.Application.Services;
using Moq;
using Xunit;

namespace CloudService.UnitTests.Services;

public class DashboardServiceTests
{
    private readonly Mock<IDashboardRepository> _dashboardRepoMock;
    private readonly DashboardService _service;

    public DashboardServiceTests()
    {
        _dashboardRepoMock = new Mock<IDashboardRepository>();
        _service = new DashboardService(_dashboardRepoMock.Object);
    }

    [Fact]
    public async Task GetSummaryAsync_ShouldReturnAggregatedMetrics()
    {
        // Arrange
        _dashboardRepoMock.Setup(r => r.GetTotalRevenueAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(15000000m);
        _dashboardRepoMock.Setup(r => r.GetTotalOrdersCountAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(25);
        _dashboardRepoMock.Setup(r => r.GetOrdersCountByStatusAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Dictionary<string, int> { { "Completed", 20 }, { "Pending", 5 } });
        _dashboardRepoMock.Setup(r => r.GetTotalUsersCountAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(100);
        _dashboardRepoMock.Setup(r => r.GetTotalActiveServicePlansCountAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(12);
        _dashboardRepoMock.Setup(r => r.GetTotalNewsArticlesCountAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(8);
        _dashboardRepoMock.Setup(r => r.GetTotalAffiliateApplicationsCountAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(4);
        _dashboardRepoMock.Setup(r => r.GetRecentOrdersAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<RecentOrderDto>
            {
                new RecentOrderDto { Id = 1, CustomerName = "Nguyễn Văn A", TotalAmount = 500000m, Status = "Completed" }
            });
        _dashboardRepoMock.Setup(r => r.GetMonthlyRevenueAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<MonthlyRevenueDto>
            {
                new MonthlyRevenueDto { Year = 2026, Month = 8, Revenue = 15000000m, OrderCount = 20 }
            });

        // Act
        var result = await _service.GetSummaryAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(15000000m, result.TotalRevenue);
        Assert.Equal(25, result.TotalOrders);
        Assert.Equal(100, result.TotalUsers);
        Assert.Equal(12, result.TotalActiveServicePlans);
        Assert.Equal(8, result.TotalNewsArticles);
        Assert.Equal(4, result.TotalAffiliateApplications);
        Assert.Single(result.RecentOrders);
        Assert.Single(result.MonthlyRevenue);
    }
}
