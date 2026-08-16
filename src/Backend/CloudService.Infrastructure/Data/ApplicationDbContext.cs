using CloudService.Domain.Common;
using CloudService.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CloudService.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<ServiceCategory> ServiceCategories => Set<ServiceCategory>();
    public DbSet<ServicePlan> ServicePlans => Set<ServicePlan>();
    public DbSet<PlanPrice> PlanPrices => Set<PlanPrice>();
    public DbSet<Promotion> Promotions => Set<Promotion>();
    public DbSet<NewsArticle> NewsArticles => Set<NewsArticle>();
    public DbSet<OrderRequest> OrderRequests => Set<OrderRequest>();
    public DbSet<AffiliateApplication> AffiliateApplications => Set<AffiliateApplication>();
    public DbSet<AppUser> AppUsers => Set<AppUser>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ===== Global Query Filter: tự động lọc IsDeleted =====
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                var method = typeof(ApplicationDbContext)
                    .GetMethod(nameof(SetSoftDeleteFilter), System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static)!
                    .MakeGenericMethod(entityType.ClrType);
                method.Invoke(null, new object[] { modelBuilder });
            }
        }

        // ===== ServiceCategory Config =====
        modelBuilder.Entity<ServiceCategory>(entity =>
        {
            entity.HasIndex(c => c.Slug).IsUnique();
            entity.Property(c => c.Name).HasMaxLength(200).IsRequired();
            entity.Property(c => c.Slug).HasMaxLength(200).IsRequired();
        });

        // ===== ServicePlan Config =====
        modelBuilder.Entity<ServicePlan>(entity =>
        {
            entity.Property(p => p.Name).HasMaxLength(200).IsRequired();
            entity.Property(p => p.Code).HasMaxLength(50).IsRequired();

            entity.HasOne(p => p.Category)
                .WithMany(c => c.ServicePlans)
                .HasForeignKey(p => p.ServiceCategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ===== PlanPrice Config =====
        modelBuilder.Entity<PlanPrice>(entity =>
        {
            entity.Property(p => p.OriginalPrice).HasColumnType("decimal(18,2)");
            entity.Property(p => p.SellingPrice).HasColumnType("decimal(18,2)");
            entity.Property(p => p.BillingCycle).HasMaxLength(20).IsRequired();

            // Filtered unique index: chỉ 1 giá hiện hành cho mỗi (PlanId, BillingCycle)
            entity.HasIndex(p => new { p.ServicePlanId, p.BillingCycle, p.IsCurrent })
                .HasFilter("[IsCurrent] = 1 AND [IsDeleted] = 0")
                .IsUnique();

            entity.HasOne(p => p.ServicePlan)
                .WithMany(sp => sp.PlanPrices)
                .HasForeignKey(p => p.ServicePlanId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ===== OrderRequest Config =====
        modelBuilder.Entity<OrderRequest>(entity =>
        {
            entity.Property(p => p.TotalAmount).HasColumnType("decimal(18,2)");
        });

        // ===== NewsArticle Config =====
        modelBuilder.Entity<NewsArticle>(entity =>
        {
            entity.HasOne(n => n.Author)
                .WithMany(u => u.NewsArticles)
                .HasForeignKey(n => n.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    /// <summary>
    /// Áp dụng global query filter IsDeleted cho mọi entity kế thừa BaseEntity.
    /// </summary>
    private static void SetSoftDeleteFilter<TEntity>(ModelBuilder modelBuilder) where TEntity : BaseEntity
    {
        modelBuilder.Entity<TEntity>().HasQueryFilter(e => !e.IsDeleted);
    }
}
