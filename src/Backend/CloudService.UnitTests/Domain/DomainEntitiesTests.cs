using CloudService.Domain.Entities;
using CloudService.Domain.Exceptions;
using Xunit;

namespace CloudService.UnitTests.Domain;

public class DomainEntitiesTests
{
    [Fact]
    public void NewsArticle_Create_ValidInput_ShouldCreateSuccessfully()
    {
        var article = NewsArticle.Create(
            title: "Hướng dẫn cài đặt Cloud VPS Ubuntu 24.04",
            summary: "Bài viết hướng dẫn chi tiết",
            content: "Nội dung chi tiết về cách cấu hình SSH và UFW Firewall...",
            category: "HDKT",
            authorId: 1,
            thumbnailUrl: "https://example.com/thumb.jpg",
            isPublished: true
        );

        Assert.Equal("Hướng dẫn cài đặt Cloud VPS Ubuntu 24.04", article.Title);
        Assert.Equal("huong-dan-cai-dat-cloud-vps-ubuntu-2404", article.Slug);
        Assert.Equal("HDKT", article.Category);
        Assert.Equal(1, article.AuthorId);
        Assert.True(article.IsPublished);
        Assert.NotNull(article.PublishedAt);
        Assert.Equal(0, article.ViewCount);
    }

    [Theory]
    [InlineData("", "Nội dung", "HDKT")]
    [InlineData("Tiêu đề", "", "HDKT")]
    [InlineData("Tiêu đề", "Nội dung", "")]
    public void NewsArticle_Create_InvalidInputs_ShouldThrowDomainException(string title, string content, string category)
    {
        Assert.Throws<DomainException>(() => NewsArticle.Create(
            title: title,
            summary: "Summary",
            content: content,
            category: category,
            authorId: 1
        ));
    }

    [Fact]
    public void NewsArticle_Update_ShouldUpdatePropertiesAndSlug()
    {
        var article = NewsArticle.Create("Tiêu đề cũ", "Tóm tắt cũ", "Nội dung", "TinTuc", 1);
        article.Update("Tiêu đề mới cập nhật", "Tóm tắt mới", "Nội dung mới", "KhuyenMai", "https://img.jpg", true);

        Assert.Equal("Tiêu đề mới cập nhật", article.Title);
        Assert.Equal("tieu-de-moi-cap-nhat", article.Slug);
        Assert.Equal("Tóm tắt mới", article.Summary);
        Assert.Equal("KhuyenMai", article.Category);
    }

    [Fact]
    public void NewsArticle_IncrementViewCount_ShouldIncreaseByOne()
    {
        var article = NewsArticle.Create("Bài viết", "Tóm tắt", "Nội dung", "TinTuc", 1);
        Assert.Equal(0, article.ViewCount);

        article.IncrementViewCount();
        Assert.Equal(1, article.ViewCount);

        article.IncrementViewCount();
        Assert.Equal(2, article.ViewCount);
    }

    [Fact]
    public void NewsArticle_PublishAndUnpublish_ShouldSwitchStatus()
    {
        var article = NewsArticle.Create("Bài viết", "Tóm tắt", "Nội dung", "TinTuc", 1, isPublished: true);
        Assert.True(article.IsPublished);

        article.Unpublish();
        Assert.False(article.IsPublished);

        article.Publish();
        Assert.True(article.IsPublished);
    }

    [Fact]
    public void ServicePlan_Entity_GettersAndSetters_ShouldWork()
    {
        var plan = new ServicePlan
        {
            Id = 1,
            ServiceCategoryId = 2,
            Name = "Cloud VPS Pro",
            Code = "VPS-PRO-01",
            Description = "Gói máy chủ cao cấp",
            SpecsJson = "{\"cpu\": 4, \"ram\": 8}",
            QrCodeUrl = "https://qr.vietqr.io/...",
            IsFeatured = true,
            IsActive = true
        };

        Assert.Equal(1, plan.Id);
        Assert.Equal(2, plan.ServiceCategoryId);
        Assert.Equal("Cloud VPS Pro", plan.Name);
        Assert.Equal("VPS-PRO-01", plan.Code);
        Assert.True(plan.IsFeatured);
        Assert.True(plan.IsActive);
    }

    [Fact]
    public void OrderRequest_Entity_Properties_ShouldInitializeCorrectly()
    {
        var order = new OrderRequest
        {
            Id = 100,
            OrderCode = "ORD-2026-9999",
            CustomerName = "Nguyễn Phương Kiệt",
            CustomerEmail = "kiet@gmail.com",
            CustomerPhone = "0987654321",
            CompanyName = "Cloud Corp",
            BillingCycle = "1Year",
            TotalAmount = 2400000,
            Status = "Pending",
            Note = "Cần hỗ trợ setup Ubuntu 24.04"
        };

        Assert.Equal("ORD-2026-9999", order.OrderCode);
        Assert.Equal("Nguyễn Phương Kiệt", order.CustomerName);
        Assert.Equal(2400000, order.TotalAmount);
        Assert.Equal("Pending", order.Status);
    }
}
