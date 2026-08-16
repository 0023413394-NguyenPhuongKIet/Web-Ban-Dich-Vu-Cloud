using CloudService.Domain.Common;
using CloudService.Domain.Exceptions;

namespace CloudService.Domain.Entities;

public class PlanPrice : BaseEntity
{
    public int ServicePlanId { get; set; }
    public string BillingCycle { get; set; } = string.Empty; // Monthly, Yearly
    public decimal OriginalPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public bool IsDefault { get; set; } = false;
    public DateTime EffectiveDate { get; set; } = DateTime.UtcNow;
    public bool IsCurrent { get; set; } = true;

    // Navigation properties
    public ServicePlan ServicePlan { get; set; } = null!;

    /// <summary>
    /// Factory method tạo PlanPrice mới với validation giá không âm.
    /// </summary>
    public static PlanPrice Create(int servicePlanId, string billingCycle, decimal originalPrice, decimal sellingPrice)
    {
        if (originalPrice < 0)
            throw new DomainException("Giá gốc không được phép âm.");
        if (sellingPrice < 0)
            throw new DomainException("Giá bán không được phép âm.");
        if (string.IsNullOrWhiteSpace(billingCycle))
            throw new DomainException("Chu kỳ thanh toán không được để trống.");

        return new PlanPrice
        {
            ServicePlanId = servicePlanId,
            BillingCycle = billingCycle,
            OriginalPrice = originalPrice,
            SellingPrice = sellingPrice,
            EffectiveDate = DateTime.UtcNow,
            IsCurrent = true
        };
    }

    /// <summary>
    /// Đánh dấu bản ghi giá này không còn hiện hành.
    /// </summary>
    public void MarkAsNotCurrent()
    {
        IsCurrent = false;
    }
}
