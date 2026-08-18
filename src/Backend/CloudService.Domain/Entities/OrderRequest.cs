using CloudService.Domain.Common;

namespace CloudService.Domain.Entities;

public class OrderRequest : BaseEntity
{
    public int ServicePlanId { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public int Quantity { get; set; } = 1;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string BillingCycle { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Pending";
    public string? Note { get; set; }

    public virtual ServicePlan? ServicePlan { get; set; }
    public virtual AppUser? User { get; set; }
}