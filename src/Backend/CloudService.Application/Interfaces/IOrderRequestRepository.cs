using CloudService.Domain.Entities;

namespace CloudService.Application.Interfaces;

public interface IOrderRequestRepository
{
    Task<List<OrderRequest>> GetAllWithServicePlanAsync(CancellationToken cancellationToken = default);
    Task<decimal> GetTotalRevenueAsync(CancellationToken cancellationToken = default);
    Task<Dictionary<string, int>> GetOrderCountByStatusAsync(CancellationToken cancellationToken = default);
    Task<List<OrderRequest>> GetRecentOrdersAsync(int count, CancellationToken cancellationToken = default);
    Task<int> GetTotalOrdersCountAsync(CancellationToken cancellationToken = default);
}
