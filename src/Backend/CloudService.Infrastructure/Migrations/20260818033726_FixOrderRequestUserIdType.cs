using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixOrderRequestUserIdType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop the shadow FK/index/column that EF created incorrectly
            migrationBuilder.DropForeignKey(
                name: "FK_OrderRequests_AppUsers_UserId1",
                table: "OrderRequests");

            migrationBuilder.DropIndex(
                name: "IX_OrderRequests_UserId1",
                table: "OrderRequests");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "OrderRequests");

            // SQL Server cannot ALTER COLUMN uniqueidentifier -> int directly.
            // Use raw SQL to drop and recreate the column.
            // First drop any default constraint on the column, then drop the column.
            migrationBuilder.Sql(@"
                DECLARE @constraintName NVARCHAR(256);
                SELECT @constraintName = d.name
                FROM sys.default_constraints d
                INNER JOIN sys.columns c ON d.parent_column_id = c.column_id AND d.parent_object_id = c.object_id
                WHERE d.parent_object_id = OBJECT_ID(N'[OrderRequests]') AND c.name = N'UserId';
                IF @constraintName IS NOT NULL
                    EXEC(N'ALTER TABLE [OrderRequests] DROP CONSTRAINT [' + @constraintName + '];');
                ALTER TABLE [OrderRequests] DROP COLUMN [UserId];
            ");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "OrderRequests",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_OrderRequests_UserId",
                table: "OrderRequests",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderRequests_AppUsers_UserId",
                table: "OrderRequests",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderRequests_AppUsers_UserId",
                table: "OrderRequests");

            migrationBuilder.DropIndex(
                name: "IX_OrderRequests_UserId",
                table: "OrderRequests");

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                table: "OrderRequests",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

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
    }
}
