using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class Add2FARateLimiting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TwoFactorFailedAttempts",
                schema: "master",
                table: "MasterUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "TwoFactorLockoutEndAt",
                schema: "master",
                table: "MasterUsers",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TwoFactorFailedAttempts",
                schema: "master",
                table: "MasterUsers");

            migrationBuilder.DropColumn(
                name: "TwoFactorLockoutEndAt",
                schema: "master",
                table: "MasterUsers");
        }
    }
}
