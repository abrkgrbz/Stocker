using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerKvkkFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "KvkkCommunicationConsent",
                schema: "crm",
                table: "Customers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "KvkkConsentDate",
                schema: "crm",
                table: "Customers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "KvkkDataProcessingConsent",
                schema: "crm",
                table: "Customers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "KvkkMarketingConsent",
                schema: "crm",
                table: "Customers",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "KvkkCommunicationConsent",
                schema: "crm",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "KvkkConsentDate",
                schema: "crm",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "KvkkDataProcessingConsent",
                schema: "crm",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "KvkkMarketingConsent",
                schema: "crm",
                table: "Customers");
        }
    }
}
