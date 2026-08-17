using CloudService.Domain.Common;

namespace CloudService.Domain.Entities;

public class OrderRequest : BaseEntity
{
    public int ServicePlanId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string BillingCycle { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Pending"; // Pending -> Processing -> Completed / Cancelled
    public string? Note { get; set; }

    // Navigation properties
    public ServicePlan ServicePlan { get; set; } = null!;
}
