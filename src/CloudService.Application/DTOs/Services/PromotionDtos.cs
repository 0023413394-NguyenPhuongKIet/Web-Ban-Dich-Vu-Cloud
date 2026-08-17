namespace CloudService.Application.DTOs.Services;

/// <summary>
/// DTO trả về thông tin khuyến mãi.
/// </summary>
public class PromotionDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public double DiscountPercent { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

    /// <summary>Khuyến mãi có đang trong khoảng thời gian hiệu lực không.</summary>
    public bool IsCurrentlyValid => IsActive && DateTime.UtcNow >= StartDate && DateTime.UtcNow <= EndDate;
}

/// <summary>
/// DTO tạo mới khuyến mãi.
/// </summary>
public class CreatePromotionDto
{
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public double DiscountPercent { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// DTO cập nhật khuyến mãi.
/// </summary>
public class UpdatePromotionDto
{
    public string? Description { get; set; }
    public double DiscountPercent { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
}
