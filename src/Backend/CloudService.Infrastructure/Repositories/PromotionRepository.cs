using CloudService.Application.Interfaces;
using CloudService.Domain.Entities;
using CloudService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CloudService.Infrastructure.Repositories;

/// <summary>
/// Repository thao tác dữ liệu Khuyến Mãi (Promotion) với EF Core
/// </summary>
public class PromotionRepository : IPromotionRepository
{
    private readonly ApplicationDbContext _context;

    public PromotionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy chi tiết khuyến mãi theo ID (kèm thông tin gói dịch vụ)
    /// </summary>
    public async Task<Promotion?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Promotions
            .Include(p => p.ServicePlan)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    /// <summary>
    /// Lấy tất cả khuyến mãi chưa bị xóa mềm, sắp xếp mới nhất lên đầu
    /// </summary>
    public async Task<List<Promotion>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Promotions
            .Include(p => p.ServicePlan)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Tìm khuyến mãi theo mã Code (không phân biệt chữ hoa / chữ thường)
    /// </summary>
    public async Task<Promotion?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        var upperCode = code.Trim().ToUpper();
        return await _context.Promotions
            .Include(p => p.ServicePlan)
            .FirstOrDefaultAsync(p => p.Code.ToUpper() == upperCode, cancellationToken);
    }

    /// <summary>
    /// Kiểm tra trùng lặp mã Code
    /// </summary>
    public async Task<bool> CodeExistsAsync(string code, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var upperCode = code.Trim().ToUpper();
        var query = _context.Promotions.Where(p => p.Code.ToUpper() == upperCode);

        if (excludeId.HasValue)
        {
            query = query.Where(p => p.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    /// <summary>
    /// Lấy danh sách các khuyến mãi đang có hiệu lực (active, trong thời hạn, đúng gói dịch vụ)
    /// </summary>
    public async Task<List<Promotion>> GetActivePromotionsAsync(int? servicePlanId = null, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var query = _context.Promotions
            .Include(p => p.ServicePlan)
            .Where(p => p.IsActive && p.StartDate <= now && p.EndDate >= now);

        if (servicePlanId.HasValue)
        {
            // Lấy các khuyến mãi áp dụng chung cho tất cả gói (null) HOẶC áp dụng riêng cho gói này
            query = query.Where(p => p.ServicePlanId == null || p.ServicePlanId == servicePlanId.Value);
        }

        return await query.OrderByDescending(p => p.DiscountPercent).ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Promotion entity, CancellationToken cancellationToken = default)
    {
        await _context.Promotions.AddAsync(entity, cancellationToken);
    }

    public void Update(Promotion entity)
    {
        _context.Promotions.Update(entity);
    }

    public void Delete(Promotion entity)
    {
        // Kế thừa BaseEntity -> ApplicationDbContext hỗ trợ Soft Delete khi xóa
        _context.Promotions.Remove(entity);
    }
}
