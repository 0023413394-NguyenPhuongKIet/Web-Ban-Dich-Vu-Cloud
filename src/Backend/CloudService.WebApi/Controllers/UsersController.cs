using System.Security.Claims;
using CloudService.Application.Common.Interfaces;
using CloudService.Application.Common.Models;
using CloudService.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CloudService.WebApi.Controllers;

/// <summary>
/// Controller Qu?n Lý Tài Kho?n Ngu?i Dùng & Phân Quy?n (Dành riêng cho Admin)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IAuthService _authService;

    public UsersController(ApplicationDbContext context, IAuthService authService)
    {
        _context = context;
        _authService = authService;
    }

    /// <summary>
    /// L?y danh sách toàn b? ngu?i dùng trong h? th?ng kèm thông tin vai trò (Role)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] string? search, [FromQuery] string? role, [FromQuery] bool? isActive)
    {
        var query = _context.AppUsers
            .Include(u => u.Role)
            .Where(u => !u.IsDeleted)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(u => u.Username.ToLower().Contains(s) || u.Email.ToLower().Contains(s) || u.FullName.ToLower().Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(role) && role != "ALL")
        {
            query = query.Where(u => u.Role.Name == role);
        }

        if (isActive.HasValue)
        {
            query = query.Where(u => u.IsActive == isActive.Value);
        }

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new UserDto(
                u.Id,
                u.Username,
                u.Email,
                u.FullName,
                u.RoleId,
                u.Role.Name,
                u.IsActive,
                u.CreatedAt
            ))
            .ToListAsync();

        return Ok(users);
    }

    /// <summary>
    /// L?y danh sách các vai trò (Roles) trong h? th?ng
    /// </summary>
    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _context.Roles
            .Where(r => !r.IsDeleted)
            .Select(r => new { r.Id, r.Name, r.Description })
            .ToListAsync();

        return Ok(roles);
    }

    /// <summary>
    /// L?y chi ti?t m?t tài kho?n theo Id
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        var user = await _context.AppUsers
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);

        if (user == null)
        {
            return NotFound(new { Message = "Không tìm th?y ngu?i dùng." });
        }

        return Ok(new UserDto(
            user.Id,
            user.Username,
            user.Email,
            user.FullName,
            user.RoleId,
            user.Role.Name,
            user.IsActive,
            user.CreatedAt
        ));
    }

    /// <summary>
    /// T?o tài kho?n ngu?i dùng m?i t? phía Qu?n tr? viên
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { Message = "Tên dang nh?p và m?t kh?u là b?t bu?c." });
        }

        var usernameClean = request.Username.Trim();
        var emailClean = request.Email.Trim().ToLowerInvariant();

        var existingUser = await _context.AppUsers
            .FirstOrDefaultAsync(u => (u.Username.ToLower() == usernameClean.ToLower() || u.Email.ToLower() == emailClean) && !u.IsDeleted);

        if (existingUser != null)
        {
            return BadRequest(new { Message = "Tên dang nh?p ho?c email này dã t?n t?i trên h? th?ng." });
        }

        var role = await _context.Roles.FindAsync(request.RoleId);
        if (role == null)
        {
            return BadRequest(new { Message = "Vai trò (Role) không h?p l?." });
        }

        var newUser = new Domain.Entities.AppUser
        {
            Username = usernameClean,
            Email = emailClean,
            PasswordHash = _authService.HashPassword(request.Password),
            FullName = string.IsNullOrWhiteSpace(request.FullName) ? usernameClean : request.FullName.Trim(),
            RoleId = request.RoleId,
            IsActive = request.IsActive,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.AppUsers.Add(newUser);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUserById), new { id = newUser.Id }, new UserDto(
            newUser.Id,
            newUser.Username,
            newUser.Email,
            newUser.FullName,
            newUser.RoleId,
            role.Name,
            newUser.IsActive,
            newUser.CreatedAt
        ));
    }

    /// <summary>
    /// C?p nh?t thông tin tài kho?n, vai trò ho?c d?i m?t kh?u cho ngu?i dùng
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequestDto request)
    {
        var user = await _context.AppUsers
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);

        if (user == null)
        {
            return NotFound(new { Message = "Không tìm th?y ngu?i dùng." });
        }

        var emailClean = request.Email.Trim().ToLowerInvariant();

        // Ki?m tra trùng email v?i tài kho?n khác
        var duplicateEmail = await _context.AppUsers
            .AnyAsync(u => u.Email.ToLower() == emailClean && u.Id != id && !u.IsDeleted);

        if (duplicateEmail)
        {
            return BadRequest(new { Message = "Ð?a ch? email này dã du?c s? d?ng b?i tài kho?n khác." });
        }

        var role = await _context.Roles.FindAsync(request.RoleId);
        if (role == null)
        {
            return BadRequest(new { Message = "Vai trò (Role) không h?p l?." });
        }

        user.Email = emailClean;
        user.FullName = request.FullName.Trim();
        user.RoleId = request.RoleId;
        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            user.PasswordHash = _authService.HashPassword(request.NewPassword);
        }

        await _context.SaveChangesAsync();

        return Ok(new UserDto(
            user.Id,
            user.Username,
            user.Email,
            user.FullName,
            user.RoleId,
            role.Name,
            user.IsActive,
            user.CreatedAt
        ));
    }

    /// <summary>
    /// Xóa tài kho?n ngu?i dùng (Soft Delete)
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(currentUserIdClaim, out int currentUserId) && currentUserId == id)
        {
            return BadRequest(new { Message = "B?n không th? t? xóa tài kho?n dang dang nh?p c?a chính mình." });
        }

        var user = await _context.AppUsers.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
        if (user == null)
        {
            return NotFound(new { Message = "Không tìm th?y ngu?i dùng." });
        }

        user.IsDeleted = true;
        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Ðã xóa ngu?i dùng thành công." });
    }
}
