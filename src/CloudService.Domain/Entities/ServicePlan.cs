using CloudService.Domain.Common;

namespace CloudService.Domain.Entities;

public class ServicePlan : BaseEntity
{
    public int ServiceCategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string SpecsJson { get; set; } = string.Empty; // CPU, RAM, SSD, Bandwidth...
    public string QrCodeUrl { get; set; } = string.Empty;
    public bool IsFeatured { get; set; } = false;
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ServiceCategory Category { get; set; } = null!;
    public ICollection<PlanPrice> PlanPrices { get; set; } = new List<PlanPrice>();
    public ICollection<Promotion> Promotions { get; set; } = new List<Promotion>();
    public ICollection<OrderRequest> OrderRequests { get; set; } = new List<OrderRequest>();
}
