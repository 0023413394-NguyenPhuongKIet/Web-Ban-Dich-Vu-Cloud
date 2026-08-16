using CloudService.Domain.Common;
using CloudService.Domain.Exceptions;

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

    /// <summary>
    /// Soft-delete: chỉ cho phép vô hiệu hóa khi không còn ServicePlan nào đang active.
    /// </summary>
    public void Deactivate()
    {
        if (ServicePlans.Any(p => p.IsActive && !p.IsDeleted))
            throw new DomainException("Không thể xóa danh mục còn gói dịch vụ đang hoạt động. Hãy xóa hoặc vô hiệu hóa các gói dịch vụ trước.");

        IsActive = false;
    }

    /// <summary>
    /// Kích hoạt lại danh mục.
    /// </summary>
    public void Activate()
    {
        IsActive = true;
    }
}
