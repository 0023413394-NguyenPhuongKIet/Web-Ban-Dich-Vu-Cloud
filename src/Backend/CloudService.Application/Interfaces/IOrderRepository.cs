using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudService.Domain.Entities;

namespace CloudService.Application.Interfaces;

public interface IOrderRepository
{
    Task<OrderRequest?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<OrderRequest?> GetOrderWithDetailsAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<OrderRequest>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<OrderRequest>> GetOrdersByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task AddAsync(OrderRequest entity, CancellationToken cancellationToken = default);
    void Update(OrderRequest entity);
    void Delete(OrderRequest entity);
}