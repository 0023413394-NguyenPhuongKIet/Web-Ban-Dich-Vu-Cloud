using CloudService.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Text.Json;

namespace CloudService.WebApi.Middleware;

/// <summary>
/// Middleware xử lý exception toàn cục, trả về ProblemDetails chuẩn RFC 7807.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var problemDetails = exception switch
        {
            NotFoundException notFoundEx => new ProblemDetails
            {
                Status = (int)HttpStatusCode.NotFound,
                Title = "Không tìm thấy tài nguyên",
                Detail = notFoundEx.Message,
                Type = "https://tools.ietf.org/html/rfc7807"
            },
            DomainException domainEx => new ProblemDetails
            {
                Status = (int)HttpStatusCode.BadRequest,
                Title = "Lỗi nghiệp vụ",
                Detail = domainEx.Message,
                Type = "https://tools.ietf.org/html/rfc7807"
            },
            _ => new ProblemDetails
            {
                Status = (int)HttpStatusCode.InternalServerError,
                Title = "Lỗi hệ thống",
                Detail = "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.",
                Type = "https://tools.ietf.org/html/rfc7807"
            }
        };

        if (exception is not DomainException)
        {
            _logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);
        }
        else
        {
            _logger.LogWarning("Domain exception: {Message}", exception.Message);
        }

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = problemDetails.Status ?? 500;

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        await context.Response.WriteAsync(JsonSerializer.Serialize(problemDetails, options));
    }
}
