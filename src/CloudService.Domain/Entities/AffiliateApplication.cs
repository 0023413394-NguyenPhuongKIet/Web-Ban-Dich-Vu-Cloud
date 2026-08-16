using CloudService.Domain.Common;

namespace CloudService.Domain.Entities;

public class AffiliateApplication : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string WebsiteUrl { get; set; } = string.Empty;
    public string PromotionPlan { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
}
