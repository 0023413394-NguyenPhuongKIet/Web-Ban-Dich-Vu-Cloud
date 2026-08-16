using CloudService.Domain.Entities;

namespace CloudService.Application.Interfaces;

/// <summary>
/// Repository cho PlanPrice.
/// </summary>
public interface IPlanPriceRepository
{
    /// <summary>
    /// Lấy bản ghi giá hiện hành cho một cặp (ServicePlanId, BillingCycle).
    /// </summary>
    Task<PlanPrice?> GetCurrentPriceAsync(int servicePlanId, string billingCycle, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy tất cả giá hiện hành của một gói dịch vụ.
    /// </summary>
    Task<List<PlanPrice>> GetCurrentPricesByPlanIdAsync(int servicePlanId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy lịch sử giá của một gói dịch vụ (bao gồm cả giá cũ).
    /// </summary>
    Task<List<PlanPrice>> GetPriceHistoryAsync(int servicePlanId, CancellationToken cancellationToken = default);

    Task AddAsync(PlanPrice entity, CancellationToken cancellationToken = default);
    void Update(PlanPrice entity);
}
