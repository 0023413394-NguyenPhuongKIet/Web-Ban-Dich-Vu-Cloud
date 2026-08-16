using CloudService.Domain.Common;

namespace CloudService.Domain.Entities;

public class ServiceCategory : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconClass { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<ServicePlan> ServicePlans { get; set; } = new List<ServicePlan>();
}
