using System;

namespace CloudService.Application.DTOs.Order
{
    public class OrderResponse
    {
        public int Id { get; set; }
        public string OrderCode { get; set; } = string.Empty;
        public string ServicePlanName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string? Note { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string BillingCycle { get; set; } = string.Empty;
    }
}