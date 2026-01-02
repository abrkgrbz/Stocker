using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class LocalDevSetup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DeviceTokens",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: true),
                    Token = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Platform = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    DeviceId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    DeviceName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    DeviceModel = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    OsVersion = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    AppVersion = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Provider = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ProviderToken = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUsedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpiredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReceivePushNotifications = table.Column<bool>(type: "boolean", nullable: false),
                    ReceiveMarketingNotifications = table.Column<bool>(type: "boolean", nullable: false),
                    ReceiveSystemNotifications = table.Column<bool>(type: "boolean", nullable: false),
                    ReceiveCriticalAlerts = table.Column<bool>(type: "boolean", nullable: false),
                    SilentMode = table.Column<bool>(type: "boolean", nullable: false),
                    SilentModeSchedule = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    FailedDeliveryCount = table.Column<int>(type: "integer", nullable: false),
                    LastFailedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastFailureReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceTokens", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MasterNotifications",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Description = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: true),
                    Type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Priority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TargetType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    TargetTenantIds = table.Column<string>(type: "text", nullable: true),
                    TargetPackages = table.Column<string>(type: "text", nullable: true),
                    TargetCountries = table.Column<string>(type: "text", nullable: true),
                    IsGlobal = table.Column<bool>(type: "boolean", nullable: false),
                    SendInApp = table.Column<bool>(type: "boolean", nullable: false),
                    SendEmail = table.Column<bool>(type: "boolean", nullable: false),
                    SendPush = table.Column<bool>(type: "boolean", nullable: false),
                    SendSms = table.Column<bool>(type: "boolean", nullable: false),
                    IconName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IconColor = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    BannerUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ActionUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ActionText = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ActionType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    Actions = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ScheduledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsScheduled = table.Column<bool>(type: "boolean", nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    TotalRecipients = table.Column<int>(type: "integer", nullable: false),
                    DeliveredCount = table.Column<int>(type: "integer", nullable: false),
                    ReadCount = table.Column<int>(type: "integer", nullable: false),
                    FailedCount = table.Column<int>(type: "integer", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UpdatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Metadata = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: true),
                    Tags = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MasterNotifications", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DeviceTokens_DeviceId",
                schema: "master",
                table: "DeviceTokens",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceTokens_IsActive",
                schema: "master",
                table: "DeviceTokens",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceTokens_Platform",
                schema: "master",
                table: "DeviceTokens",
                column: "Platform");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceTokens_TenantId",
                schema: "master",
                table: "DeviceTokens",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceTokens_Token",
                schema: "master",
                table: "DeviceTokens",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeviceTokens_UserId",
                schema: "master",
                table: "DeviceTokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceTokens_UserId_IsActive",
                schema: "master",
                table: "DeviceTokens",
                columns: new[] { "UserId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_MasterNotifications_CreatedAt",
                schema: "master",
                table: "MasterNotifications",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_MasterNotifications_IsGlobal",
                schema: "master",
                table: "MasterNotifications",
                column: "IsGlobal");

            migrationBuilder.CreateIndex(
                name: "IX_MasterNotifications_ScheduledAt",
                schema: "master",
                table: "MasterNotifications",
                column: "ScheduledAt");

            migrationBuilder.CreateIndex(
                name: "IX_MasterNotifications_Status",
                schema: "master",
                table: "MasterNotifications",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_MasterNotifications_Status_ScheduledAt",
                schema: "master",
                table: "MasterNotifications",
                columns: new[] { "Status", "ScheduledAt" });

            migrationBuilder.CreateIndex(
                name: "IX_MasterNotifications_Type",
                schema: "master",
                table: "MasterNotifications",
                column: "Type");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DeviceTokens",
                schema: "master");

            migrationBuilder.DropTable(
                name: "MasterNotifications",
                schema: "master");
        }
    }
}
