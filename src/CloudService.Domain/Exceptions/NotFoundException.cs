namespace CloudService.Domain.Exceptions;

/// <summary>
/// Ném khi không tìm thấy entity với ID được yêu cầu.
/// </summary>
public class NotFoundException : DomainException
{
    public NotFoundException(string entityName, object key)
        : base($"Không tìm thấy {entityName} với ID '{key}'.")
    {
    }
}
