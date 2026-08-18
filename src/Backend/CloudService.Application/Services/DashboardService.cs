using CloudService.Application.DTOs.Dashboard;
using CloudService.Application.Interfaces;

namespace CloudService.Application.Services;

/// <summary>
/// Service tính toán và cung cấp dữ liệu Thống kê cho Admin Dashboard.
/// </summary>
public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _dashboardRepo;

    public DashboardService(IDashboardRepository dashboardRepo)
    {
        _dashboardRepo = dashboardRepo;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default)
    {
        var totalRevenue = await _dashboardRepo.GetTotalRevenueAsync(cancellationToken);
        var totalOrders = await _dashboardRepo.GetTotalOrdersCountAsync(cancellationToken);
        var ordersByStatus = await _dashboardRepo.GetOrdersCountByStatusAsync(cancellationToken);
        var totalUsers = await _dashboardRepo.GetTotalUsersCountAsync(cancellationToken);
        var totalActivePlans = await _dashboardRepo.GetTotalActiveServicePlansCountAsync(cancellationToken);
        var totalArticles = await _dashboardRepo.GetTotalNewsArticlesCountAsync(cancellationToken);
        var totalAffiliates = await _dashboardRepo.GetTotalAffiliateApplicationsCountAsync(cancellationToken);

        var recentOrders = await _dashboardRepo.GetRecentOrdersAsync(5, cancellationToken);

        var currentYear = DateTime.UtcNow.Year;
        var monthlyRevenue = await _dashboardRepo.GetMonthlyRevenueAsync(currentYear, cancellationToken);

        return new DashboardSummaryDto
        {
            TotalRevenue = totalRevenue,
            TotalOrders = totalOrders,
            OrdersByStatus = ordersByStatus,
            TotalUsers = totalUsers,
            TotalActiveServicePlans = totalActivePlans,
            TotalNewsArticles = totalArticles,
            TotalAffiliateApplications = totalAffiliates,
            RecentOrders = recentOrders,
            MonthlyRevenue = monthlyRevenue
        };
    }
}
