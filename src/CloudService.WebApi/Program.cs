using System.Text;
using CloudService.Application;
using CloudService.Infrastructure;
using CloudService.Infrastructure.Data;
using CloudService.WebApi.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add Layered Services (Clean Architecture DI)
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// Configure JWT Authentication Middleware (Yêu cầu đề bài 2.1)
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "SUPER_SECRET_KEY_FOR_CLOUD_SERVICE_PROJECT_IN4211_2026_SOFWARE_ARCHITECTURE";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "CloudServiceAPI",
        ValidAudience = jwtSettings["Audience"] ?? "CloudServiceApp",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

builder.Services.AddAuthorization();

// Add Controllers & Swagger Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "Cloud Service API", Version = "v1" });

    // Cấu hình Nút nhập Token Authorization (Bearer <JWT>) trên Giao diện Swagger UI
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "Nhập 'Bearer {chuỗi_JWT_Token_của_bạn}' vào ô bên dưới",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ── Tự động seed dữ liệu mẫu (Role + Admin/Editor) khi khởi động ──────────
// Chạy một lần khi app start, idempotent (an toàn nếu chạy lại nhiều lần)
await DatabaseSeeder.SeedAsync(app.Services);

// Configure HTTP Request Pipeline

// Global Exception Handling (ProblemDetails RFC 7807)
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Cloud Service API v1");
    });
}

app.UseHttpsRedirection();
app.UseAuthentication(); // Bắt buộc đặt trước UseAuthorization()
app.UseAuthorization();
app.MapControllers();

app.Run();
