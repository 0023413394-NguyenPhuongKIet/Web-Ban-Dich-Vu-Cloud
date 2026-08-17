using CloudService.Application.DTOs.Promotions;
using CloudService.Application.Interfaces;
using CloudService.Domain.Entities;
using CloudService.Domain.Exceptions;

namespace CloudService.Application.Services;

/// <summary>
/// Service xử lý toàn bộ nghiệp vụ Quản lý và Áp dụng Mã Khuyến Mãi (Promotion)
/// </summary>
public class PromotionService : IPromotionService
{
    private readonly IPromotionRepository _promotionRepo;
    private readonly IServicePlanRepository _servicePlanRepo;
    private readonly IUnitOfWork _unitOfWork;

    public PromotionService(
        IPromotionRepository promotionRepo,
        IServicePlanRepository servicePlanRepo,
        IUnitOfWork unitOfWork)
    {
        _promotionRepo = promotionRepo;
        _servicePlanRepo = servicePlanRepo;
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Lấy toàn bộ danh sách khuyến mãi
    /// </summary>
    public async Task<IEnumerable<PromotionDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var promotions = await _promotionRepo.GetAllAsync(cancellationToken);
        return promotions.Select(MapToDto);
    }

    /// <summary>
    /// Lấy danh sách khuyến mãi đang có hiệu lực tại thời điểm hiện tại
    /// </summary>
    public async Task<IEnumerable<PromotionDto>> GetActivePromotionsAsync(int? servicePlanId = null, CancellationToken cancellationToken = default)
    {
        var promotions = await _promotionRepo.GetActivePromotionsAsync(servicePlanId, cancellationToken);
        return promotions.Select(MapToDto);
    }

    /// <summary>
    /// Lấy chi tiết khuyến mãi theo Id
    /// </summary>
    public async Task<PromotionDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var promo = await _promotionRepo.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Promotion), id);

        return MapToDto(promo);
    }

    /// <summary>
    /// Tạo mới một mã khuyến mãi
    /// </summary>
    public async Task<PromotionDto> CreateAsync(CreatePromotionDto dto, CancellationToken cancellationToken = default)
    {
        var code = dto.Code.Trim().ToUpperInvariant();

        if (string.IsNullOrWhiteSpace(code))
            throw new DomainException("Mã khuyến mãi không được để trống.");

        if (dto.DiscountPercent <= 0 || dto.DiscountPercent > 100)
            throw new DomainException("Tỷ lệ giảm giá phải lớn hơn 0% và không vượt quá 100%.");

        if (dto.EndDate <= dto.StartDate)
            throw new DomainException("Ngày kết thúc phải sau ngày bắt đầu khuyến mãi.");

        if (await _promotionRepo.CodeExistsAsync(code, cancellationToken: cancellationToken))
            throw new DomainException($"Mã khuyến mãi '{code}' đã tồn tại trong hệ thống.");

        if (dto.ServicePlanId.HasValue)
        {
            var plan = await _servicePlanRepo.GetByIdAsync(dto.ServicePlanId.Value, cancellationToken);
            if (plan == null)
                throw new NotFoundException(nameof(ServicePlan), dto.ServicePlanId.Value);
        }

        var promo = new Promotion
        {
            ServicePlanId = dto.ServicePlanId,
            Code = code,
            Title = dto.Title.Trim(),
            DiscountPercent = dto.DiscountPercent,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = dto.IsActive
        };

        await _promotionRepo.AddAsync(promo, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(promo);
    }

    /// <summary>
    /// Cập nhật thông tin mã khuyến mãi
    /// </summary>
    public async Task<PromotionDto> UpdateAsync(int id, UpdatePromotionDto dto, CancellationToken cancellationToken = default)
    {
        var promo = await _promotionRepo.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Promotion), id);

        var code = dto.Code.Trim().ToUpperInvariant();

        if (string.IsNullOrWhiteSpace(code))
            throw new DomainException("Mã khuyến mãi không được để trống.");

        if (dto.DiscountPercent <= 0 || dto.DiscountPercent > 100)
            throw new DomainException("Tỷ lệ giảm giá phải lớn hơn 0% và không vượt quá 100%.");

        if (dto.EndDate <= dto.StartDate)
            throw new DomainException("Ngày kết thúc phải sau ngày bắt đầu khuyến mãi.");

        if (await _promotionRepo.CodeExistsAsync(code, excludeId: id, cancellationToken: cancellationToken))
            throw new DomainException($"Mã khuyến mãi '{code}' đã tồn tại trong hệ thống.");

        if (dto.ServicePlanId.HasValue)
        {
            var plan = await _servicePlanRepo.GetByIdAsync(dto.ServicePlanId.Value, cancellationToken);
            if (plan == null)
                throw new NotFoundException(nameof(ServicePlan), dto.ServicePlanId.Value);
        }

        promo.ServicePlanId = dto.ServicePlanId;
        promo.Code = code;
        promo.Title = dto.Title.Trim();
        promo.DiscountPercent = dto.DiscountPercent;
        promo.StartDate = dto.StartDate;
        promo.EndDate = dto.EndDate;
        promo.IsActive = dto.IsActive;

        _promotionRepo.Update(promo);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(promo);
    }

    /// <summary>
    /// Xóa khuyến mãi (Xóa mềm - Soft Delete)
    /// </summary>
    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var promo = await _promotionRepo.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Promotion), id);

        _promotionRepo.Delete(promo);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Bật/Tắt trạng thái kích hoạt của khuyến mãi
    /// </summary>
    public async Task<PromotionDto> ToggleActiveAsync(int id, CancellationToken cancellationToken = default)
    {
        var promo = await _promotionRepo.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Promotion), id);

        promo.ToggleActive(!promo.IsActive);
        _promotionRepo.Update(promo);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(promo);
    }

    /// <summary>
    /// Xác thực và áp dụng mã khuyến mãi cho khách mua dịch vụ
    /// </summary>
    public async Task<ApplyPromotionResultDto> ApplyPromotionAsync(ApplyPromotionRequestDto dto, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(dto.Code))
        {
            return new ApplyPromotionResultDto
            {
                IsSuccess = false,
                Message = "Vui lòng nhập mã khuyến mãi.",
                OriginalPrice = dto.OriginalPrice,
                FinalPrice = dto.OriginalPrice
            };
        }

        var code = dto.Code.Trim().ToUpperInvariant();
        var promo = await _promotionRepo.GetByCodeAsync(code, cancellationToken);

        if (promo == null)
        {
            return new ApplyPromotionResultDto
            {
                IsSuccess = false,
                Message = $"Mã khuyến mãi '{code}' không tồn tại.",
                OriginalPrice = dto.OriginalPrice,
                FinalPrice = dto.OriginalPrice
            };
        }

        if (!promo.IsValid(dto.ServicePlanId))
        {
            string reason = "Mã khuyến mãi đã hết hạn hoặc không áp dụng cho gói dịch vụ này.";
            if (promo.IsDeleted || !promo.IsActive)
                reason = "Mã khuyến mãi hiện đang bị tạm khóa.";
            else if (DateTime.UtcNow < promo.StartDate)
                reason = $"Mã khuyến mãi chỉ có hiệu lực từ ngày {promo.StartDate:dd/MM/yyyy}.";
            else if (DateTime.UtcNow > promo.EndDate)
                reason = $"Mã khuyến mãi đã hết hạn từ ngày {promo.EndDate:dd/MM/yyyy}.";
            else if (promo.ServicePlanId.HasValue && dto.ServicePlanId.HasValue && promo.ServicePlanId != dto.ServicePlanId)
                reason = "Mã khuyến mãi này không áp dụng cho gói dịch vụ bạn đã chọn.";

            return new ApplyPromotionResultDto
            {
                IsSuccess = false,
                Message = reason,
                Code = promo.Code,
                DiscountPercent = promo.DiscountPercent,
                OriginalPrice = dto.OriginalPrice,
                FinalPrice = dto.OriginalPrice
            };
        }

        var (discountAmount, finalPrice) = promo.CalculateDiscount(dto.OriginalPrice, dto.ServicePlanId);

        return new ApplyPromotionResultDto
        {
            IsSuccess = true,
            Message = $"Áp dụng mã giảm giá thành công! Bạn được giảm {promo.DiscountPercent}%.",
            Code = promo.Code,
            DiscountPercent = promo.DiscountPercent,
            OriginalPrice = dto.OriginalPrice,
            DiscountAmount = discountAmount,
            FinalPrice = finalPrice
        };
    }

    private static PromotionDto MapToDto(Promotion promo)
    {
        return new PromotionDto
        {
            Id = promo.Id,
            ServicePlanId = promo.ServicePlanId,
            ServicePlanName = promo.ServicePlan?.Name,
            Code = promo.Code,
            Title = promo.Title,
            DiscountPercent = promo.DiscountPercent,
            StartDate = promo.StartDate,
            EndDate = promo.EndDate,
            IsActive = promo.IsActive,
            IsCurrentlyValid = promo.IsValid(),
            CreatedAt = promo.CreatedAt
        };
    }
}
