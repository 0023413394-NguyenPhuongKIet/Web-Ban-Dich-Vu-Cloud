using CloudService.Application.DTOs.Services;

namespace CloudService.Application.Interfaces;

/// <summary>
/// Interface định nghĩa nghiệp vụ Quản lý Khuyến mãi (PR#7).
/// </summary>
public interface IPromotionService
{
    /// <summary>Lấy danh sách tất cả khuyến mãi.</summary>
    Task<List<PromotionDto>> GetAllAsync(bool includeInactive = false, CancellationToken cancellationToken = default);

    /// <summary>Lấy chi tiết khuyến mãi theo ID.</summary>
    Task<PromotionDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>Lấy khuyến mãi theo mã Code.</summary>
    Task<PromotionDto> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>Tạo mới khuyến mãi.</summary>
    Task<PromotionDto> CreateAsync(CreatePromotionDto dto, CancellationToken cancellationToken = default);

    /// <summary>Cập nhật thông tin khuyến mãi.</summary>
    Task<PromotionDto> UpdateAsync(int id, UpdatePromotionDto dto, CancellationToken cancellationToken = default);

    /// <summary>Xóa (soft-delete) khuyến mãi.</summary>
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Sinh mã QR Code PNG cho khuyến mãi theo Code.
    /// </summary>
    /// <param name="code">Mã khuyến mãi.</param>
    /// <param name="cancellationToken">Token hủy.</param>
    /// <returns>Mảng byte ảnh PNG của QR code.</returns>
    Task<byte[]> GeneratePromotionQrCodeAsync(string code, CancellationToken cancellationToken = default);
}
