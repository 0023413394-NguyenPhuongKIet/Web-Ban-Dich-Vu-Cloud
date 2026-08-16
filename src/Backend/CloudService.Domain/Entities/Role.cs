using CloudService.Domain.Common;

namespace CloudService.Domain.Entities;

public class Role : BaseEntity
{
    public string Name { get; set; } = string.Empty; // Admin, Editor
    public string Description { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<AppUser> Users { get; set; } = new List<AppUser>();
}
