using CloudService.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CloudService.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public HealthController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetStatus()
    {
        return Ok(new
        {
            Status = "Healthy",
            System = "Cloud Service Management API",
            Timestamp = DateTime.UtcNow
        });
    }

    [HttpGet("db")]
    public async Task<IActionResult> GetDbStatus()
    {
        try
        {
            bool canConnect = await _context.Database.CanConnectAsync();
            int userCount = 0;
            if (canConnect)
            {
                userCount = await _context.AppUsers.CountAsync();
            }
            return Ok(new
            {
                DatabaseConnected = canConnect,
                Provider = _context.Database.ProviderName,
                UsersCount = userCount,
                Message = canConnect ? "Kết nối CSDL thành công!" : "Không thể kết nối CSDL."
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                DatabaseConnected = false,
                Error = ex.Message,
                InnerError = ex.InnerException?.Message,
                StackTrace = ex.StackTrace
            });
        }
    }
}
