using CloudService.Application.Common.Models;
using CloudService.Application.DTOs.News;
using CloudService.Application.Interfaces;
using CloudService.Domain.Entities;
using CloudService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CloudService.Infrastructure.Repositories;

/// <summary>
/// Triển khai INewsArticleRepository sử dụng Entity Framework Core (PR#5)
/// </summary>
public class NewsArticleRepository : INewsArticleRepository
{
    private readonly ApplicationDbContext _context;

    public NewsArticleRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<NewsArticle?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.NewsArticles
            .Include(a => a.Author)
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted, cancellationToken);
    }

    public async Task<NewsArticle?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await _context.NewsArticles
            .Include(a => a.Author)
            .FirstOrDefaultAsync(a => a.Slug == slug && !a.IsDeleted, cancellationToken);
    }

    public async Task<PagedResult<NewsArticle>> GetPagedAsync(
        NewsArticleFilterDto filter,
        CancellationToken cancellationToken = default)
    {
        var query = _context.NewsArticles
            .Include(a => a.Author)
            .Where(a => !a.IsDeleted)
            .AsQueryable();

        // 1. Lọc theo trạng thái xuất bản
        if (filter.IsPublished.HasValue)
        {
            query = query.Where(a => a.IsPublished == filter.IsPublished.Value);
        }

        // 2. Lọc theo danh mục
        if (!string.IsNullOrWhiteSpace(filter.Category))
        {
            query = query.Where(a => a.Category == filter.Category.Trim());
        }

        // 3. Tìm kiếm theo từ khóa (Tiêu đề, Tóm tắt hoặc Nội dung)
        if (!string.IsNullOrWhiteSpace(filter.Keyword))
        {
            var kw = filter.Keyword.Trim();
            query = query.Where(a => a.Title.Contains(kw) || a.Summary.Contains(kw) || a.Content.Contains(kw));
        }

        // 4. Đếm tổng số lượng bản ghi thỏa điều kiện
        var totalCount = await query.CountAsync(cancellationToken);

        // 5. Sắp xếp
        query = filter.SortBy?.ToLowerInvariant() switch
        {
            "title" => filter.SortDescending ? query.OrderByDescending(a => a.Title) : query.OrderBy(a => a.Title),
            "viewcount" => filter.SortDescending ? query.OrderByDescending(a => a.ViewCount) : query.OrderBy(a => a.ViewCount),
            "publishedat" => filter.SortDescending ? query.OrderByDescending(a => a.PublishedAt) : query.OrderBy(a => a.PublishedAt),
            _ => filter.SortDescending ? query.OrderByDescending(a => a.CreatedAt) : query.OrderBy(a => a.CreatedAt)
        };

        // 6. Phân trang
        var pageNumber = filter.Page < 1 ? 1 : filter.Page;
        var pageSize = filter.PageSize < 1 ? 10 : (filter.PageSize > 100 ? 100 : filter.PageSize);

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<NewsArticle>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task AddAsync(NewsArticle article, CancellationToken cancellationToken = default)
    {
        await _context.NewsArticles.AddAsync(article, cancellationToken);
    }

    public void Update(NewsArticle article)
    {
        _context.NewsArticles.Update(article);
    }

    public void Delete(NewsArticle article)
    {
        article.IsDeleted = true;
        article.UpdatedAt = DateTime.UtcNow;
        _context.NewsArticles.Update(article);
    }

    public async Task<bool> SlugExistsAsync(string slug, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.NewsArticles.Where(a => a.Slug == slug && !a.IsDeleted);
        if (excludeId.HasValue)
        {
            query = query.Where(a => a.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task IncrementViewCountAsync(int id, CancellationToken cancellationToken = default)
    {
        await _context.NewsArticles
            .Where(a => a.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(a => a.ViewCount, a => a.ViewCount + 1), cancellationToken);
    }
}
