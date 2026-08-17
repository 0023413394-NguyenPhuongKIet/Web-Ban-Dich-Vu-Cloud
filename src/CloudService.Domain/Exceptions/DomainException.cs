namespace CloudService.Domain.Exceptions;

/// <summary>
/// Exception cơ sở cho các lỗi nghiệp vụ trong Domain layer.
/// </summary>
public class DomainException : Exception
{
    public DomainException(string message) : base(message)
    {
    }

    public DomainException(string message, Exception innerException) : base(message, innerException)
    {
    }
}
