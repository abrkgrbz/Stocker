using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class AddSubscriptionStorageFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomAddOnCodes",
                schema: "master",
                table: "Subscriptions",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomModuleCodes",
                schema: "master",
                table: "Subscriptions",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomStoragePlanCode",
                schema: "master",
                table: "Subscriptions",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StorageBucketName",
                schema: "master",
                table: "Subscriptions",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "StorageLastCheckedAt",
                schema: "master",
                table: "Subscriptions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "StorageQuotaGB",
                schema: "master",
                table: "Subscriptions",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "StorageUsedBytes",
                schema: "master",
                table: "Subscriptions",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomAddOnCodes",
                schema: "master",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "CustomModuleCodes",
                schema: "master",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "CustomStoragePlanCode",
                schema: "master",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "StorageBucketName",
                schema: "master",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "StorageLastCheckedAt",
                schema: "master",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "StorageQuotaGB",
                schema: "master",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "StorageUsedBytes",
                schema: "master",
                table: "Subscriptions");
        }
    }
}
