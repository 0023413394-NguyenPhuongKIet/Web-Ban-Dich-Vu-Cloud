namespace CloudService.Application.DTOs.Order;

public class TopCustomerDto
{
    public int Rank { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public decimal TotalSpent { get; set; }
    public int OrderCount { get; set; }
    public string Badge { get; set; } = string.Empty;
}
