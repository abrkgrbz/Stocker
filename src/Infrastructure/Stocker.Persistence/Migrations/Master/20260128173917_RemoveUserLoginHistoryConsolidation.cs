using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class RemoveUserLoginHistoryConsolidation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Step 1: Migrate existing UserLoginHistory data to SecurityAuditLogs
            migrationBuilder.Sql(@"
                INSERT INTO master.""SecurityAuditLogs""
                    (""Id"", ""Timestamp"", ""Event"", ""UserId"", ""IpAddress"", ""UserAgent"",
                     ""CreatedAt"", ""RetentionDays"", ""Blocked"", ""GdprCategory"")
                SELECT
                    gen_random_uuid(),
                    ""LoginAt"",
                    CASE WHEN ""IsSuccessful"" THEN 'login_success' ELSE 'login_failed' END,
                    ""UserId"",
                    ""IpAddress"",
                    ""UserAgent"",
                    ""LoginAt"",
                    365,
                    false,
                    'authentication'
                FROM master.""UserLoginHistories""
                WHERE NOT EXISTS (
                    SELECT 1 FROM master.""SecurityAuditLogs"" s
                    WHERE s.""UserId"" = master.""UserLoginHistories"".""UserId""
                    AND s.""Timestamp"" = master.""UserLoginHistories"".""LoginAt""
                    AND s.""Event"" IN ('login_success', 'login_failed')
                );
            ");

            // Step 2: Drop the UserLoginHistories table
            migrationBuilder.DropTable(
                name: "UserLoginHistories",
                schema: "master");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Recreate UserLoginHistories table for rollback
            migrationBuilder.CreateTable(
                name: "UserLoginHistories",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsSuccessful = table.Column<bool>(type: "boolean", nullable: false),
                    LoginAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IpAddress = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    UserAgent = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    FailureReason = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserLoginHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserLoginHistories_MasterUsers_UserId",
                        column: x => x.UserId,
                        principalSchema: "master",
                        principalTable: "MasterUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserLoginHistories_UserId",
                schema: "master",
                table: "UserLoginHistories",
                column: "UserId");

            // Note: Data migration back from SecurityAuditLogs to UserLoginHistories
            // would need to be done manually if rollback is required
        }
    }
}
