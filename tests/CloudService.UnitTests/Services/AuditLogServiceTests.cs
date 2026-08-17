using CloudService.Application.DTOs.AuditLog;
using CloudService.Application.Interfaces;
using CloudService.Application.Services;
using CloudService.Domain.Entities;
using Moq;
using Xunit;

namespace CloudService.UnitTests.Services;

public class AuditLogServiceTests
{
    private readonly Mock<IAuditLogRepository> _auditLogRepoMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly AuditLogService _service;

    public AuditLogServiceTests()
    {
        _auditLogRepoMock = new Mock<IAuditLogRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _service = new AuditLogService(_auditLogRepoMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task LogAsync_ShouldSaveAuditLog()
    {
        // Arrange
        var dto = new CreateAuditLogDto
        {
            UserId = 1,
            Action = "CREATE",
            EntityName = "ServicePlan",
            EntityId = "10",
            Details = "Tạo mới gói Cloud VPS Standard",
            IpAddress = "192.168.1.1"
        };

        // Act
        await _service.LogAsync(dto);

        // Assert
        _auditLogRepoMock.Verify(r => r.AddAsync(It.Is<AuditLog>(l =>
            l.UserId == dto.UserId &&
            l.Action == dto.Action &&
            l.EntityName == dto.EntityName &&
            l.IpAddress == dto.IpAddress), It.IsAny<CancellationToken>()), Times.Once);

        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetAuditLogsAsync_ShouldReturnPagedResult()
    {
        // Arrange
        var query = new AuditLogQueryDto { PageNumber = 1, PageSize = 10 };
        var logs = new List<AuditLog>
        {
            new AuditLog { Id = 1, Action = "LOGIN", EntityName = "User", IpAddress = "127.0.0.1", CreatedAt = DateTime.UtcNow }
        };

        _auditLogRepoMock.Setup(r => r.GetPagedAsync(query, It.IsAny<CancellationToken>()))
            .ReturnsAsync((logs, 1));

        // Act
        var result = await _service.GetAuditLogsAsync(query);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.TotalCount);
        Assert.Single(result.Items);
        Assert.Equal("LOGIN", result.Items[0].Action);
    }
}
