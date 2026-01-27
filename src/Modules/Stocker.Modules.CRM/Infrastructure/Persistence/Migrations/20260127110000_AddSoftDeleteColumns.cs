using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add soft delete columns to Customers table
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "crm",
                table: "Customers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "crm",
                table: "Customers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "crm",
                table: "Customers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Add soft delete columns to Contacts table
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "crm",
                table: "Contacts",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "crm",
                table: "Contacts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "crm",
                table: "Contacts",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Add soft delete columns to Leads table
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "crm",
                table: "Leads",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "crm",
                table: "Leads",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "crm",
                table: "Leads",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Add soft delete columns to Accounts table
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "crm",
                table: "Accounts",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "crm",
                table: "Accounts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "crm",
                table: "Accounts",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Add soft delete columns to Opportunities table
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "crm",
                table: "Opportunities",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "crm",
                table: "Opportunities",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "crm",
                table: "Opportunities",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Add soft delete columns to Deals table
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "crm",
                table: "Deals",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "crm",
                table: "Deals",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "crm",
                table: "Deals",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Add soft delete columns to Activities table
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "crm",
                table: "Activities",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "crm",
                table: "Activities",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "crm",
                table: "Activities",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Add soft delete columns to Notes table
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "crm",
                table: "Notes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "crm",
                table: "Notes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "crm",
                table: "Notes",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Add soft delete columns to Campaigns table
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "crm",
                table: "Campaigns",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "crm",
                table: "Campaigns",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "crm",
                table: "Campaigns",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Add soft delete columns to Pipelines table
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "crm",
                table: "Pipelines",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "crm",
                table: "Pipelines",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "crm",
                table: "Pipelines",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Add soft delete columns to CustomerSegments table
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "crm",
                table: "CustomerSegments",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "crm",
                table: "CustomerSegments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "crm",
                table: "CustomerSegments",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Add soft delete columns to Workflows table
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "crm",
                table: "Workflows",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "crm",
                table: "Workflows",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "crm",
                table: "Workflows",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Add soft delete columns to Contracts table
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "crm",
                table: "Contracts",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "crm",
                table: "Contracts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "crm",
                table: "Contracts",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Add soft delete columns to Quotes table
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "crm",
                table: "Quotes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "crm",
                table: "Quotes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "crm",
                table: "Quotes",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Add soft delete columns to Tickets table
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "crm",
                table: "Tickets",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "crm",
                table: "Tickets",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "crm",
                table: "Tickets",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Add soft delete columns to SalesTeams table
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "crm",
                table: "SalesTeams",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "crm",
                table: "SalesTeams",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "crm",
                table: "SalesTeams",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Add soft delete columns to Territories table
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "crm",
                table: "Territories",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "crm",
                table: "Territories",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "crm",
                table: "Territories",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Add soft delete columns to Competitors table
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "crm",
                table: "Competitors",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "crm",
                table: "Competitors",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "crm",
                table: "Competitors",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Add soft delete columns to LoyaltyPrograms table
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "crm",
                table: "LoyaltyPrograms",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "crm",
                table: "LoyaltyPrograms",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "crm",
                table: "LoyaltyPrograms",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Add indexes for soft delete queries on main entities
            migrationBuilder.CreateIndex(
                name: "IX_Customers_IsDeleted",
                schema: "crm",
                table: "Customers",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_IsDeleted",
                schema: "crm",
                table: "Contacts",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Leads_IsDeleted",
                schema: "crm",
                table: "Leads",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_IsDeleted",
                schema: "crm",
                table: "Opportunities",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Deals_IsDeleted",
                schema: "crm",
                table: "Deals",
                column: "IsDeleted");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop indexes
            migrationBuilder.DropIndex(name: "IX_Deals_IsDeleted", schema: "crm", table: "Deals");
            migrationBuilder.DropIndex(name: "IX_Opportunities_IsDeleted", schema: "crm", table: "Opportunities");
            migrationBuilder.DropIndex(name: "IX_Leads_IsDeleted", schema: "crm", table: "Leads");
            migrationBuilder.DropIndex(name: "IX_Contacts_IsDeleted", schema: "crm", table: "Contacts");
            migrationBuilder.DropIndex(name: "IX_Customers_IsDeleted", schema: "crm", table: "Customers");

            // Drop columns from all tables
            var tables = new[] { "Customers", "Contacts", "Leads", "Accounts", "Opportunities", "Deals",
                "Activities", "Notes", "Campaigns", "Pipelines", "CustomerSegments", "Workflows",
                "Contracts", "Quotes", "Tickets", "SalesTeams", "Territories", "Competitors", "LoyaltyPrograms" };

            foreach (var table in tables)
            {
                migrationBuilder.DropColumn(name: "IsDeleted", schema: "crm", table: table);
                migrationBuilder.DropColumn(name: "DeletedAt", schema: "crm", table: table);
                migrationBuilder.DropColumn(name: "DeletedBy", schema: "crm", table: table);
            }
        }
    }
}
