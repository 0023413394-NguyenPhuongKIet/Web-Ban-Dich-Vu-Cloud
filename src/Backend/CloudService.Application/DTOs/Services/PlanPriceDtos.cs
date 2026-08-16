namespace CloudService.Application.DTOs.Services;

/// <summary>
/// DTO trả về thông tin giá gói dịch vụ.
/// </summary>
public class PlanPriceDto
{
    public int Id { get; set; }
    public int ServicePlanId { get; set; }
    public string BillingCycle { get; set; } = string.Empty;
    public decimal OriginalPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public DateTime EffectiveDate { get; set; }
    public bool IsCurrent { get; set; }
}

/// <summary>
/// DTO thiết lập giá mới cho gói dịch vụ.
/// </summary>
public class SetPlanPriceDto
{
    public string BillingCycle { get; set; } = string.Empty; // "Monthly" hoặc "Yearly"
    public decimal OriginalPrice { get; set; }
    public decimal SellingPrice { get; set; }
}
