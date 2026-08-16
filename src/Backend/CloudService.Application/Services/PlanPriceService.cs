using CloudService.Application.DTOs.Services;
using CloudService.Application.Interfaces;
using CloudService.Domain.Entities;
using CloudService.Domain.Exceptions;

namespace CloudService.Application.Services;

/// <summary>
/// Service xử lý nghiệp vụ cho Giá gói dịch vụ (lịch sử giá).
/// </summary>
public class PlanPriceService
{
    private readonly IPlanPriceRepository _priceRepo;
    private readonly IServicePlanRepository _planRepo;
    private readonly IUnitOfWork _unitOfWork;

    public PlanPriceService(
        IPlanPriceRepository priceRepo,
        IServicePlanRepository planRepo,
        IUnitOfWork unitOfWork)
    {
        _priceRepo = priceRepo;
        _planRepo = planRepo;
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Thiết lập giá mới cho gói dịch vụ. Bản ghi cũ chuyển IsCurrent=false.
    /// </summary>
    public async Task<PlanPriceDto> SetPriceAsync(int servicePlanId, SetPlanPriceDto dto, CancellationToken cancellationToken = default)
    {
        // Validate plan tồn tại
        if (!await _planRepo.ExistsAsync(servicePlanId, cancellationToken))
            throw new NotFoundException(nameof(ServicePlan), servicePlanId);

        // Tìm bản ghi giá hiện hành cùng (PlanId, BillingCycle), đánh dấu không còn hiện hành
        var currentPrice = await _priceRepo.GetCurrentPriceAsync(servicePlanId, dto.BillingCycle, cancellationToken);
        if (currentPrice != null)
        {
            currentPrice.MarkAsNotCurrent();
            _priceRepo.Update(currentPrice);
        }

        // Tạo bản ghi giá mới (domain validation sẽ chạy trong factory method)
        var newPrice = PlanPrice.Create(servicePlanId, dto.BillingCycle, dto.OriginalPrice, dto.SellingPrice);

        await _priceRepo.AddAsync(newPrice, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(newPrice);
    }

    /// <summary>
    /// Lấy lịch sử giá của một gói dịch vụ.
    /// </summary>
    public async Task<List<PlanPriceDto>> GetPriceHistoryAsync(int servicePlanId, CancellationToken cancellationToken = default)
    {
        if (!await _planRepo.ExistsAsync(servicePlanId, cancellationToken))
            throw new NotFoundException(nameof(ServicePlan), servicePlanId);

        var prices = await _priceRepo.GetPriceHistoryAsync(servicePlanId, cancellationToken);
        return prices.Select(MapToDto).ToList();
    }

    private static PlanPriceDto MapToDto(PlanPrice entity)
    {
        return new PlanPriceDto
        {
            Id = entity.Id,
            ServicePlanId = entity.ServicePlanId,
            BillingCycle = entity.BillingCycle,
            OriginalPrice = entity.OriginalPrice,
            SellingPrice = entity.SellingPrice,
            EffectiveDate = entity.EffectiveDate,
            IsCurrent = entity.IsCurrent
        };
    }
}
