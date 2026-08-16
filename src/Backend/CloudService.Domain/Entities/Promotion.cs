using CloudService.Domain.Common;

namespace CloudService.Domain.Entities;

public class Promotion : BaseEntity
{
    public int? ServicePlanId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public double DiscountPercent { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ServicePlan? ServicePlan { get; set; }
}
