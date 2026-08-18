using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using CloudService.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace CloudService.Infrastructure.Services;

/// <summary>
/// Cài đặt thực tế cho IAuthService (SOLID: Dependency Inversion & Single Responsibility Principle)
/// Đảm nhiệm chức năng mã hóa mật khẩu BCrypt và sinh mã JWT Token chuẩn bảo mật
/// </summary>
public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;

    public AuthService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    /// <summary>
    /// Mã hóa mật khẩu với BCrypt (Tự động sinh Salt ngẫu nhiên chống tấn công Rainbow Table)
    /// </summary>
    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    /// <summary>
    /// Kiểm tra tính hợp lệ của mật khẩu bằng thuật toán So sánh Hash an toàn của BCrypt
    /// </summary>
    public bool VerifyPassword(string password, string hashedPassword)
    {
        return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
    }

    /// <summary>
    /// Sinh chuỗi Json Web Token (JWT) mã hóa thông tin Claims và phân quyền Role (Admin/Editor)
    /// </summary>
    public string GenerateJwtToken(int userId, string username, string email, string role)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? "SUPER_SECRET_KEY_FOR_CLOUD_SERVICE_PROJECT_IN4211_2026_SOFWARE_ARCHITECTURE";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

        // Đóng gói thông tin người dùng vào Claims (Được mã hóa trong Signature của JWT)
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Name, username),
            new(ClaimTypes.Email, email),
            new(ClaimTypes.Role, role) // Phân quyền Admin / Editor
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpiryMinutes"] ?? "60")),
            Issuer = jwtSettings["Issuer"] ?? "CloudServiceAPI",
            Audience = jwtSettings["Audience"] ?? "CloudServiceApp",
            SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    /// <summary>
    /// Sinh Refresh Token ngẫu nhiên sử dụng bộ tạo số ngẫu nhiên an toàn mật mã (RandomNumberGenerator)
    /// </summary>
    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}
