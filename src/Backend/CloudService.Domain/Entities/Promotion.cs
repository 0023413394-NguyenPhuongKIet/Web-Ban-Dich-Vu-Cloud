using CloudService.Domain.Common;
using CloudService.Domain.Exceptions;

namespace CloudService.Domain.Entities;

/// <summary>
/// Entity Khuyến Mãi / Mã Giảm Giá (Promotion)
/// Quản lý thông tin mã giảm giá, phần trăm chiết khấu, thời gian áp dụng và gói dịch vụ áp dụng.
/// Kế thừa BaseEntity để có sẵn Id, CreatedAt, UpdatedAt, IsDeleted.
/// </summary>
public class Promotion : BaseEntity
{
    /// <summary>
    /// ID Gói dịch vụ áp dụng (nếu null là áp dụng cho TẤT CẢ các gói)
    /// </summary>
    public int? ServicePlanId { get; set; }

    /// <summary>
    /// Mã giảm giá / Coupon code (ví dụ: CLOUD2026, SALE50). Viết hoa, không dấu, không khoảng trắng.
    /// </summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Tiêu đề hoặc mô tả ngắn gọn chương trình khuyến mãi
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Phần trăm giảm giá (ví dụ: 10 = giảm 10%, 25.5 = giảm 25.5%). Giá trị từ 0.01 đến 100%.
    /// </summary>
    public double DiscountPercent { get; set; }

    /// <summary>
    /// Ngày bắt đầu có hiệu lực
    /// </summary>
    public DateTime StartDate { get; set; }

    /// <summary>
    /// Ngày kết thúc / Hết hạn khuyến mãi
    /// </summary>
    public DateTime EndDate { get; set; }

    /// <summary>
    /// Trạng thái kích hoạt (true: đang bật, false: tạm dừng)
    /// </summary>
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ServicePlan? ServicePlan { get; set; }

    // ==========================================
    // DOMAIN METHODS & BUSINESS RULES (OOP)
    // ==========================================

    /// <summary>
    /// Kiểm tra xem mã khuyến mãi có đang hợp lệ tại thời điểm cụ thể hay không.
    /// Luồng hoạt động:
    /// 1. Kiểm tra xóa mềm (IsDeleted) và trạng thái kích hoạt (IsActive).
    /// 2. So sánh mốc thời gian kiểm tra với StartDate và EndDate.
    /// 3. Nếu có ràng buộc ServicePlanId thì kiểm tra xem gói mua có khớp hay không.
    /// </summary>
    /// <param name="targetPlanId">ID gói dịch vụ mà khách hàng đang chọn mua (optional)</param>
    /// <param name="checkTime">Thời điểm kiểm tra (mặc định là UTC now)</param>
    /// <returns>True nếu hợp lệ, False nếu không hợp lệ</returns>
    public bool IsValid(int? targetPlanId = null, DateTime? checkTime = null)
    {
        var now = checkTime ?? DateTime.UtcNow;

        // 1. Kiểm tra trạng thái kích hoạt và xóa mềm
        if (IsDeleted || !IsActive)
            return false;

        // 2. Kiểm tra khoảng thời gian hiệu lực
        if (now < StartDate || now > EndDate)
            return false;

        // 3. Kiểm tra gói dịch vụ áp dụng (nếu promotion chỉ dành riêng cho 1 plan cụ thể)
        if (ServicePlanId.HasValue && targetPlanId.HasValue && ServicePlanId.Value != targetPlanId.Value)
            return false;

        return true;
    }

    /// <summary>
    /// Tính toán số tiền được giảm giá và giá cuối cùng sau khi áp dụng mã.
    /// Luồng hoạt động:
    /// 1. Xác thực tính hợp lệ qua IsValid(). Nếu không hợp lệ ném DomainException.
    /// 2. Tính DiscountAmount = originalPrice * (DiscountPercent / 100).
    /// 3. Tính FinalPrice = originalPrice - DiscountAmount.
    /// </summary>
    /// <param name="originalPrice">Giá gốc dịch vụ</param>
    /// <param name="targetPlanId">ID gói dịch vụ đang mua</param>
    /// <returns>Tuple chứa (DiscountAmount, FinalPrice)</returns>
    public (decimal DiscountAmount, decimal FinalPrice) CalculateDiscount(decimal originalPrice, int? targetPlanId = null)
    {
        if (originalPrice < 0)
            throw new DomainException("Giá gốc không được nhỏ hơn 0.");

        if (!IsValid(targetPlanId))
            throw new DomainException($"Mã khuyến mãi '{Code}' không hợp lệ hoặc đã hết hạn.");

        var discountFactor = (decimal)(DiscountPercent / 100.0);
        var discountAmount = Math.Round(originalPrice * discountFactor, 0); // Làm tròn số tiền VND
        var finalPrice = Math.Max(0, originalPrice - discountAmount);

        return (discountAmount, finalPrice);
    }

    /// <summary>
    /// Kích hoạt hoặc Hủy kích hoạt mã khuyến mãi
    /// </summary>
    public void ToggleActive(bool isActive)
    {
        IsActive = isActive;
        UpdatedAt = DateTime.UtcNow;
    }
}
