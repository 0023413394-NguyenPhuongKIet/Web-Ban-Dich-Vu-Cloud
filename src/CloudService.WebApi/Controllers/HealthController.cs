using Microsoft.AspNetCore.Mvc;

namespace CloudService.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
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
}
