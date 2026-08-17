using CloudService.Domain.Common;

namespace CloudService.Domain.Entities;

/// <summary>
/// Khuyến mãi / Mã giảm giá trong hệ thống Cloud Service.
/// </summary>
public class Promotion : BaseEntity
{
    /// <summary>Mã khuyến mãi (unique, dùng để tra cứu).</summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>Mô tả chi tiết khuyến mãi.</summary>
    public string? Description { get; set; }

    /// <summary>Phần trăm giảm giá (0–100).</summary>
    public double DiscountPercent { get; set; }

    /// <summary>Giảm tối đa (VND). Null = không giới hạn.</summary>
    public decimal? MaxDiscountAmount { get; set; }

    /// <summary>Ngày bắt đầu hiệu lực.</summary>
    public DateTime StartDate { get; set; }

    /// <summary>Ngày kết thúc hiệu lực.</summary>
    public DateTime EndDate { get; set; }

    /// <summary>Trạng thái kích hoạt.</summary>
    public bool IsActive { get; set; } = true;
}
