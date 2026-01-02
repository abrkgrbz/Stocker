using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <summary>
    /// Adds LemonSqueezy integration fields to Package table.
    /// These fields allow mapping between our packages and LemonSqueezy products/variants.
    /// </summary>
    public partial class AddLemonSqueezyFieldsToPackage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LemonSqueezyProductId",
                schema: "master",
                table: "Packages",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LemonSqueezyVariantId",
                schema: "master",
                table: "Packages",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Create index on LemonSqueezyVariantId for faster lookups
            migrationBuilder.CreateIndex(
                name: "IX_Packages_LemonSqueezyVariantId",
                schema: "master",
                table: "Packages",
                column: "LemonSqueezyVariantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Packages_LemonSqueezyVariantId",
                schema: "master",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "LemonSqueezyProductId",
                schema: "master",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "LemonSqueezyVariantId",
                schema: "master",
                table: "Packages");
        }
    }
}
