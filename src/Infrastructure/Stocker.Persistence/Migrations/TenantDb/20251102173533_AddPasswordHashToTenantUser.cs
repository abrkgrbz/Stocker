using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.TenantDb
{
    /// <inheritdoc />
    public partial class AddPasswordHashToTenantUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                schema: "tenant",
                table: "TenantUsers",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PasswordHash",
                schema: "tenant",
                table: "TenantUsers");
        }
    }
}
