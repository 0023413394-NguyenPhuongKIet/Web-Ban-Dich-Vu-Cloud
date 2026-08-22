using CloudService.Application.DTOs.Order;
using CloudService.Application.Interfaces;
using CloudService.Application.Services;
using CloudService.Domain.Entities;
using CloudService.Domain.Exceptions;
using Moq;
using Xunit;

namespace CloudService.UnitTests.Application;

/// <summary>
/// Unit tests cho OrderService (Application Layer).
/// Kiểm tra validation đầu vào và luồng xử lý tạo đơn hàng.
/// </summary>
public class OrderServiceTests
{
    private readonly Mock<IOrderRepository> _orderRepoMock;
    private readonly Mock<IServicePlanRepository> _planRepoMock;
    private readonly Mock<IPlanPriceRepository> _priceRepoMock;
    private readonly Mock<IUnitOfWork> _uowMock;
    private readonly OrderService _sut;

    public OrderServiceTests()
    {
        _orderRepoMock = new Mock<IOrderRepository>();
        _planRepoMock = new Mock<IServicePlanRepository>();
        _priceRepoMock = new Mock<IPlanPriceRepository>();
        _uowMock = new Mock<IUnitOfWork>();

        _sut = new OrderService(
            _orderRepoMock.Object,
            _planRepoMock.Object,
            _priceRepoMock.Object,
            _uowMock.Object);
    }

    // =====================================================
    // Helpers
    // =====================================================
    private static CreateOrderRequest BuildValidRequest() => new()
    {
        ServicePlanId = 1,
        CustomerName = "Nguyễn Văn A",
        CustomerEmail = "nguyenvana@gmail.com",
        CustomerPhone = "0901234567",
        BillingCycle = "monthly",
        Quantity = 1,
        TotalAmount = 99_000m
    };

    private static ServicePlan BuildActivePlan() => new()
    {
        Id = 1,
        Name = "Cloud Basic",
        IsActive = true,
        Code = "BASIC"
    };

    // =====================================================
    // TC-15: Tạo đơn hàng thành công
    // =====================================================

    /// <summary>TC-15: Đầu vào hợp lệ → CreateOrderAsync trả về OrderResponse với code ORD-...</summary>
    [Fact]
    public async Task CreateOrderAsync_ValidRequest_ReturnsOrderResponse()
    {
        // Arrange
        var request = BuildValidRequest();
        var plan = BuildActivePlan();

        _planRepoMock
            .Setup(r => r.GetByIdAsync(request.ServicePlanId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(plan);
        _priceRepoMock
            .Setup(r => r.GetCurrentPriceAsync(request.ServicePlanId, It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PlanPrice?)null);
        _orderRepoMock
            .Setup(r => r.AddAsync(It.IsAny<OrderRequest>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _uowMock
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _sut.CreateOrderAsync(request, userId: 1);

        // Assert
        Assert.NotNull(result);
        Assert.StartsWith("ORD-", result.OrderCode);
        Assert.Equal("Pending", result.Status);
        Assert.Equal("Cloud Basic", result.ServicePlanName);
    }

    // =====================================================
    // TC-16 → TC-21: Validation đầu vào
    // =====================================================

    /// <summary>TC-16: CustomerName rỗng → DomainException</summary>
    [Fact]
    public async Task CreateOrderAsync_EmptyCustomerName_ThrowsDomainException()
    {
        var request = BuildValidRequest();
        request.CustomerName = "";

        var ex = await Assert.ThrowsAsync<DomainException>(() => _sut.CreateOrderAsync(request, 1));
        Assert.Contains("Tên khách hàng", ex.Message);
    }

    /// <summary>TC-17: CustomerEmail rỗng → DomainException</summary>
    [Fact]
    public async Task CreateOrderAsync_EmptyEmail_ThrowsDomainException()
    {
        var request = BuildValidRequest();
        request.CustomerEmail = "";

        var ex = await Assert.ThrowsAsync<DomainException>(() => _sut.CreateOrderAsync(request, 1));
        Assert.Contains("Email", ex.Message);
    }

    /// <summary>TC-18: CustomerEmail sai định dạng → DomainException</summary>
    [Fact]
    public async Task CreateOrderAsync_InvalidEmail_ThrowsDomainException()
    {
        var request = BuildValidRequest();
        request.CustomerEmail = "not-an-email";

        var ex = await Assert.ThrowsAsync<DomainException>(() => _sut.CreateOrderAsync(request, 1));
        Assert.Contains("Email", ex.Message);
    }

    /// <summary>TC-19: CustomerPhone rỗng → DomainException</summary>
    [Fact]
    public async Task CreateOrderAsync_EmptyPhone_ThrowsDomainException()
    {
        var request = BuildValidRequest();
        request.CustomerPhone = "";

        var ex = await Assert.ThrowsAsync<DomainException>(() => _sut.CreateOrderAsync(request, 1));
        Assert.Contains("điện thoại", ex.Message);
    }

    /// <summary>TC-20: CustomerPhone chứa ký tự không phải số → DomainException</summary>
    [Fact]
    public async Task CreateOrderAsync_InvalidPhone_ThrowsDomainException()
    {
        var request = BuildValidRequest();
        request.CustomerPhone = "abc-xyz";

        var ex = await Assert.ThrowsAsync<DomainException>(() => _sut.CreateOrderAsync(request, 1));
        Assert.Contains("điện thoại", ex.Message);
    }

    /// <summary>TC-21: Quantity <= 0 → DomainException</summary>
    [Fact]
    public async Task CreateOrderAsync_ZeroQuantity_ThrowsDomainException()
    {
        var request = BuildValidRequest();
        request.Quantity = 0;

        var ex = await Assert.ThrowsAsync<DomainException>(() => _sut.CreateOrderAsync(request, 1));
        Assert.Contains("Số lượng", ex.Message);
    }

    /// <summary>TC-22: ServicePlan không tồn tại → NotFoundException</summary>
    [Fact]
    public async Task CreateOrderAsync_PlanNotFound_ThrowsNotFoundException()
    {
        var request = BuildValidRequest();
        _planRepoMock
            .Setup(r => r.GetByIdAsync(request.ServicePlanId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ServicePlan?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.CreateOrderAsync(request, 1));
    }

    /// <summary>TC-23: ServicePlan không active → DomainException</summary>
    [Fact]
    public async Task CreateOrderAsync_InactivePlan_ThrowsDomainException()
    {
        var request = BuildValidRequest();
        var plan = BuildActivePlan();
        plan.IsActive = false;

        _planRepoMock
            .Setup(r => r.GetByIdAsync(request.ServicePlanId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(plan);

        var ex = await Assert.ThrowsAsync<DomainException>(() => _sut.CreateOrderAsync(request, 1));
        Assert.Contains("không khả dụng", ex.Message);
    }

    // =====================================================
    // TC-24 → TC-25: UpdateOrderStatus & CancelOrder
    // =====================================================

    /// <summary>TC-24: UpdateOrderStatus với trạng thái không hợp lệ → DomainException</summary>
    [Fact]
    public async Task UpdateOrderStatusAsync_InvalidStatus_ThrowsDomainException()
    {
        var order = new OrderRequest { Id = 1, Status = "Pending" };
        _orderRepoMock
            .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        var ex = await Assert.ThrowsAsync<DomainException>(() =>
            _sut.UpdateOrderStatusAsync(1, new UpdateOrderStatusRequest { Status = "InvalidStatus" }));

        Assert.Contains("không hợp lệ", ex.Message);
    }

    /// <summary>TC-25: CancelOrder khi đã cancelled → DomainException (không được hủy 2 lần)</summary>
    [Fact]
    public async Task CancelOrderAsync_AlreadyCancelled_ThrowsDomainException()
    {
        var order = new OrderRequest { Id = 1, Status = "Cancelled" };
        _orderRepoMock
            .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        var ex = await Assert.ThrowsAsync<DomainException>(() => _sut.CancelOrderAsync(1));
        Assert.Contains("đã được hủy", ex.Message);
    }
}
