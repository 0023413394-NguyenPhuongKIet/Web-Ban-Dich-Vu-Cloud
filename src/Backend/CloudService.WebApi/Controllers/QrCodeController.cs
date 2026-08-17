using CloudService.Application.Common.Interfaces;
using CloudService.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CloudService.WebApi.Controllers;

/// <summary>
/// Controller sinh mã QR cho gói dịch vụ VPS / Hosting / Khuyến mãi (Yêu cầu PR#7 và Đề bài 2.1)
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class QrCodeController : ControllerBase
{
    private readonly IQrCodeService _qrCodeService;
    private readonly IServicePlanRepository _servicePlanRepo;

    public QrCodeController(
        IQrCodeService qrCodeService,
        IServicePlanRepository servicePlanRepo)
    {
        _qrCodeService = qrCodeService;
        _servicePlanRepo = servicePlanRepo;
    }

    /// <summary>
    /// Sinh hình ảnh Mã QR Base64 từ URL hoặc chuỗi dữ liệu tùy chỉnh
    /// </summary>
    /// <param name="url">Đường dẫn trang chi tiết/đặt hàng dịch vụ (VD: https://cloudservice.vn/services/vps-pro-1)</param>
    [HttpGet("generate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult GenerateQr([FromQuery] string url)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            return BadRequest(new { Message = "Dữ liệu hoặc URL không được để trống." });
        }

        string base64Qr = _qrCodeService.GenerateQrCodeBase64(url);
        return Ok(new { Data = url, QrCodeBase64 = base64Qr });
    }

    /// <summary>
    /// Sinh mã QR trực tiếp cho một Gói dịch vụ (Service Plan) theo ID
    /// Phục vụ quét mã bằng điện thoại để xem và đặt dịch vụ nhanh chóng
    /// </summary>
    /// <param name="planId">ID gói dịch vụ</param>
    /// <param name="baseUrl">Tên miền trang web frontend (mặc định: http://localhost:3000)</param>
    [HttpGet("plan/{planId:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GenerateQrForPlan(
        [FromRoute] int planId,
        [FromQuery] string baseUrl = "http://localhost:3000",
        CancellationToken cancellationToken = default)
    {
        var plan = await _servicePlanRepo.GetByIdAsync(planId, cancellationToken);
        if (plan == null)
        {
            return NotFound(new { Message = $"Không tìm thấy gói dịch vụ có ID = {planId}" });
        }

        var targetUrl = $"{baseUrl.TrimEnd('/')}/services/plans/{planId}";
        var base64Qr = _qrCodeService.GenerateQrCodeBase64(targetUrl);

        return Ok(new
        {
            PlanId = plan.Id,
            PlanName = plan.Name,
            TargetUrl = targetUrl,
            QrCodeBase64 = base64Qr
        });
    }

    /// <summary>
    /// Sinh và tải trực tiếp file ảnh PNG mã QR (Content-Type: image/png)
    /// </summary>
    /// <param name="url">Đường dẫn cần tạo mã QR</param>
    [HttpGet("image")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult GenerateQrImage([FromQuery] string url)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            return BadRequest(new { Message = "URL không được để trống." });
        }

        byte[] qrBytes = _qrCodeService.GenerateQrCodeBytes(url);
        return File(qrBytes, "image/png", "service-qrcode.png");
    }
}
