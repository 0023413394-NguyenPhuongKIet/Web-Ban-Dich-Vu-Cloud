using CloudService.Application.Common.Interfaces;
using QRCoder;

namespace CloudService.Infrastructure.Services;

/// <summary>
/// Cài đặt dịch vụ sinh mã QR bằng thư viện QRCoder (Yêu cầu đề bài 2.1 - Sinh mã QR cho gói dịch vụ)
/// </summary>
public class QrCodeService : IQrCodeService
{
    /// <summary>
    /// Chuyển đổi nội dung văn bản (URL đặt hàng gói dịch vụ) thành hình ảnh PNG Base64
    /// </summary>
    public string GenerateQrCodeBase64(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
            return string.Empty;

        var qrCodeBytes = GenerateQrCodeBytes(content);
        return $"data:image/png;base64,{Convert.ToBase64String(qrCodeBytes)}";
    }

    /// <summary>
    /// Chuyển đổi nội dung văn bản thành mảng byte hình ảnh PNG
    /// </summary>
    public byte[] GenerateQrCodeBytes(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
            return Array.Empty<byte>();

        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(content, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrCodeData);
        return qrCode.GetGraphic(20);
    }
}
