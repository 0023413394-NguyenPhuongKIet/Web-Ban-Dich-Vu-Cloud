namespace CloudService.Application.Interfaces;

/// <summary>
/// Unit of Work — quản lý transaction, đảm bảo tất cả thay đổi được commit cùng lúc.
/// </summary>
public interface IUnitOfWork : IDisposable
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
