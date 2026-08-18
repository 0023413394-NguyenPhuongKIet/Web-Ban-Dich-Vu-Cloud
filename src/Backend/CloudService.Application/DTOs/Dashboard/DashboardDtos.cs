namespace CloudService.Application.DTOs.Dashboard;

/// <summary>
/// DTO tổng hợp thông tin Thống kê Dashboard.
/// </summary>
public class DashboardSummaryDto
{
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public Dictionary<string, int> OrdersByStatus { get; set; } = new();
    public int TotalUsers { get; set; }
    public int TotalActiveServicePlans { get; set; }
    public int TotalNewsArticles { get; set; }
    public int TotalAffiliateApplications { get; set; }
    public List<RecentOrderDto> RecentOrders { get; set; } = new();
    public List<MonthlyRevenueDto> MonthlyRevenue { get; set; } = new();
}

/// <summary>
/// DTO thể hiện đơn hàng gần đây trong Dashboard.
/// </summary>
public class RecentOrderDto
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string ServicePlanName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO doanh thu theo tháng.
/// </summary>
public class MonthlyRevenueDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal Revenue { get; set; }
    public int OrderCount { get; set; }
}
