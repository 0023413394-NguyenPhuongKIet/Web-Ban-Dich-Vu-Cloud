using CloudService.Domain.Common;

namespace CloudService.Domain.Entities;

public class PlanPrice : BaseEntity
{
    public int ServicePlanId { get; set; }
    public string BillingCycle { get; set; } = string.Empty; // Monthly, Yearly
    public decimal OriginalPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public bool IsDefault { get; set; } = false;

    // Navigation properties
    public ServicePlan ServicePlan { get; set; } = null!;
}
