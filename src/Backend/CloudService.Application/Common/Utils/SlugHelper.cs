using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace CloudService.Application.Common.Utils;

/// <summary>
/// Tiện ích chuyển đổi văn bản Tiếng Việt thành Slug thân thiện SEO.
/// Dùng chung cho tất cả các Entities có Slug (ServiceCategory, NewsArticle...).
/// </summary>
public static class SlugHelper
{
    /// <summary>
    /// Thuật toán tạo Slug chuẩn SEO từ chuỗi văn bản tiếng Việt có dấu.
    /// Ví dụ: "Cloud VPS Tốc Độ Cao!" -> "cloud-vps-toc-do-cao"
    /// </summary>
    public static string GenerateSlug(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return string.Empty;

        // 1. Chuyển chữ thường
        var normalized = text.Trim().ToLowerInvariant();

        // 2. Chuyển ký tự 'đ' sang 'd' (không bị xử lý bởi Unicode normalization)
        normalized = normalized.Replace("đ", "d").Replace("Đ", "d");

        // 3. Tách dấu thanh tiếng Việt bằng Unicode Normalization (FormD)
        var formD = normalized.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();
        foreach (var ch in formD)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(ch) != UnicodeCategory.NonSpacingMark)
                sb.Append(ch);
        }

        // 4. Chuẩn hóa về FormC và xóa ký tự đặc biệt
        var clean = sb.ToString().Normalize(NormalizationForm.FormC);
        clean = Regex.Replace(clean, @"[^a-z0-9\s-]", "");

        // 5. Chuyển khoảng trắng và nhiều gạch ngang liên tiếp thành một dấu '-'
        clean = Regex.Replace(clean, @"[\s-]+", " ").Trim();
        clean = Regex.Replace(clean, @"\s", "-");

        return clean;
    }
}
