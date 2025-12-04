using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddProductDimensionUnit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_Units_UnitId",
                schema: "inventory",
                table: "Products");

            migrationBuilder.AlterColumn<int>(
                name: "UnitId",
                schema: "inventory",
                table: "Products",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DimensionUnit",
                schema: "inventory",
                table: "Products",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Height",
                schema: "inventory",
                table: "Products",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LeadTimeDays",
                schema: "inventory",
                table: "Products",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "Length",
                schema: "inventory",
                table: "Products",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ProductType",
                schema: "inventory",
                table: "Products",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "ReorderQuantity",
                schema: "inventory",
                table: "Products",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "SKU",
                schema: "inventory",
                table: "Products",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UnitId1",
                schema: "inventory",
                table: "Products",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Weight",
                schema: "inventory",
                table: "Products",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WeightUnit",
                schema: "inventory",
                table: "Products",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Width",
                schema: "inventory",
                table: "Products",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Products_TenantId_SKU",
                schema: "inventory",
                table: "Products",
                columns: new[] { "TenantId", "SKU" },
                unique: true,
                filter: "\"SKU\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Products_UnitId1",
                schema: "inventory",
                table: "Products",
                column: "UnitId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Units_UnitId",
                schema: "inventory",
                table: "Products",
                column: "UnitId",
                principalSchema: "inventory",
                principalTable: "Units",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Units_UnitId1",
                schema: "inventory",
                table: "Products",
                column: "UnitId1",
                principalSchema: "inventory",
                principalTable: "Units",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_Units_UnitId",
                schema: "inventory",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Units_UnitId1",
                schema: "inventory",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_TenantId_SKU",
                schema: "inventory",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_UnitId1",
                schema: "inventory",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "DimensionUnit",
                schema: "inventory",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Height",
                schema: "inventory",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "LeadTimeDays",
                schema: "inventory",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Length",
                schema: "inventory",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "ProductType",
                schema: "inventory",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "ReorderQuantity",
                schema: "inventory",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "SKU",
                schema: "inventory",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "UnitId1",
                schema: "inventory",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Weight",
                schema: "inventory",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "WeightUnit",
                schema: "inventory",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Width",
                schema: "inventory",
                table: "Products");

            migrationBuilder.AlterColumn<int>(
                name: "UnitId",
                schema: "inventory",
                table: "Products",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Units_UnitId",
                schema: "inventory",
                table: "Products",
                column: "UnitId",
                principalSchema: "inventory",
                principalTable: "Units",
                principalColumn: "Id");
        }
    }
}
