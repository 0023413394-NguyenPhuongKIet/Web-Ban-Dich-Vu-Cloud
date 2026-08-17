using System.Text;
using CloudService.Application.DTOs.Affiliate;
using CloudService.Application.DTOs.AuditLog;
using CloudService.Application.Interfaces;

namespace CloudService.Application.Services;

/// <summary>
/// Service xuất dữ liệu hệ thống ra file dạng CSV/Excel với UTF-8 BOM.
/// </summary>
public class ExportService : IExportService
{
    private readonly IOrderRequestRepository _orderRepo;
    private readonly IAuditLogRepository _auditLogRepo;
    private readonly IAffiliateRepository _affiliateRepo;

    public ExportService(
        IOrderRequestRepository orderRepo,
        IAuditLogRepository auditLogRepo,
        IAffiliateRepository affiliateRepo)
    {
        _orderRepo = orderRepo;
        _auditLogRepo = auditLogRepo;
        _affiliateRepo = affiliateRepo;
    }

    public async Task<byte[]> ExportOrdersToExcelAsync(CancellationToken cancellationToken = default)
    {
        var orders = await _orderRepo.GetAllWithServicePlanAsync(cancellationToken);

        var builder = new StringBuilder();
        // CSV Header
        builder.AppendLine("ID,Tên Khách Hàng,Email,Số Điện Thoại,Công Ty,Gói Dịch Vụ,Chu Kỳ Thống Kê,Tổng Tiền (VND),Trạng Thái,Ghi Chú,Ngày Tạo");

        foreach (var o in orders)
        {
            var planName = o.ServicePlan != null ? EscapeCsv(o.ServicePlan.Name) : "N/A";
            builder.AppendLine($"{o.Id},{EscapeCsv(o.CustomerName)},{EscapeCsv(o.CustomerEmail)},{EscapeCsv(o.CustomerPhone)},{EscapeCsv(o.CompanyName)},{planName},{EscapeCsv(o.BillingCycle)},{o.TotalAmount},{EscapeCsv(o.Status)},{EscapeCsv(o.Note ?? "")},{o.CreatedAt:dd/MM/yyyy HH:mm:ss}");
        }

        return CreateUtf8BomBytes(builder.ToString());
    }

    public async Task<byte[]> ExportAuditLogsToExcelAsync(AuditLogQueryDto query, CancellationToken cancellationToken = default)
    {
        var logs = await _auditLogRepo.GetAllFilteredAsync(query, cancellationToken);

        var builder = new StringBuilder();
        // CSV Header
        builder.AppendLine("ID,User ID,Người Thực Hiện,Hành Động,Tên Entity,ID Entity,Chi Tiết,IP Address,Thời Gian");

        foreach (var l in logs)
        {
            var userName = l.User != null ? (l.User.FullName ?? l.User.Username) : "Hệ thống";
            builder.AppendLine($"{l.Id},{l.UserId},{EscapeCsv(userName)},{EscapeCsv(l.Action)},{EscapeCsv(l.EntityName)},{EscapeCsv(l.EntityId ?? "")},{EscapeCsv(l.Details ?? "")},{EscapeCsv(l.IpAddress)},{l.CreatedAt:dd/MM/yyyy HH:mm:ss}");
        }

        return CreateUtf8BomBytes(builder.ToString());
    }

    public async Task<byte[]> ExportAffiliatesToExcelAsync(AffiliateQueryDto query, CancellationToken cancellationToken = default)
    {
        var affiliates = await _affiliateRepo.GetAllFilteredAsync(query, cancellationToken);

        var builder = new StringBuilder();
        // CSV Header
        builder.AppendLine("ID,Họ Và Tên,Email,Số Điện Thoại,Website,Kế Hoạch Quảng Bá,Trạng Thái,Ngày Đăng Ký");

        foreach (var a in affiliates)
        {
            builder.AppendLine($"{a.Id},{EscapeCsv(a.FullName)},{EscapeCsv(a.Email)},{EscapeCsv(a.Phone)},{EscapeCsv(a.WebsiteUrl)},{EscapeCsv(a.PromotionPlan)},{EscapeCsv(a.Status)},{a.CreatedAt:dd/MM/yyyy HH:mm:ss}");
        }

        return CreateUtf8BomBytes(builder.ToString());
    }

    private static string EscapeCsv(string field)
    {
        if (string.IsNullOrEmpty(field)) return "";
        if (field.Contains(",") || field.Contains("\"") || field.Contains("\n") || field.Contains("\r"))
        {
            return $"\"{field.Replace("\"", "\"\"")}\"";
        }
        return field;
    }

    private static byte[] CreateUtf8BomBytes(string csvContent)
    {
        var preamble = Encoding.UTF8.GetPreamble();
        var contentBytes = Encoding.UTF8.GetBytes(csvContent);
        var result = new byte[preamble.Length + contentBytes.Length];

        Buffer.BlockCopy(preamble, 0, result, 0, preamble.Length);
        Buffer.BlockCopy(contentBytes, 0, result, preamble.Length, contentBytes.Length);

        return result;
    }
}
