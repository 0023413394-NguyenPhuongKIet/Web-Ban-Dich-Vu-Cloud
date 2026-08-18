using CloudService.Application.DTOs.Dashboard;
using CloudService.Application.Interfaces;
using CloudService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CloudService.Infrastructure.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly ApplicationDbContext _context;

    public DashboardRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<decimal> GetTotalRevenueAsync(CancellationToken cancellationToken = default)
    {
        return await _context.OrderRequests
            .Where(o => o.Status == "Completed")
            .SumAsync(o => (decimal?)o.TotalAmount, cancellationToken) ?? 0m;
    }

    public async Task<int> GetTotalOrdersCountAsync(CancellationToken cancellationToken = default)
    {
        return await _context.OrderRequests.CountAsync(cancellationToken);
    }

    public async Task<Dictionary<string, int>> GetOrdersCountByStatusAsync(CancellationToken cancellationToken = default)
    {
        return await _context.OrderRequests
            .GroupBy(o => o.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Status, x => x.Count, cancellationToken);
    }

    public async Task<int> GetTotalUsersCountAsync(CancellationToken cancellationToken = default)
    {
        return await _context.AppUsers.CountAsync(cancellationToken);
    }

    public async Task<int> GetTotalActiveServicePlansCountAsync(CancellationToken cancellationToken = default)
    {
        return await _context.ServicePlans
            .Where(p => p.IsActive)
            .CountAsync(cancellationToken);
    }

    public async Task<int> GetTotalNewsArticlesCountAsync(CancellationToken cancellationToken = default)
    {
        return await _context.NewsArticles.CountAsync(cancellationToken);
    }

    public async Task<int> GetTotalAffiliateApplicationsCountAsync(CancellationToken cancellationToken = default)
    {
        return await _context.AffiliateApplications.CountAsync(cancellationToken);
    }

    public async Task<List<RecentOrderDto>> GetRecentOrdersAsync(int count, CancellationToken cancellationToken = default)
    {
        var rawOrders = await _context.OrderRequests
            .Include(o => o.ServicePlan)
            .OrderByDescending(o => o.CreatedAt)
            .Take(count)
            .ToListAsync(cancellationToken);

        return rawOrders.Select(o => new RecentOrderDto
        {
            Id = o.Id,
            CustomerName = o.CustomerName,
            CustomerEmail = o.CustomerEmail,
            ServicePlanName = o.ServicePlan != null ? o.ServicePlan.Name : "N/A",
            TotalAmount = o.TotalAmount,
            Status = o.Status,
            CreatedAt = o.CreatedAt
        }).ToList();
    }

    public async Task<List<MonthlyRevenueDto>> GetMonthlyRevenueAsync(int year, CancellationToken cancellationToken = default)
    {
        return await _context.OrderRequests
            .Where(o => o.Status == "Completed" && o.CreatedAt.Year == year)
            .GroupBy(o => new { o.CreatedAt.Year, o.CreatedAt.Month })
            .Select(g => new MonthlyRevenueDto
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Revenue = g.Sum(o => o.TotalAmount),
                OrderCount = g.Count()
            })
            .OrderBy(m => m.Month)
            .ToListAsync(cancellationToken);
    }
}
