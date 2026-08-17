using CloudService.Application.DTOs.Promotions;

namespace CloudService.Application.Interfaces;

/// <summary>
/// Interface Service xử lý logic nghiệp vụ cho Khuyến Mãi (Promotion)
/// </summary>
public interface IPromotionService
{
    /// <summary>
    /// Lấy danh sách tất cả khuyến mãi (dành cho Admin quản lý)
    /// </summary>
    Task<IEnumerable<PromotionDto>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy danh sách khuyến mãi đang có hiệu lực (Public cho khách hàng xem)
    /// </summary>
    Task<IEnumerable<PromotionDto>> GetActivePromotionsAsync(int? servicePlanId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy thông tin chi tiết khuyến mãi theo ID
    /// </summary>
    Task<PromotionDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Tạo mới một chương trình khuyến mãi (Admin/Editor)
    /// </summary>
    Task<PromotionDto> CreateAsync(CreatePromotionDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Cập nhật thông tin khuyến mãi
    /// </summary>
    Task<PromotionDto> UpdateAsync(int id, UpdatePromotionDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Xóa khuyến mãi (Soft-delete)
    /// </summary>
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Bật / Tắt trạng thái kích hoạt khuyến mãi
    /// </summary>
    Task<PromotionDto> ToggleActiveAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Xác thực và tính toán giá sau khi áp dụng mã giảm giá
    /// </summary>
    Task<ApplyPromotionResultDto> ApplyPromotionAsync(ApplyPromotionRequestDto dto, CancellationToken cancellationToken = default);
}
