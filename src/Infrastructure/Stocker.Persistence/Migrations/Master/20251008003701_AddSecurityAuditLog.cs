using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class AddSecurityAuditLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminPasswordHash",
                schema: "Master",
                table: "TenantRegistrations",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SecurityAuditLogs",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Event = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    TenantCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RequestId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RiskScore = table.Column<int>(type: "int", nullable: true),
                    Blocked = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Metadata = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    DurationMs = table.Column<int>(type: "int", nullable: true),
                    GdprCategory = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    RetentionDays = table.Column<int>(type: "int", nullable: false, defaultValue: 365),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SecurityAuditLogs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditLogs_Email",
                schema: "master",
                table: "SecurityAuditLogs",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditLogs_Email_Timestamp",
                schema: "master",
                table: "SecurityAuditLogs",
                columns: new[] { "Email", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditLogs_Event",
                schema: "master",
                table: "SecurityAuditLogs",
                column: "Event");

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditLogs_Event_Timestamp",
                schema: "master",
                table: "SecurityAuditLogs",
                columns: new[] { "Event", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditLogs_IpAddress",
                schema: "master",
                table: "SecurityAuditLogs",
                column: "IpAddress");

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditLogs_IpAddress_Timestamp",
                schema: "master",
                table: "SecurityAuditLogs",
                columns: new[] { "IpAddress", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditLogs_RiskScore",
                schema: "master",
                table: "SecurityAuditLogs",
                column: "RiskScore",
                filter: "[RiskScore] > 50");

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditLogs_TenantCode",
                schema: "master",
                table: "SecurityAuditLogs",
                column: "TenantCode");

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditLogs_Timestamp",
                schema: "master",
                table: "SecurityAuditLogs",
                column: "Timestamp",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditLogs_UserId",
                schema: "master",
                table: "SecurityAuditLogs",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SecurityAuditLogs",
                schema: "master");

            migrationBuilder.DropColumn(
                name: "AdminPasswordHash",
                schema: "Master",
                table: "TenantRegistrations");
        }
    }
}
