using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPriceHistoryFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PlanPrices_ServicePlans_ServicePlanId",
                table: "PlanPrices");

            migrationBuilder.DropForeignKey(
                name: "FK_ServicePlans_ServiceCategories_ServiceCategoryId",
                table: "ServicePlans");

            migrationBuilder.DropIndex(
                name: "IX_PlanPrices_ServicePlanId",
                table: "PlanPrices");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "ServicePlans",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "ServicePlans",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Slug",
                table: "ServiceCategories",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "ServiceCategories",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "BillingCycle",
                table: "PlanPrices",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<DateTime>(
                name: "EffectiveDate",
                table: "PlanPrices",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsCurrent",
                table: "PlanPrices",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceCategories_Slug",
                table: "ServiceCategories",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlanPrices_ServicePlanId_BillingCycle_IsCurrent",
                table: "PlanPrices",
                columns: new[] { "ServicePlanId", "BillingCycle", "IsCurrent" },
                unique: true,
                filter: "[IsCurrent] = 1 AND [IsDeleted] = 0");

            migrationBuilder.AddForeignKey(
                name: "FK_PlanPrices_ServicePlans_ServicePlanId",
                table: "PlanPrices",
                column: "ServicePlanId",
                principalTable: "ServicePlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ServicePlans_ServiceCategories_ServiceCategoryId",
                table: "ServicePlans",
                column: "ServiceCategoryId",
                principalTable: "ServiceCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PlanPrices_ServicePlans_ServicePlanId",
                table: "PlanPrices");

            migrationBuilder.DropForeignKey(
                name: "FK_ServicePlans_ServiceCategories_ServiceCategoryId",
                table: "ServicePlans");

            migrationBuilder.DropIndex(
                name: "IX_ServiceCategories_Slug",
                table: "ServiceCategories");

            migrationBuilder.DropIndex(
                name: "IX_PlanPrices_ServicePlanId_BillingCycle_IsCurrent",
                table: "PlanPrices");

            migrationBuilder.DropColumn(
                name: "EffectiveDate",
                table: "PlanPrices");

            migrationBuilder.DropColumn(
                name: "IsCurrent",
                table: "PlanPrices");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "ServicePlans",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "ServicePlans",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Slug",
                table: "ServiceCategories",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "ServiceCategories",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "BillingCycle",
                table: "PlanPrices",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.CreateIndex(
                name: "IX_PlanPrices_ServicePlanId",
                table: "PlanPrices",
                column: "ServicePlanId");

            migrationBuilder.AddForeignKey(
                name: "FK_PlanPrices_ServicePlans_ServicePlanId",
                table: "PlanPrices",
                column: "ServicePlanId",
                principalTable: "ServicePlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ServicePlans_ServiceCategories_ServiceCategoryId",
                table: "ServicePlans",
                column: "ServiceCategoryId",
                principalTable: "ServiceCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
