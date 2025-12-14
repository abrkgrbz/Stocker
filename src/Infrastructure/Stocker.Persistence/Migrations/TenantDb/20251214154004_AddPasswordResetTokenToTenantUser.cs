using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.TenantDb
{
    /// <inheritdoc />
    public partial class AddPasswordResetTokenToTenantUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PasswordResetToken",
                schema: "tenant",
                table: "TenantUsers",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PasswordResetTokenExpiry",
                schema: "tenant",
                table: "TenantUsers",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PasswordResetToken",
                schema: "tenant",
                table: "TenantUsers");

            migrationBuilder.DropColumn(
                name: "PasswordResetTokenExpiry",
                schema: "tenant",
                table: "TenantUsers");
        }
    }
}
