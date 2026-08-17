namespace CloudService.Application.DTOs.Promotions;

/// <summary>
/// DTO hiển thị thông tin khuyến mãi trả về cho Client
/// </summary>
public class PromotionDto
{
    public int Id { get; set; }
    public int? ServicePlanId { get; set; }
    public string? ServicePlanName { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public double DiscountPercent { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public bool IsCurrentlyValid { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO yêu cầu tạo mới mã khuyến mãi (Admin/Editor)
/// </summary>
public class CreatePromotionDto
{
    /// <summary>
    /// ID gói dịch vụ áp dụng (null nếu áp dụng cho tất cả dịch vụ)
    /// </summary>
    public int? ServicePlanId { get; set; }

    /// <summary>
    /// Mã giảm giá (viết hoa tự động, ví dụ: SUMMER2026)
    /// </summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Tiêu đề chương trình khuyến mãi
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Tỷ lệ giảm giá (từ 0.1% đến 100%)
    /// </summary>
    public double DiscountPercent { get; set; }

    /// <summary>
    /// Ngày bắt đầu
    /// </summary>
    public DateTime StartDate { get; set; }

    /// <summary>
    /// Ngày kết thúc
    /// </summary>
    public DateTime EndDate { get; set; }

    /// <summary>
    /// Trạng thái kích hoạt (mặc định true)
    /// </summary>
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// DTO yêu cầu cập nhật thông tin khuyến mãi
/// </summary>
public class UpdatePromotionDto
{
    public int? ServicePlanId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public double DiscountPercent { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
}

/// <summary>
/// DTO kiểm tra và áp dụng mã khuyến mãi (Client/Khách hàng)
/// </summary>
public class ApplyPromotionRequestDto
{
    /// <summary>
    /// Mã coupon người dùng nhập
    /// </summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Giá gốc của dịch vụ trước khi giảm
    /// </summary>
    public decimal OriginalPrice { get; set; }

    /// <summary>
    /// ID gói dịch vụ người dùng đang muốn mua
    /// </summary>
    public int? ServicePlanId { get; set; }
}

/// <summary>
/// DTO kết quả áp dụng mã khuyến mãi trả về cho Client
/// </summary>
public class ApplyPromotionResultDto
{
    public bool IsSuccess { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public double DiscountPercent { get; set; }
    public decimal OriginalPrice { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalPrice { get; set; }
}
