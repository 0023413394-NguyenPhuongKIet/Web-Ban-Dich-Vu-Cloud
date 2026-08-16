using CloudService.Application.Common.Interfaces;
using CloudService.Infrastructure.Services;
using Microsoft.Extensions.Configuration;

namespace CloudService.UnitTests;

public class SecurityAndAuthTests
{
    private readonly IAuthService _authService;
    private readonly IQrCodeService _qrCodeService;

    public SecurityAndAuthTests()
    {
        var inMemorySettings = new Dictionary<string, string?>
        {
            { "JwtSettings:SecretKey", "SUPER_SECRET_KEY_FOR_CLOUD_SERVICE_PROJECT_IN4211_2026_SOFWARE_ARCHITECTURE" },
            { "JwtSettings:Issuer", "CloudServiceAPI" },
            { "JwtSettings:Audience", "CloudServiceApp" },
            { "JwtSettings:ExpiryMinutes", "60" }
        };

        IConfiguration configuration = new ConfigurationManager();
        foreach (var (key, value) in inMemorySettings)
        {
            configuration[key] = value;
        }

        _authService = new AuthService(configuration);
        _qrCodeService = new QrCodeService();
    }


    [Fact]
    public void HashPassword_ShouldReturnBCryptHash_AndVerifySuccessfully()
    {
        // Arrange
        string rawPassword = "AdminPassword123!";

        // Act
        string hashedPassword = _authService.HashPassword(rawPassword);
        bool isPasswordValid = _authService.VerifyPassword(rawPassword, hashedPassword);
        bool isWrongPasswordValid = _authService.VerifyPassword("WrongPassword", hashedPassword);

        // Assert
        Assert.NotEqual(rawPassword, hashedPassword);
        Assert.StartsWith("$2a$", hashedPassword); // Ký tự bắt đầu đặc trưng của BCrypt Hash
        Assert.True(isPasswordValid);
        Assert.False(isWrongPasswordValid);
    }

    [Fact]
    public void GenerateJwtToken_ShouldReturnValidJwtTokenString()
    {
        // Act
        string token = _authService.GenerateJwtToken(1, "admin", "admin@cloud.com", "Admin");

        // Assert
        Assert.False(string.IsNullOrWhiteSpace(token));
        Assert.Equal(2, token.Split('.').Length - 1); // Cấu trúc JWT có 3 phần ngăn cách bằng 2 dấu chấm
    }

    [Fact]
    public void GenerateQrCodeBase64_ShouldReturnValidBase64DataUri()
    {
        // Act
        string qrBase64 = _qrCodeService.GenerateQrCodeBase64("https://cloud.vn/vps-pro-1");

        // Assert
        Assert.StartsWith("data:image/png;base64,", qrBase64);
    }
}
