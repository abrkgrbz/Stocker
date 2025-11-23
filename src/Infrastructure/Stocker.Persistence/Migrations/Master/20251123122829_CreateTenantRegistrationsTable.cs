using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class CreateTenantRegistrationsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "TenantRegistrations",
                schema: "Master",
                newName: "TenantRegistrations",
                newSchema: "master");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "TenantRegistrations",
                schema: "master",
                newName: "TenantRegistrations",
                newSchema: "Master");
        }
    }
}
