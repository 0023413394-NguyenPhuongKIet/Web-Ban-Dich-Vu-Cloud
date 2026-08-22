namespace CloudService.Application.DTOs.Order
{
    public class CreateOrderRequest
    {
        public int ServicePlanId { get; set; }
        public int Quantity { get; set; } = 1;
        public string? Note { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string BillingCycle { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
    }
}