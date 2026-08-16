namespace CloudService.Application.Common.Interfaces;

/// <summary>
/// Interface cho dịch vụ JWT Authentication & Password Hashing (SOLID: Dependency Inversion Principle)
/// Tầng Application định nghĩa Interface, tầng Infrastructure sẽ cài đặt thực tế.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Mã hóa mật khẩu bằng thuật toán BCrypt (Yêu cầu đề bài: Bcrypt/PBKDF2)
    /// </summary>
    string HashPassword(string password);

    /// <summary>
    /// Kiểm tra mật khẩu nhập vào có khớp với chuỗi mã hóa BCrypt trong CSDL không
    /// </summary>
    bool VerifyPassword(string password, string hashedPassword);

    /// <summary>
    /// Tạo Access Token (JWT) chứa Claims thông tin người dùng và Vai trò (Role Admin/Editor)
    /// </summary>
    string GenerateJwtToken(int userId, string username, string email, string role);

    /// <summary>
    /// Tạo chuỗi Refresh Token ngẫu nhiên có tính bảo mật cao
    /// </summary>
    string GenerateRefreshToken();
}
