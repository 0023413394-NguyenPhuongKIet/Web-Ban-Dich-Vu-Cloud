using CloudService.Application.Interfaces;
using CloudService.Domain.Entities;
using CloudService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CloudService.Infrastructure.Repositories;

public class OrderRequestRepository : IOrderRequestRepository
{
    private readonly ApplicationDbContext _context;

    public OrderRequestRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<OrderRequest>> GetAllWithServicePlanAsync(CancellationToken cancellationToken = default)
    {
        return await _context.OrderRequests
            .Include(o => o.ServicePlan)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<decimal> GetTotalRevenueAsync(CancellationToken cancellationToken = default)
    {
        return await _context.OrderRequests
            .Where(o => o.Status == "Completed")
            .SumAsync(o => (decimal?)o.TotalAmount, cancellationToken) ?? 0m;
    }

    public async Task<Dictionary<string, int>> GetOrderCountByStatusAsync(CancellationToken cancellationToken = default)
    {
        return await _context.OrderRequests
            .GroupBy(o => o.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Status, x => x.Count, cancellationToken);
    }

    public async Task<List<OrderRequest>> GetRecentOrdersAsync(int count, CancellationToken cancellationToken = default)
    {
        return await _context.OrderRequests
            .Include(o => o.ServicePlan)
            .OrderByDescending(o => o.CreatedAt)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetTotalOrdersCountAsync(CancellationToken cancellationToken = default)
    {
        return await _context.OrderRequests.CountAsync(cancellationToken);
    }
}
