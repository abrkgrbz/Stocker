using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class RemoveMigrationTablesFromMaster : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop Migration tables from Master schema - they are now in Tenant DB
            // Use raw SQL with IF EXISTS to handle both "Master" and "master" schemas
            // and avoid errors if tables don't exist

            // Try dropping from "Master" schema (original migration used uppercase)
            migrationBuilder.Sql(@"
                DROP TABLE IF EXISTS ""Master"".""MigrationValidationResults"" CASCADE;
                DROP TABLE IF EXISTS ""Master"".""MigrationChunks"" CASCADE;
                DROP TABLE IF EXISTS ""Master"".""MigrationSessions"" CASCADE;
            ");

            // Also try dropping from "master" schema (lowercase) in case they were moved
            migrationBuilder.Sql(@"
                DROP TABLE IF EXISTS ""master"".""MigrationValidationResults"" CASCADE;
                DROP TABLE IF EXISTS ""master"".""MigrationChunks"" CASCADE;
                DROP TABLE IF EXISTS ""master"".""MigrationSessions"" CASCADE;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Recreate tables if rolling back (copy from AddDataMigrationTables migration)
            migrationBuilder.CreateTable(
                name: "MigrationSessions",
                schema: "master",
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

            migrationBuilder.CreateTable(
                name: "MigrationChunks",
                schema: "master",
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
                        principalSchema: "master",
                        principalTable: "MigrationSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MigrationValidationResults",
                schema: "master",
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
                        principalSchema: "master",
                        principalTable: "MigrationChunks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MigrationValidationResults_MigrationSessions_SessionId",
                        column: x => x.SessionId,
                        principalSchema: "master",
                        principalTable: "MigrationSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Recreate indexes
            migrationBuilder.CreateIndex(
                name: "IX_MigrationChunks_SessionId",
                schema: "master",
                table: "MigrationChunks",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationChunks_SessionId_ChunkIndex",
                schema: "master",
                table: "MigrationChunks",
                columns: new[] { "SessionId", "ChunkIndex" });

            migrationBuilder.CreateIndex(
                name: "IX_MigrationChunks_SessionId_EntityType",
                schema: "master",
                table: "MigrationChunks",
                columns: new[] { "SessionId", "EntityType" });

            migrationBuilder.CreateIndex(
                name: "IX_MigrationSessions_ExpiresAt",
                schema: "master",
                table: "MigrationSessions",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationSessions_Status",
                schema: "master",
                table: "MigrationSessions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationSessions_TenantId",
                schema: "master",
                table: "MigrationSessions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationSessions_TenantId_CreatedAt",
                schema: "master",
                table: "MigrationSessions",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_MigrationSessions_TenantId_Status",
                schema: "master",
                table: "MigrationSessions",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_MigrationValidationResults_ChunkId",
                schema: "master",
                table: "MigrationValidationResults",
                column: "ChunkId");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationValidationResults_SessionId",
                schema: "master",
                table: "MigrationValidationResults",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationValidationResults_SessionId_EntityType",
                schema: "master",
                table: "MigrationValidationResults",
                columns: new[] { "SessionId", "EntityType" });

            migrationBuilder.CreateIndex(
                name: "IX_MigrationValidationResults_SessionId_GlobalRowIndex",
                schema: "master",
                table: "MigrationValidationResults",
                columns: new[] { "SessionId", "GlobalRowIndex" });

            migrationBuilder.CreateIndex(
                name: "IX_MigrationValidationResults_SessionId_Status",
                schema: "master",
                table: "MigrationValidationResults",
                columns: new[] { "SessionId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_MigrationValidationResults_Status",
                schema: "master",
                table: "MigrationValidationResults",
                column: "Status");
        }
    }
}
