using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "OrderRequests",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "OrderCode",
                table: "OrderRequests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Quantity",
                table: "OrderRequests",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "OrderRequests",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<int>(
                name: "UserId1",
                table: "OrderRequests",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderRequests_UserId1",
                table: "OrderRequests",
                column: "UserId1");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderRequests_AppUsers_UserId1",
                table: "OrderRequests",
                column: "UserId1",
                principalTable: "AppUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderRequests_AppUsers_UserId1",
                table: "OrderRequests");

            migrationBuilder.DropIndex(
                name: "IX_OrderRequests_UserId1",
                table: "OrderRequests");

            migrationBuilder.DropColumn(
                name: "OrderCode",
                table: "OrderRequests");

            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "OrderRequests");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "OrderRequests");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "OrderRequests");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "OrderRequests",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");
        }
    }
}
