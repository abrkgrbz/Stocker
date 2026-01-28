using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.TenantDb
{
    /// <inheritdoc />
    public partial class AddBackupCodesToTenantUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "PasswordResetToken",
                schema: "tenant",
                table: "TenantUsers",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PasswordHash",
                schema: "tenant",
                table: "TenantUsers",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256);

            migrationBuilder.AddColumn<string>(
                name: "BackupCodes",
                schema: "tenant",
                table: "TenantUsers",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FailedLoginAttempts",
                schema: "tenant",
                table: "TenantUsers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "LockoutEndAt",
                schema: "tenant",
                table: "TenantUsers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RefreshToken",
                schema: "tenant",
                table: "TenantUsers",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RefreshTokenExpiryTime",
                schema: "tenant",
                table: "TenantUsers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "TwoFactorEnabled",
                schema: "tenant",
                table: "TenantUsers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "TwoFactorFailedAttempts",
                schema: "tenant",
                table: "TenantUsers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "TwoFactorLockoutEndAt",
                schema: "tenant",
                table: "TenantUsers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TwoFactorSecret",
                schema: "tenant",
                table: "TenantUsers",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BackupCodes",
                schema: "tenant",
                table: "TenantUsers");

            migrationBuilder.DropColumn(
                name: "FailedLoginAttempts",
                schema: "tenant",
                table: "TenantUsers");

            migrationBuilder.DropColumn(
                name: "LockoutEndAt",
                schema: "tenant",
                table: "TenantUsers");

            migrationBuilder.DropColumn(
                name: "RefreshToken",
                schema: "tenant",
                table: "TenantUsers");

            migrationBuilder.DropColumn(
                name: "RefreshTokenExpiryTime",
                schema: "tenant",
                table: "TenantUsers");

            migrationBuilder.DropColumn(
                name: "TwoFactorEnabled",
                schema: "tenant",
                table: "TenantUsers");

            migrationBuilder.DropColumn(
                name: "TwoFactorFailedAttempts",
                schema: "tenant",
                table: "TenantUsers");

            migrationBuilder.DropColumn(
                name: "TwoFactorLockoutEndAt",
                schema: "tenant",
                table: "TenantUsers");

            migrationBuilder.DropColumn(
                name: "TwoFactorSecret",
                schema: "tenant",
                table: "TenantUsers");

            migrationBuilder.AlterColumn<string>(
                name: "PasswordResetToken",
                schema: "tenant",
                table: "TenantUsers",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PasswordHash",
                schema: "tenant",
                table: "TenantUsers",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);
        }
    }
}
