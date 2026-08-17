using CloudService.Application.Common.Models;
using CloudService.Application.DTOs.News;
using CloudService.Domain.Entities;

namespace CloudService.Application.Interfaces;

/// <summary>
/// Interface định nghĩa các thao tác dữ liệu cho NewsArticle (Tầng Application)
/// </summary>
public interface INewsArticleRepository
{
    Task<NewsArticle?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<NewsArticle?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<PagedResult<NewsArticle>> GetPagedAsync(NewsArticleFilterDto filter, CancellationToken cancellationToken = default);
    Task AddAsync(NewsArticle article, CancellationToken cancellationToken = default);
    void Update(NewsArticle article);
    void Delete(NewsArticle article);
    Task<bool> SlugExistsAsync(string slug, int? excludeId = null, CancellationToken cancellationToken = default);
    Task IncrementViewCountAsync(int id, CancellationToken cancellationToken = default);
}
