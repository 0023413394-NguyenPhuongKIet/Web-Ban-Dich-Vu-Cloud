using System.Security.Claims;
using CloudService.Application.Common.Interfaces;
using CloudService.Application.Common.Models;
using CloudService.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CloudService.WebApi.Controllers;

/// <summary>
/// Controller xử lý Xác thực & Phân quyền Bảo mật (PR#4: JWT Authentication + Refresh Token + BCrypt)
/// Đăng nhập khu vực quản trị, Cấp mới Token, Đổi mật khẩu
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IAuthService _authService;
    private readonly Application.Interfaces.IAuditLogService _auditLogService;

    public AuthController(
        ApplicationDbContext context, 
        IAuthService authService,
        Application.Interfaces.IAuditLogService auditLogService)
    {
        _context = context;
        _authService = authService;
        _auditLogService = auditLogService;
    }

    /// <summary>
    /// API Đăng nhập tài khoản quản trị (Admin / Editor)
    /// Trả về JWT Access Token (hạn 60p) + Refresh Token
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        // 1. Tìm người dùng theo Username kèm thông tin Role
        var user = await _context.AppUsers
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Username == request.Username && !u.IsDeleted);

        if (user == null || !user.IsActive)
        {
            return Unauthorized(new { Message = "Tài khoản hoặc mật khẩu không chính xác." });
        }

        // 2. Kiểm tra mật khẩu bằng BCrypt
        bool isValidPassword = _authService.VerifyPassword(request.Password, user.PasswordHash);
        if (!isValidPassword)
        {
            return Unauthorized(new { Message = "Tài khoản hoặc mật khẩu không chính xác." });
        }

        // 3. Sinh mã JWT Token và Refresh Token
        string token = _authService.GenerateJwtToken(user.Id, user.Username, user.Email, user.Role.Name);
        string refreshToken = _authService.GenerateRefreshToken();

        // 4. Lưu Refresh Token và thời hạn (7 ngày) vào CSDL
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync();

        // 5. Ghi nhận Nhật ký Hệ thống (Audit Log: Đăng nhập thành công)
        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        await _auditLogService.LogAsync(new Application.DTOs.AuditLog.CreateAuditLogDto
        {
            UserId = user.Id,
            Action = "Login",
            EntityName = "AppUser",
            EntityId = user.Id.ToString(),
            Details = $"Người dùng '{user.FullName} ({user.Username})' [Role: {user.Role.Name}] đã đăng nhập hệ thống thành công qua JWT Access Token.",
            IpAddress = clientIp
        });

        return Ok(new AuthResponseDto(
            AccessToken: token,
            RefreshToken: refreshToken,
            ExpiryTime: DateTime.UtcNow.AddMinutes(60),
            Username: user.Username,
            Role: user.Role.Name,
            FullName: user.FullName,
            Email: user.Email
        ));
    }

    /// <summary>
    /// API Đăng ký tài khoản người dùng / khách hàng mới
    /// Tự động gán quyền 'Customer' và cấp JWT Access Token
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { Message = "Tên đăng nhập và mật khẩu là bắt buộc." });
        }

        var usernameClean = request.Username.Trim();
        var emailClean = request.Email.Trim().ToLowerInvariant();

        // 1. Kiểm tra trùng lặp Username hoặc Email
        var existingUser = await _context.AppUsers
            .FirstOrDefaultAsync(u => (u.Username.ToLower() == usernameClean.ToLower() || u.Email.ToLower() == emailClean) && !u.IsDeleted);

        if (existingUser != null)
        {
            if (existingUser.Username.Equals(usernameClean, StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { Message = "Tên đăng nhập này đã có người sử dụng. Vui lòng chọn tên khác." });
            }
            return BadRequest(new { Message = "Địa chỉ email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập." });
        }

        // 2. Tìm Role 'Customer' (nếu chưa có thì tự động tạo)
        var customerRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Customer");
        if (customerRole == null)
        {
            customerRole = new Domain.Entities.Role
            {
                Name = "Customer",
                Description = "Khách hàng người dùng hệ thống"
            };
            _context.Roles.Add(customerRole);
            await _context.SaveChangesAsync();
        }

        // 3. Tạo tài khoản mới với mật khẩu mã hóa BCrypt
        var newUser = new Domain.Entities.AppUser
        {
            Username = usernameClean,
            Email = emailClean,
            PasswordHash = _authService.HashPassword(request.Password),
            FullName = string.IsNullOrWhiteSpace(request.FullName) ? usernameClean : request.FullName.Trim(),
            RoleId = customerRole.Id,
            IsActive = true,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.AppUsers.Add(newUser);
        await _context.SaveChangesAsync();

        // 4. Sinh JWT Token và Refresh Token cho người dùng mới
        string token = _authService.GenerateJwtToken(newUser.Id, newUser.Username, newUser.Email, customerRole.Name);
        string refreshToken = _authService.GenerateRefreshToken();

        newUser.RefreshToken = refreshToken;
        newUser.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync();

        // 5. Ghi nhận Nhật ký Hệ thống (Audit Log: Đăng ký tài khoản)
        var regIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        await _auditLogService.LogAsync(new Application.DTOs.AuditLog.CreateAuditLogDto
        {
            UserId = newUser.Id,
            Action = "Register",
            EntityName = "AppUser",
            EntityId = newUser.Id.ToString(),
            Details = $"Khách hàng '{newUser.FullName} ({newUser.Username})' vừa tạo tài khoản mới trên hệ thống.",
            IpAddress = regIp
        });

        return Ok(new AuthResponseDto(
            AccessToken: token,
            RefreshToken: refreshToken,
            ExpiryTime: DateTime.UtcNow.AddMinutes(60),
            Username: newUser.Username,
            Role: customerRole.Name,
            FullName: newUser.FullName,
            Email: newUser.Email
        ));
    }

    /// <summary>
    /// API Cấp lại Access Token mới khi hết hạn sử dụng Refresh Token
    /// </summary>
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request)
    {
        var user = await _context.AppUsers
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken && !u.IsDeleted);

        if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow || !user.IsActive)
        {
            return BadRequest(new { Message = "Refresh Token không hợp lệ hoặc đã hết hạn." });
        }

        // Sinh mới JWT Token và Refresh Token mới (Rotate Token)
        string newAccessToken = _authService.GenerateJwtToken(user.Id, user.Username, user.Email, user.Role.Name);
        string newRefreshToken = _authService.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync();

        return Ok(new AuthResponseDto(
            AccessToken: newAccessToken,
            RefreshToken: newRefreshToken,
            ExpiryTime: DateTime.UtcNow.AddMinutes(60),
            Username: user.Username,
            Role: user.Role.Name
        ));
    }

    /// <summary>
    /// API Đổi mật khẩu (Yêu cầu đăng nhập JWT)
    /// </summary>
    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized();
        }

        var user = await _context.AppUsers.FindAsync(userId);
        if (user == null) return NotFound();

        // Kiểm tra mật khẩu cũ
        if (!_authService.VerifyPassword(request.OldPassword, user.PasswordHash))
        {
            return BadRequest(new { Message = "Mật khẩu cũ không chính xác." });
        }

        // Hash mật khẩu mới bằng BCrypt và cập nhật
        user.PasswordHash = _authService.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Đổi mật khẩu thành công." });
    }
}
