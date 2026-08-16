using CloudService.Application.Interfaces;
using CloudService.Domain.Entities;
using CloudService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CloudService.Infrastructure.Repositories;

public class PlanPriceRepository : IPlanPriceRepository
{
    private readonly ApplicationDbContext _context;

    public PlanPriceRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PlanPrice?> GetCurrentPriceAsync(int servicePlanId, string billingCycle, CancellationToken cancellationToken = default)
    {
        return await _context.PlanPrices
            .Where(p => p.ServicePlanId == servicePlanId
                        && p.BillingCycle == billingCycle
                        && p.IsCurrent)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<List<PlanPrice>> GetCurrentPricesByPlanIdAsync(int servicePlanId, CancellationToken cancellationToken = default)
    {
        return await _context.PlanPrices
            .Where(p => p.ServicePlanId == servicePlanId && p.IsCurrent)
            .OrderBy(p => p.BillingCycle)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<PlanPrice>> GetPriceHistoryAsync(int servicePlanId, CancellationToken cancellationToken = default)
    {
        return await _context.PlanPrices
            .IgnoreQueryFilters() // Bỏ qua global filter IsDeleted để xem toàn bộ lịch sử
            .Where(p => p.ServicePlanId == servicePlanId)
            .OrderByDescending(p => p.EffectiveDate)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(PlanPrice entity, CancellationToken cancellationToken = default)
    {
        await _context.PlanPrices.AddAsync(entity, cancellationToken);
    }

    public void Update(PlanPrice entity)
    {
        _context.PlanPrices.Update(entity);
    }
}
