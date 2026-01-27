using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add soft delete columns to Quotations table
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "Quotations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "Quotations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "Quotations",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Add soft delete columns to SalesOrders table
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "SalesOrders",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "SalesOrders",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "SalesOrders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Add soft delete columns to QuotationItems table
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "QuotationItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "QuotationItems",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "QuotationItems",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Add soft delete columns to SalesOrderItems table
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "sales",
                table: "SalesOrderItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "sales",
                table: "SalesOrderItems",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "sales",
                table: "SalesOrderItems",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Add index for soft delete queries
            migrationBuilder.CreateIndex(
                name: "IX_Quotations_IsDeleted",
                schema: "sales",
                table: "Quotations",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_SalesOrders_IsDeleted",
                schema: "sales",
                table: "SalesOrders",
                column: "IsDeleted");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SalesOrders_IsDeleted",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropIndex(
                name: "IX_Quotations_IsDeleted",
                schema: "sales",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "SalesOrderItems");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "SalesOrderItems");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "SalesOrderItems");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "QuotationItems");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "QuotationItems");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "QuotationItems");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "sales",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "sales",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "sales",
                table: "Quotations");
        }
    }
}
