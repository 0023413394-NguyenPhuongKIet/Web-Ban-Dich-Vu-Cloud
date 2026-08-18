using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudService.Domain.Entities;
using CloudService.Application.Interfaces;
using CloudService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CloudService.Infrastructure.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly ApplicationDbContext _context;

    public OrderRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OrderRequest?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Set<OrderRequest>()
            .FirstOrDefaultAsync(o => o.Id == id && !o.IsDeleted, cancellationToken);
    }

    public async Task<OrderRequest?> GetOrderWithDetailsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Set<OrderRequest>()
            .Include(o => o.User)
            .Include(o => o.ServicePlan)
            .FirstOrDefaultAsync(o => o.Id == id && !o.IsDeleted, cancellationToken);
    }

    public async Task<IEnumerable<OrderRequest>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Set<OrderRequest>()
            .Include(o => o.ServicePlan)
            .Include(o => o.User)
            .Where(o => !o.IsDeleted)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<OrderRequest>> GetOrdersByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Set<OrderRequest>()
            .Include(o => o.ServicePlan)
            .Where(o => o.UserId == userId && !o.IsDeleted)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(OrderRequest entity, CancellationToken cancellationToken = default)
    {
        await _context.Set<OrderRequest>().AddAsync(entity, cancellationToken);
    }

    public void Update(OrderRequest entity)
    {
        _context.Set<OrderRequest>().Update(entity);
    }

    public void Delete(OrderRequest entity)
    {
        entity.IsDeleted = true;
        _context.Set<OrderRequest>().Update(entity);
    }
}