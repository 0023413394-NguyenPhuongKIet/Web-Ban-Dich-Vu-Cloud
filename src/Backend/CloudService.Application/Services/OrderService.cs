using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CloudService.Application.DTOs.Order;
using CloudService.Application.Interfaces;
using CloudService.Domain.Entities;
using CloudService.Domain.Exceptions;

namespace CloudService.Application.Services;

public class OrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly IServicePlanRepository _servicePlanRepository;
    private readonly IPlanPriceRepository _planPriceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public OrderService(
        IOrderRepository orderRepository,
        IServicePlanRepository servicePlanRepository,
        IPlanPriceRepository planPriceRepository,
        IUnitOfWork unitOfWork)
    {
        _orderRepository = orderRepository;
        _servicePlanRepository = servicePlanRepository;
        _planPriceRepository = planPriceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request, Guid userId)
    {
        if (string.IsNullOrWhiteSpace(request.CustomerName))
            throw new DomainException("Tên khách hàng không được để trống.");

        if (string.IsNullOrWhiteSpace(request.CustomerEmail))
            throw new DomainException("Email khách hàng không được để trống.");

        if (!IsValidEmail(request.CustomerEmail))
            throw new DomainException("Email không đúng định dạng.");

        if (string.IsNullOrWhiteSpace(request.CustomerPhone))
            throw new DomainException("Số điện thoại không được để trống.");

        if (!IsValidPhone(request.CustomerPhone))
            throw new DomainException("Số điện thoại không đúng định dạng.");

        if (string.IsNullOrWhiteSpace(request.BillingCycle))
            throw new DomainException("Chu kỳ thanh toán không được để trống.");

        if (request.BillingCycle != "monthly" && request.BillingCycle != "yearly")
            throw new DomainException("Chu kỳ thanh toán chỉ được chọn 'monthly' hoặc 'yearly'.");

        if (request.Quantity <= 0)
            throw new DomainException("Số lượng phải lớn hơn 0.");

        var plan = await _servicePlanRepository.GetByIdAsync(request.ServicePlanId);
        if (plan == null)
            throw new NotFoundException(nameof(ServicePlan), request.ServicePlanId);

        if (!plan.IsActive)
            throw new DomainException($"Gói dịch vụ '{plan.Name}' hiện đang không khả dụng.");

        var planPrice = await _planPriceRepository.GetCurrentPriceAsync(
            request.ServicePlanId,
            request.BillingCycle);

        if (planPrice == null)
            throw new DomainException($"Không tìm thấy giá cho gói dịch vụ '{plan.Name}' với chu kỳ '{request.BillingCycle}'.");

        var totalAmount = planPrice.SellingPrice * request.Quantity;
        var orderCode = GenerateOrderCode();

        var order = new OrderRequest
        {
            ServicePlanId = request.ServicePlanId,
            OrderCode = orderCode,
            UserId = userId,
            Quantity = request.Quantity,
            TotalAmount = totalAmount,
            Status = "Pending",
            Note = request.Note,
            CustomerName = request.CustomerName.Trim(),
            CustomerEmail = request.CustomerEmail.Trim(),
            CustomerPhone = request.CustomerPhone.Trim(),
            CompanyName = request.CompanyName?.Trim() ?? string.Empty,
            BillingCycle = request.BillingCycle,
            CreatedAt = DateTime.UtcNow
        };

        await _orderRepository.AddAsync(order);
        await _unitOfWork.SaveChangesAsync();

        return MapToResponse(order, plan.Name);
    }

    public async Task<OrderResponse> GetOrderByIdAsync(int id)
    {
        var order = await _orderRepository.GetOrderWithDetailsAsync(id);
        if (order == null)
            throw new NotFoundException(nameof(OrderRequest), id);

        return MapToResponse(order, order.ServicePlan?.Name ?? "Unknown");
    }

    public async Task<IEnumerable<OrderResponse>> GetOrdersByUserAsync(Guid userId)
    {
        var orders = await _orderRepository.GetOrdersByUserIdAsync(userId);
        return orders.Select(o => MapToResponse(o, o.ServicePlan?.Name ?? "Unknown"));
    }

    public async Task<IEnumerable<OrderResponse>> GetAllOrdersAsync()
    {
        var orders = await _orderRepository.GetAllAsync();
        return orders.Select(o => MapToResponse(o, o.ServicePlan?.Name ?? "Unknown"));
    }

    public async Task<bool> UpdateOrderStatusAsync(int id, UpdateOrderStatusRequest request)
    {
        var order = await _orderRepository.GetByIdAsync(id);
        if (order == null)
            throw new NotFoundException(nameof(OrderRequest), id);

        var validStatuses = new[] { "Pending", "Paid", "Active", "Cancelled", "Expired" };
        if (!validStatuses.Contains(request.Status))
            throw new DomainException($"Trạng thái '{request.Status}' không hợp lệ.");

        if (order.Status == "Cancelled")
            throw new DomainException("Đơn hàng đã bị hủy, không thể thay đổi trạng thái.");

        if (order.Status == "Paid" && request.Status == "Pending")
            throw new DomainException("Không thể chuyển đơn hàng đã thanh toán về trạng thái chờ xử lý.");

        if (order.Status == "Active" && request.Status != "Expired")
            throw new DomainException("Đơn hàng đang hoạt động chỉ có thể chuyển sang trạng thái hết hạn.");

        order.Status = request.Status;
        order.UpdatedAt = DateTime.UtcNow;
        _orderRepository.Update(order);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CancelOrderAsync(int id)
    {
        var order = await _orderRepository.GetByIdAsync(id);
        if (order == null)
            throw new NotFoundException(nameof(OrderRequest), id);

        if (order.Status == "Cancelled")
            throw new DomainException("Đơn hàng đã được hủy trước đó.");

        if (order.Status == "Paid")
            throw new DomainException("Không thể hủy đơn hàng đã thanh toán. Vui lòng liên hệ bộ phận hỗ trợ.");

        if (order.Status == "Active")
            throw new DomainException("Không thể hủy đơn hàng đang hoạt động. Vui lòng liên hệ bộ phận hỗ trợ.");

        order.Status = "Cancelled";
        order.UpdatedAt = DateTime.UtcNow;
        _orderRepository.Update(order);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    private string GenerateOrderCode()
    {
        var date = DateTime.Now.ToString("yyyyMMdd");
        var random = new Random().Next(1000, 9999);
        return $"ORD-{date}-{random}";
    }

    private bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }

    private bool IsValidPhone(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return false;
        phone = phone.Trim();
        return phone.Length >= 10 && phone.Length <= 11 && phone.All(char.IsDigit);
    }

    private OrderResponse MapToResponse(OrderRequest order, string planName)
    {
        return new OrderResponse
        {
            Id = order.Id,
            OrderCode = order.OrderCode,
            ServicePlanName = planName,
            Quantity = order.Quantity,
            TotalAmount = order.TotalAmount,
            Status = order.Status,
            CreatedAt = order.CreatedAt,
            Note = order.Note,
            CustomerName = order.CustomerName,
            CustomerEmail = order.CustomerEmail,
            CustomerPhone = order.CustomerPhone,
            BillingCycle = order.BillingCycle
        };
    }
}