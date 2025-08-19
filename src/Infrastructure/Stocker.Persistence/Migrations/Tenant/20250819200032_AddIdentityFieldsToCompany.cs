using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Tenant
{
    /// <inheritdoc />
    public partial class AddIdentityFieldsToCompany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IdentityNumber",
                schema: "tenant",
                table: "Companies",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IdentityType",
                schema: "tenant",
                table: "Companies",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IdentityNumber",
                schema: "tenant",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "IdentityType",
                schema: "tenant",
                table: "Companies");
        }
    }
}
