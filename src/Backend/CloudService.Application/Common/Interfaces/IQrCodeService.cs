namespace CloudService.Application.Common.Interfaces;

/// <summary>
/// Interface cho dịch vụ sinh mã QR (Design Pattern: Factory/Service Pattern)
/// Tạo mã QR theo chuẩn dạng hình ảnh Base64 cho từng gói dịch vụ VPS/Hosting
/// </summary>
public interface IQrCodeService
{
    /// <summary>
    /// Sinh chuỗi Data URI hình ảnh PNG Base64 từ nội dung văn bản (URL gói dịch vụ)
    /// </summary>
    /// <param name="content">Đường dẫn trang chi tiết gói dịch vụ / đặt hàng</param>
    /// <returns>Chuỗi hình ảnh Base64 có thể hiển thị thẳng trong thẻ img (src="data:image/png;base64,...")</returns>
    string GenerateQrCodeBase64(string content);
}
