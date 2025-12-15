using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class AddTenantSecureConnectionStringFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CredentialsRotateAfter",
                schema: "master",
                table: "Tenants",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DatabaseUsername",
                schema: "master",
                table: "Tenants",
                type: "character varying(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EncryptedConnectionString",
                schema: "master",
                table: "Tenants",
                type: "character varying(2048)",
                maxLength: 2048,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CredentialsRotateAfter",
                schema: "master",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "DatabaseUsername",
                schema: "master",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "EncryptedConnectionString",
                schema: "master",
                table: "Tenants");
        }
    }
}
