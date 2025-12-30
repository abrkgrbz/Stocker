using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class AddLemonSqueezySubscriptionNewColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomerEmail",
                schema: "master",
                table: "LemonSqueezySubscriptions",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ProductName",
                schema: "master",
                table: "LemonSqueezySubscriptions",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VariantName",
                schema: "master",
                table: "LemonSqueezySubscriptions",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_LemonSqueezySubscriptions_Tenants_TenantId",
                schema: "master",
                table: "LemonSqueezySubscriptions",
                column: "TenantId",
                principalSchema: "master",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LemonSqueezySubscriptions_Tenants_TenantId",
                schema: "master",
                table: "LemonSqueezySubscriptions");

            migrationBuilder.DropColumn(
                name: "CustomerEmail",
                schema: "master",
                table: "LemonSqueezySubscriptions");

            migrationBuilder.DropColumn(
                name: "ProductName",
                schema: "master",
                table: "LemonSqueezySubscriptions");

            migrationBuilder.DropColumn(
                name: "VariantName",
                schema: "master",
                table: "LemonSqueezySubscriptions");
        }
    }
}
