using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixCRMSchemaCase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "Leads",
                schema: "CRM",
                newName: "Leads",
                newSchema: "crm");

            migrationBuilder.RenameTable(
                name: "Customers",
                schema: "CRM",
                newName: "Customers",
                newSchema: "crm");

            migrationBuilder.RenameTable(
                name: "Contacts",
                schema: "CRM",
                newName: "Contacts",
                newSchema: "crm");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "CRM");

            migrationBuilder.RenameTable(
                name: "Leads",
                schema: "crm",
                newName: "Leads",
                newSchema: "CRM");

            migrationBuilder.RenameTable(
                name: "Customers",
                schema: "crm",
                newName: "Customers",
                newSchema: "CRM");

            migrationBuilder.RenameTable(
                name: "Contacts",
                schema: "crm",
                newName: "Contacts",
                newSchema: "CRM");
        }
    }
}
