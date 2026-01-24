using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ChangeQuotationItemProductIdToInt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_QuotationItems_ProductId",
                schema: "sales",
                table: "QuotationItems");

            migrationBuilder.DropColumn(
                name: "ProductId",
                schema: "sales",
                table: "QuotationItems");

            migrationBuilder.AddColumn<int>(
                name: "ProductId",
                schema: "sales",
                table: "QuotationItems",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_QuotationItems_ProductId",
                schema: "sales",
                table: "QuotationItems",
                column: "ProductId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "ProductId",
                schema: "sales",
                table: "QuotationItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);
        }
    }
}
