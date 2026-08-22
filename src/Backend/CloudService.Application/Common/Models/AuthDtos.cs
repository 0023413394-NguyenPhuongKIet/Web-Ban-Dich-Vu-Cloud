namespace CloudService.Application.Common.Models;

public record LoginRequestDto(string Username, string Password);

public record RegisterRequestDto(
    string Username,
    string Email,
    string Password,
    string FullName,
    string? PhoneNumber
);

public record AuthResponseDto(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiryTime,
    string Username,
    string Role,
    string? FullName = null,
    string? Email = null
);

public record RefreshTokenRequestDto(string RefreshToken);

public record ChangePasswordRequestDto(string OldPassword, string NewPassword);

public record UserDto(
    int Id,
    string Username,
    string Email,
    string FullName,
    int RoleId,
    string RoleName,
    bool IsActive,
    DateTime CreatedAt
);

public record CreateUserRequestDto(
    string Username,
    string Email,
    string Password,
    string FullName,
    int RoleId,
    bool IsActive = true
);

public record UpdateUserRequestDto(
    string Email,
    string FullName,
    int RoleId,
    bool IsActive,
    string? NewPassword = null
);
