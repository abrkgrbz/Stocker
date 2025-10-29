using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerFinancialFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContactPerson",
                schema: "CRM",
                table: "Customers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CreditLimit",
                schema: "CRM",
                table: "Customers",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "CustomerType",
                schema: "CRM",
                table: "Customers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PaymentTerms",
                schema: "CRM",
                table: "Customers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                schema: "CRM",
                table: "Customers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TaxId",
                schema: "CRM",
                table: "Customers",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContactPerson",
                schema: "CRM",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "CreditLimit",
                schema: "CRM",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "CustomerType",
                schema: "CRM",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "PaymentTerms",
                schema: "CRM",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "Status",
                schema: "CRM",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "TaxId",
                schema: "CRM",
                table: "Customers");
        }
    }
}
