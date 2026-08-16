using CloudService.Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CloudService.WebApi.Controllers;

/// <summary>
/// Controller sinh mã QR cho gói dịch vụ VPS / Hosting (Yêu cầu đề bài 2.1)
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class QrCodeController : ControllerBase
{
    private readonly IQrCodeService _qrCodeService;

    public QrCodeController(IQrCodeService qrCodeService)
    {
        _qrCodeService = qrCodeService;
    }

    /// <summary>
    /// Sinh hình ảnh Mã QR Base64 từ URL gói dịch vụ hoặc dữ liệu tùy chỉnh
    /// </summary>
    /// <param name="url">Đường dẫn trang chi tiết/đặt hàng dịch vụ (VD: https://cloud.net/vps-pro-1)</param>
    [HttpGet("generate")]
    public IActionResult GenerateQr([FromQuery] string url)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            return BadRequest(new { Message = "URL không được để trống." });
        }

        string base64Qr = _qrCodeService.GenerateQrCodeBase64(url);
        return Ok(new { Url = url, QrCodeBase64 = base64Qr });
    }
}
