using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.HR.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantDepartmentIdToHRDepartment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "TenantDepartmentId",
                schema: "hr",
                table: "Departments",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Departments_TenantId_TenantDepartmentId",
                schema: "hr",
                table: "Departments",
                columns: new[] { "TenantId", "TenantDepartmentId" },
                unique: true,
                filter: "\"TenantDepartmentId\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Departments_TenantId_TenantDepartmentId",
                schema: "hr",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "TenantDepartmentId",
                schema: "hr",
                table: "Departments");
        }
    }
}
