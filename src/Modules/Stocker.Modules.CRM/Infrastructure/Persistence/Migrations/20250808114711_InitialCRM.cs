using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCRM : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "CRM");

            migrationBuilder.CreateTable(
                name: "Customers",
                schema: "CRM",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Website = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Industry = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    State = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PostalCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    AnnualRevenue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    NumberOfEmployees = table.Column<int>(type: "int", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Leads",
                schema: "CRM",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    MobilePhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    JobTitle = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Industry = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Source = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Rating = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    State = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PostalCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Website = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    AnnualRevenue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    NumberOfEmployees = table.Column<int>(type: "int", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    AssignedToUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ConvertedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ConvertedToCustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Score = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Leads", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Contacts",
                schema: "CRM",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    MobilePhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    JobTitle = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Department = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contacts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Contacts_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalSchema: "CRM",
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_CustomerId",
                schema: "CRM",
                table: "Contacts",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_TenantId",
                schema: "CRM",
                table: "Contacts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_TenantId_CustomerId",
                schema: "CRM",
                table: "Contacts",
                columns: new[] { "TenantId", "CustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_TenantId_CustomerId_IsPrimary",
                schema: "CRM",
                table: "Contacts",
                columns: new[] { "TenantId", "CustomerId", "IsPrimary" });

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_TenantId_Email",
                schema: "CRM",
                table: "Contacts",
                columns: new[] { "TenantId", "Email" });

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_TenantId_IsActive",
                schema: "CRM",
                table: "Contacts",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Customers_TenantId",
                schema: "CRM",
                table: "Customers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_TenantId_CompanyName",
                schema: "CRM",
                table: "Customers",
                columns: new[] { "TenantId", "CompanyName" });

            migrationBuilder.CreateIndex(
                name: "IX_Customers_TenantId_Email",
                schema: "CRM",
                table: "Customers",
                columns: new[] { "TenantId", "Email" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Customers_TenantId_IsActive",
                schema: "CRM",
                table: "Customers",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Leads_TenantId",
                schema: "CRM",
                table: "Leads",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Leads_TenantId_AssignedToUserId",
                schema: "CRM",
                table: "Leads",
                columns: new[] { "TenantId", "AssignedToUserId" });

            migrationBuilder.CreateIndex(
                name: "IX_Leads_TenantId_ConvertedToCustomerId",
                schema: "CRM",
                table: "Leads",
                columns: new[] { "TenantId", "ConvertedToCustomerId" });

            migrationBuilder.CreateIndex(
                name: "IX_Leads_TenantId_Email",
                schema: "CRM",
                table: "Leads",
                columns: new[] { "TenantId", "Email" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Leads_TenantId_Rating",
                schema: "CRM",
                table: "Leads",
                columns: new[] { "TenantId", "Rating" });

            migrationBuilder.CreateIndex(
                name: "IX_Leads_TenantId_Score",
                schema: "CRM",
                table: "Leads",
                columns: new[] { "TenantId", "Score" });

            migrationBuilder.CreateIndex(
                name: "IX_Leads_TenantId_Status",
                schema: "CRM",
                table: "Leads",
                columns: new[] { "TenantId", "Status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Contacts",
                schema: "CRM");

            migrationBuilder.DropTable(
                name: "Leads",
                schema: "CRM");

            migrationBuilder.DropTable(
                name: "Customers",
                schema: "CRM");
        }
    }
}
