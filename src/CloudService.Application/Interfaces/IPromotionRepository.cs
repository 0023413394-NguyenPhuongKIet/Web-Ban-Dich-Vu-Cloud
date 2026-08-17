using CloudService.Domain.Entities;

namespace CloudService.Application.Interfaces;

/// <summary>
/// Repository cho Promotion — cung cấp truy cập dữ liệu khuyến mãi.
/// </summary>
public interface IPromotionRepository
{
    /// <summary>Lấy tất cả khuyến mãi (tuỳ chọn bao gồm khuyến mãi không hoạt động).</summary>
    Task<List<Promotion>> GetAllAsync(bool includeInactive = false, CancellationToken cancellationToken = default);

    /// <summary>Lấy khuyến mãi theo ID.</summary>
    Task<Promotion?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>Lấy khuyến mãi theo mã Code (không phân biệt hoa thường).</summary>
    Task<Promotion?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>Kiểm tra mã Code đã tồn tại chưa (loại trừ bản ghi có excludeId).</summary>
    Task<bool> CodeExistsAsync(string code, int? excludeId = null, CancellationToken cancellationToken = default);

    Task AddAsync(Promotion entity, CancellationToken cancellationToken = default);
    void Update(Promotion entity);
    void Remove(Promotion entity);
}
