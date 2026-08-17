namespace CloudService.Application.DTOs.Affiliate;

/// <summary>
/// DTO trả về thông tin đăng ký Affiliate.
/// </summary>
public class AffiliateApplicationDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string WebsiteUrl { get; set; } = string.Empty;
    public string PromotionPlan { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO gửi form đăng ký Affiliate mới.
/// </summary>
public class RegisterAffiliateDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string WebsiteUrl { get; set; } = string.Empty;
    public string PromotionPlan { get; set; } = string.Empty;
}

/// <summary>
/// DTO duyệt hoặc từ chối đơn đăng ký Affiliate.
/// </summary>
public class UpdateAffiliateStatusDto
{
    public string Status { get; set; } = "Approved"; // Approved, Rejected
    public string? Note { get; set; }
}

/// <summary>
/// DTO truy vấn danh sách đơn đăng ký Affiliate.
/// </summary>
public class AffiliateQueryDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Status { get; set; }
    public string? SearchTerm { get; set; }
}
