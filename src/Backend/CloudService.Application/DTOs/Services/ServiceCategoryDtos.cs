namespace CloudService.Application.DTOs.Services;

/// <summary>
/// DTO trả về thông tin danh mục dịch vụ.
/// </summary>
public class ServiceCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconClass { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public int PlanCount { get; set; }
}

/// <summary>
/// DTO tạo mới danh mục dịch vụ.
/// </summary>
public class CreateServiceCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconClass { get; set; }
    public int DisplayOrder { get; set; }
}

/// <summary>
/// DTO cập nhật danh mục dịch vụ.
/// </summary>
public class UpdateServiceCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconClass { get; set; }
    public int DisplayOrder { get; set; }
}
