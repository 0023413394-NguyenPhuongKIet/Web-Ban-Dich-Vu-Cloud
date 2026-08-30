using CloudService.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CloudService.WebApi.Controllers;

[ApiController]
[Route("/")]
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
        var conn = _context.Database.GetDbConnection();
        var connStr = conn.ConnectionString;
        var maskedConnStr = System.Text.RegularExpressions.Regex.Replace(connStr ?? "", "(?i)password=[^;]+", "Password=***");

        try
        {
            await conn.OpenAsync();
            var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT COUNT(*) FROM AppUsers";
            var count = await cmd.ExecuteScalarAsync();
            conn.Close();

            return Ok(new
            {
                DatabaseConnected = true,
                Provider = _context.Database.ProviderName,
                DataSource = conn.DataSource,
                Database = conn.Database,
                UsersCount = count,
                ConnectionString = maskedConnStr,
                Message = "Kết nối CSDL thành công!"
            });
        }
        catch (Exception ex)
        {
            return Ok(new
            {
                DatabaseConnected = false,
                Provider = _context.Database.ProviderName,
                DataSource = conn.DataSource,
                Database = conn.Database,
                ConnectionString = maskedConnStr,
                Error = ex.Message,
                InnerError = ex.InnerException?.Message,
                Message = "Lỗi kết nối CSDL: " + ex.Message
            });
        }
    }
}
