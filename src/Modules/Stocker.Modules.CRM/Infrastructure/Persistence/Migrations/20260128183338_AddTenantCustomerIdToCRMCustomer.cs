using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantCustomerIdToCRMCustomer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "TenantCustomerId",
                schema: "crm",
                table: "Customers",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Customers_TenantId_TenantCustomerId",
                schema: "crm",
                table: "Customers",
                columns: new[] { "TenantId", "TenantCustomerId" },
                unique: true,
                filter: "\"TenantCustomerId\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Customers_TenantId_TenantCustomerId",
                schema: "crm",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "TenantCustomerId",
                schema: "crm",
                table: "Customers");
        }
    }
}
