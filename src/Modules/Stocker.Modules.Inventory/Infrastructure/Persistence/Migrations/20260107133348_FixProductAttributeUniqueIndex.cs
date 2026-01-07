using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixProductAttributeUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProductAttributes_TenantId_Code",
                schema: "inventory",
                table: "ProductAttributes");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributes_TenantId_Code",
                schema: "inventory",
                table: "ProductAttributes",
                columns: new[] { "TenantId", "Code" },
                unique: true,
                filter: "\"IsDeleted\" = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProductAttributes_TenantId_Code",
                schema: "inventory",
                table: "ProductAttributes");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributes_TenantId_Code",
                schema: "inventory",
                table: "ProductAttributes",
                columns: new[] { "TenantId", "Code" },
                unique: true);
        }
    }
}
