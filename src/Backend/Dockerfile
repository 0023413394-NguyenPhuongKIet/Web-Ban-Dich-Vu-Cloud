# ====================================================
# Stage 1: Build & Publish
# ====================================================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution và các project file để cache restore layer
COPY CloudService.sln ./
COPY CloudService.Domain/CloudService.Domain.csproj ./CloudService.Domain/
COPY CloudService.Application/CloudService.Application.csproj ./CloudService.Application/
COPY CloudService.Infrastructure/CloudService.Infrastructure.csproj ./CloudService.Infrastructure/
COPY CloudService.WebApi/CloudService.WebApi.csproj ./CloudService.WebApi/

# Restore NuGet packages
RUN dotnet restore CloudService.sln

# Copy toàn bộ source code
COPY . .

# Build & Publish (Release mode)
RUN dotnet publish CloudService.WebApi/CloudService.WebApi.csproj \
    --configuration Release \
    --output /app/publish \
    /p:UseAppHost=false

# ====================================================
# Stage 2: Runtime (image siêu nhẹ, chỉ có ASP.NET runtime)
# ====================================================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Tạo non-root user để tăng bảo mật
RUN addgroup --system --gid 1001 appgroup \
    && adduser --system --uid 1001 --ingroup appgroup appuser

# Copy artifact từ build stage
COPY --from=build /app/publish .
RUN chown -R appuser:appgroup /app

USER appuser

# Expose port HTTP (không HTTPS trong container, dùng reverse proxy ngoài)
EXPOSE 8080

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "CloudService.WebApi.dll"]
