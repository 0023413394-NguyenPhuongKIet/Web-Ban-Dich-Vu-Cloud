namespace CloudService.Application.DTOs.Services;

/// <summary>
/// DTO trả về thông tin gói dịch vụ.
/// </summary>
public class ServicePlanDto
{
    public int Id { get; set; }
    public int ServiceCategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string SpecsJson { get; set; } = string.Empty;
    public string QrCodeUrl { get; set; } = string.Empty;
    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; }
    public List<PlanPriceDto> CurrentPrices { get; set; } = new();
}

/// <summary>
/// DTO tạo mới gói dịch vụ.
/// </summary>
public class CreateServicePlanDto
{
    public int ServiceCategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string SpecsJson { get; set; } = string.Empty;
    public bool IsFeatured { get; set; } = false;
}

/// <summary>
/// DTO cập nhật gói dịch vụ.
/// </summary>
public class UpdateServicePlanDto
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string SpecsJson { get; set; } = string.Empty;
    public bool IsFeatured { get; set; }
}
