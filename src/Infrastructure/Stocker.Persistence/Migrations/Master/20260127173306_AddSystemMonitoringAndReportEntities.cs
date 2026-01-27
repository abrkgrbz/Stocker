using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class AddSystemMonitoringAndReportEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ReportSchedules",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ReportType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Frequency = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CronExpression = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    Recipients = table.Column<string>(type: "text", maxLength: 256, nullable: false),
                    Parameters = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    LastRunAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextRunAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportSchedules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SystemAlerts",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Severity = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Source = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AcknowledgedBy = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    AcknowledgedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DismissedBy = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    DismissedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Metadata = table.Column<string>(type: "text", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemAlerts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ReportExecutions",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ScheduleId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReportType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ReportName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DurationMs = table.Column<int>(type: "integer", nullable: true),
                    OutputPath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: true),
                    Parameters = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    ErrorMessage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ExecutedBy = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    RecordCount = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportExecutions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReportExecutions_ReportSchedules_ScheduleId",
                        column: x => x.ScheduleId,
                        principalSchema: "master",
                        principalTable: "ReportSchedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReportExecutions_ReportType",
                schema: "master",
                table: "ReportExecutions",
                column: "ReportType");

            migrationBuilder.CreateIndex(
                name: "IX_ReportExecutions_ScheduleId",
                schema: "master",
                table: "ReportExecutions",
                column: "ScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportExecutions_ScheduleId_StartedAt",
                schema: "master",
                table: "ReportExecutions",
                columns: new[] { "ScheduleId", "StartedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ReportExecutions_StartedAt",
                schema: "master",
                table: "ReportExecutions",
                column: "StartedAt",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_ReportExecutions_Status",
                schema: "master",
                table: "ReportExecutions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ReportExecutions_Status_StartedAt",
                schema: "master",
                table: "ReportExecutions",
                columns: new[] { "Status", "StartedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ReportSchedules_IsEnabled",
                schema: "master",
                table: "ReportSchedules",
                column: "IsEnabled");

            migrationBuilder.CreateIndex(
                name: "IX_ReportSchedules_IsEnabled_NextRunAt",
                schema: "master",
                table: "ReportSchedules",
                columns: new[] { "IsEnabled", "NextRunAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ReportSchedules_NextRunAt",
                schema: "master",
                table: "ReportSchedules",
                column: "NextRunAt");

            migrationBuilder.CreateIndex(
                name: "IX_ReportSchedules_ReportType",
                schema: "master",
                table: "ReportSchedules",
                column: "ReportType");

            migrationBuilder.CreateIndex(
                name: "IX_SystemAlerts_IsActive",
                schema: "master",
                table: "SystemAlerts",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_SystemAlerts_IsActive_Timestamp",
                schema: "master",
                table: "SystemAlerts",
                columns: new[] { "IsActive", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_SystemAlerts_Severity",
                schema: "master",
                table: "SystemAlerts",
                column: "Severity");

            migrationBuilder.CreateIndex(
                name: "IX_SystemAlerts_Severity_IsActive",
                schema: "master",
                table: "SystemAlerts",
                columns: new[] { "Severity", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_SystemAlerts_Timestamp",
                schema: "master",
                table: "SystemAlerts",
                column: "Timestamp",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_SystemAlerts_Type",
                schema: "master",
                table: "SystemAlerts",
                column: "Type");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ReportExecutions",
                schema: "master");

            migrationBuilder.DropTable(
                name: "SystemAlerts",
                schema: "master");

            migrationBuilder.DropTable(
                name: "ReportSchedules",
                schema: "master");
        }
    }
}
