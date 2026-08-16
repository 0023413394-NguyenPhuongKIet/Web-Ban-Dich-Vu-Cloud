using CloudService.Application.Common.Models;
using CloudService.Application.DTOs.News;
using CloudService.Application.Interfaces;
using CloudService.Domain.Entities;
using CloudService.Domain.Exceptions;

namespace CloudService.Application.Services;

/// <summary>
/// Service xử lý nghiệp vụ Quản lý Tin tức / Blog / Bài viết kỹ thuật (PR#5)
/// </summary>
public class NewsArticleService
{
    private readonly INewsArticleRepository _newsRepository;
    private readonly IUnitOfWork _unitOfWork;

    public NewsArticleService(INewsArticleRepository newsRepository, IUnitOfWork unitOfWork)
    {
        _newsRepository = newsRepository;
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Lấy danh sách bài viết có phân trang, tìm kiếm theo từ khóa và lọc danh mục
    /// </summary>
    public async Task<PagedResult<NewsArticleDto>> GetPagedArticlesAsync(
        NewsArticleFilterDto filter,
        CancellationToken cancellationToken = default)
    {
        var pagedEntities = await _newsRepository.GetPagedAsync(filter, cancellationToken);

        var items = pagedEntities.Items.Select(a => new NewsArticleDto(
            Id: a.Id,
            Title: a.Title,
            Slug: a.Slug,
            Summary: a.Summary,
            ThumbnailUrl: a.ThumbnailUrl,
            Category: a.Category,
            IsPublished: a.IsPublished,
            ViewCount: a.ViewCount,
            PublishedAt: a.PublishedAt,
            CreatedAt: a.CreatedAt,
            AuthorId: a.AuthorId,
            AuthorName: a.Author != null ? a.Author.FullName : string.Empty
        )).ToList();

        return new PagedResult<NewsArticleDto>
        {
            Items = items,
            TotalCount = pagedEntities.TotalCount,
            PageNumber = pagedEntities.PageNumber,
            PageSize = pagedEntities.PageSize
        };
    }

    /// <summary>
    /// Lấy chi tiết bài viết theo ID
    /// </summary>
    public async Task<NewsArticleDetailDto> GetArticleByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var article = await _newsRepository.GetByIdAsync(id, cancellationToken);
        if (article == null)
            throw new NotFoundException("Bài viết", id);

        return MapToDetailDto(article);
    }

    /// <summary>
    /// Lấy chi tiết bài viết theo Slug và tự động tăng lượt xem (ViewCount)
    /// </summary>
    public async Task<NewsArticleDetailDto> GetArticleBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var article = await _newsRepository.GetBySlugAsync(slug, cancellationToken);
        if (article == null)
            throw new NotFoundException("Bài viết", slug);

        // Tăng lượt xem bất đồng bộ
        await _newsRepository.IncrementViewCountAsync(article.Id, cancellationToken);
        article.IncrementViewCount();

        return MapToDetailDto(article);
    }

    /// <summary>
    /// Tạo mới một bài viết (Admin / Editor)
    /// </summary>
    public async Task<NewsArticleDetailDto> CreateArticleAsync(
        CreateNewsArticleDto dto,
        int authorId,
        CancellationToken cancellationToken = default)
    {
        // 1. Khởi tạo Domain Entity (tự động sinh Slug và validate dữ liệu)
        var article = NewsArticle.Create(
            title: dto.Title,
            summary: dto.Summary,
            content: dto.Content,
            category: dto.Category,
            authorId: authorId,
            thumbnailUrl: dto.ThumbnailUrl,
            isPublished: dto.IsPublished
        );

        // 2. Kiểm tra trùng lặp Slug
        var baseSlug = article.Slug;
        var uniqueSlug = baseSlug;
        var counter = 1;
        while (await _newsRepository.SlugExistsAsync(uniqueSlug, null, cancellationToken))
        {
            uniqueSlug = $"{baseSlug}-{counter++}";
        }
        article.Slug = uniqueSlug;

        // 3. Lưu vào CSDL
        await _newsRepository.AddAsync(article, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Lấy lại kèm thông tin Author
        return await GetArticleByIdAsync(article.Id, cancellationToken);
    }

    /// <summary>
    /// Cập nhật bài viết hiện có
    /// </summary>
    public async Task<NewsArticleDetailDto> UpdateArticleAsync(
        int id,
        UpdateNewsArticleDto dto,
        CancellationToken cancellationToken = default)
    {
        var article = await _newsRepository.GetByIdAsync(id, cancellationToken);
        if (article == null)
            throw new NotFoundException("Bài viết", id);

        // Cập nhật Domain Entity
        article.Update(
            title: dto.Title,
            summary: dto.Summary,
            content: dto.Content,
            category: dto.Category,
            thumbnailUrl: dto.ThumbnailUrl,
            isPublished: dto.IsPublished
        );

        // Đảm bảo Slug không bị trùng với bài viết khác
        var baseSlug = article.Slug;
        var uniqueSlug = baseSlug;
        var counter = 1;
        while (await _newsRepository.SlugExistsAsync(uniqueSlug, article.Id, cancellationToken))
        {
            uniqueSlug = $"{baseSlug}-{counter++}";
        }
        article.Slug = uniqueSlug;

        _newsRepository.Update(article);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetArticleByIdAsync(article.Id, cancellationToken);
    }

    /// <summary>
    /// Xóa bài viết (Soft delete)
    /// </summary>
    public async Task DeleteArticleAsync(int id, CancellationToken cancellationToken = default)
    {
        var article = await _newsRepository.GetByIdAsync(id, cancellationToken);
        if (article == null)
            throw new NotFoundException("Bài viết", id);

        _newsRepository.Delete(article);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Chuyển đổi trạng thái xuất bản bài viết (Publish / Unpublish)
    /// </summary>
    public async Task<NewsArticleDetailDto> TogglePublishStatusAsync(
        int id,
        bool isPublished,
        CancellationToken cancellationToken = default)
    {
        var article = await _newsRepository.GetByIdAsync(id, cancellationToken);
        if (article == null)
            throw new NotFoundException("Bài viết", id);

        if (isPublished)
            article.Publish();
        else
            article.Unpublish();

        _newsRepository.Update(article);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDetailDto(article);
    }

    private static NewsArticleDetailDto MapToDetailDto(NewsArticle a)
    {
        return new NewsArticleDetailDto(
            Id: a.Id,
            Title: a.Title,
            Slug: a.Slug,
            Summary: a.Summary,
            Content: a.Content,
            ThumbnailUrl: a.ThumbnailUrl,
            Category: a.Category,
            IsPublished: a.IsPublished,
            ViewCount: a.ViewCount,
            PublishedAt: a.PublishedAt,
            CreatedAt: a.CreatedAt,
            UpdatedAt: a.UpdatedAt,
            AuthorId: a.AuthorId,
            AuthorName: a.Author != null ? a.Author.FullName : string.Empty,
            AuthorEmail: a.Author != null ? a.Author.Email : string.Empty
        );
    }
}
