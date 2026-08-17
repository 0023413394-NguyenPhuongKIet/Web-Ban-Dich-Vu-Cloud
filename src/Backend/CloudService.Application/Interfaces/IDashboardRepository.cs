using CloudService.Application.DTOs.Dashboard;

namespace CloudService.Application.Interfaces;

public interface IDashboardRepository
{
    Task<decimal> GetTotalRevenueAsync(CancellationToken cancellationToken = default);
    Task<int> GetTotalOrdersCountAsync(CancellationToken cancellationToken = default);
    Task<Dictionary<string, int>> GetOrdersCountByStatusAsync(CancellationToken cancellationToken = default);
    Task<int> GetTotalUsersCountAsync(CancellationToken cancellationToken = default);
    Task<int> GetTotalActiveServicePlansCountAsync(CancellationToken cancellationToken = default);
    Task<int> GetTotalNewsArticlesCountAsync(CancellationToken cancellationToken = default);
    Task<int> GetTotalAffiliateApplicationsCountAsync(CancellationToken cancellationToken = default);
    Task<List<RecentOrderDto>> GetRecentOrdersAsync(int count, CancellationToken cancellationToken = default);
    Task<List<MonthlyRevenueDto>> GetMonthlyRevenueAsync(int year, CancellationToken cancellationToken = default);
}
