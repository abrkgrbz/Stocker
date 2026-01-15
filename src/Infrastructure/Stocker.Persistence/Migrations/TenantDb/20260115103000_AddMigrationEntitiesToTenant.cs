using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.TenantDb
{
    /// <inheritdoc />
    public partial class AddMigrationEntitiesToTenant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create MigrationSessions table
            migrationBuilder.CreateTable(
                name: "MigrationSessions",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SourceName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Entities = table.Column<string>(type: "text", nullable: false),
                    TotalRecords = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    ValidRecords = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    WarningRecords = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    ErrorRecords = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    ImportedRecords = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    SkippedRecords = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    OptionsJson = table.Column<string>(type: "text", nullable: true),
                    MappingConfigJson = table.Column<string>(type: "text", nullable: true),
                    ErrorMessage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ImportJobId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ValidatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ImportStartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MigrationSessions", x => x.Id);
                });

            // Create MigrationChunks table
            migrationBuilder.CreateTable(
                name: "MigrationChunks",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ChunkIndex = table.Column<int>(type: "integer", nullable: false),
                    TotalChunks = table.Column<int>(type: "integer", nullable: false),
                    RecordCount = table.Column<int>(type: "integer", nullable: false),
                    RawDataJson = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ValidatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ImportedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MigrationChunks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MigrationChunks_MigrationSessions_SessionId",
                        column: x => x.SessionId,
                        principalSchema: "tenant",
                        principalTable: "MigrationSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Create MigrationValidationResults table
            migrationBuilder.CreateTable(
                name: "MigrationValidationResults",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ChunkId = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RowIndex = table.Column<int>(type: "integer", nullable: false),
                    GlobalRowIndex = table.Column<int>(type: "integer", nullable: false),
                    OriginalDataJson = table.Column<string>(type: "text", nullable: false),
                    TransformedDataJson = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ErrorsJson = table.Column<string>(type: "text", nullable: true),
                    WarningsJson = table.Column<string>(type: "text", nullable: true),
                    UserAction = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    FixedDataJson = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ValidatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ImportedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MigrationValidationResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MigrationValidationResults_MigrationChunks_ChunkId",
                        column: x => x.ChunkId,
                        principalSchema: "tenant",
                        principalTable: "MigrationChunks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MigrationValidationResults_MigrationSessions_SessionId",
                        column: x => x.SessionId,
                        principalSchema: "tenant",
                        principalTable: "MigrationSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Create indexes for MigrationSessions
            migrationBuilder.CreateIndex(
                name: "IX_MigrationSessions_TenantId",
                schema: "tenant",
                table: "MigrationSessions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationSessions_Status",
                schema: "tenant",
                table: "MigrationSessions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationSessions_ExpiresAt",
                schema: "tenant",
                table: "MigrationSessions",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationSessions_TenantId_Status",
                schema: "tenant",
                table: "MigrationSessions",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_MigrationSessions_TenantId_CreatedAt",
                schema: "tenant",
                table: "MigrationSessions",
                columns: new[] { "TenantId", "CreatedAt" });

            // Create indexes for MigrationChunks
            migrationBuilder.CreateIndex(
                name: "IX_MigrationChunks_SessionId",
                schema: "tenant",
                table: "MigrationChunks",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationChunks_SessionId_EntityType",
                schema: "tenant",
                table: "MigrationChunks",
                columns: new[] { "SessionId", "EntityType" });

            migrationBuilder.CreateIndex(
                name: "IX_MigrationChunks_SessionId_ChunkIndex",
                schema: "tenant",
                table: "MigrationChunks",
                columns: new[] { "SessionId", "ChunkIndex" });

            // Create indexes for MigrationValidationResults
            migrationBuilder.CreateIndex(
                name: "IX_MigrationValidationResults_SessionId",
                schema: "tenant",
                table: "MigrationValidationResults",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationValidationResults_ChunkId",
                schema: "tenant",
                table: "MigrationValidationResults",
                column: "ChunkId");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationValidationResults_Status",
                schema: "tenant",
                table: "MigrationValidationResults",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationValidationResults_SessionId_Status",
                schema: "tenant",
                table: "MigrationValidationResults",
                columns: new[] { "SessionId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_MigrationValidationResults_SessionId_EntityType",
                schema: "tenant",
                table: "MigrationValidationResults",
                columns: new[] { "SessionId", "EntityType" });

            migrationBuilder.CreateIndex(
                name: "IX_MigrationValidationResults_SessionId_GlobalRowIndex",
                schema: "tenant",
                table: "MigrationValidationResults",
                columns: new[] { "SessionId", "GlobalRowIndex" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MigrationValidationResults",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "MigrationChunks",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "MigrationSessions",
                schema: "tenant");
        }
    }
}
