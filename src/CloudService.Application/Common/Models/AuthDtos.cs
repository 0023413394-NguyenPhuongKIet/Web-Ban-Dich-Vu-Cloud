namespace CloudService.Application.Common.Models;

public record LoginRequestDto(string Username, string Password);

public record AuthResponseDto(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiryTime,
    string Username,
    string Role
);

public record RefreshTokenRequestDto(string RefreshToken);

public record ChangePasswordRequestDto(string OldPassword, string NewPassword);
