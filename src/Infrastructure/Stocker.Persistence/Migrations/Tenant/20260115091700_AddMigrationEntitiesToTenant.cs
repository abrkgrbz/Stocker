using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Tenant
{
    /// <inheritdoc />
    public partial class AddMigrationEntitiesToTenant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MigrationSessions",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceType = table.Column<int>(type: "integer", nullable: false),
                    SourceName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Entities = table.Column<int[]>(type: "integer[]", nullable: false),
                    TotalRecords = table.Column<int>(type: "integer", nullable: false),
                    ValidRecords = table.Column<int>(type: "integer", nullable: false),
                    WarningRecords = table.Column<int>(type: "integer", nullable: false),
                    ErrorRecords = table.Column<int>(type: "integer", nullable: false),
                    ImportedRecords = table.Column<int>(type: "integer", nullable: false),
                    SkippedRecords = table.Column<int>(type: "integer", nullable: false),
                    OptionsJson = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    MappingConfigJson = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ErrorMessage = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ImportJobId = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
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
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityType = table.Column<int>(type: "integer", nullable: false),
                    ChunkIndex = table.Column<int>(type: "integer", nullable: false),
                    TotalChunks = table.Column<int>(type: "integer", nullable: false),
                    RecordCount = table.Column<int>(type: "integer", nullable: false),
                    RawDataJson = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
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

            migrationBuilder.CreateTable(
                name: "MigrationValidationResults",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ChunkId = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityType = table.Column<int>(type: "integer", nullable: false),
                    RowIndex = table.Column<int>(type: "integer", nullable: false),
                    GlobalRowIndex = table.Column<int>(type: "integer", nullable: false),
                    OriginalDataJson = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    TransformedDataJson = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ErrorsJson = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    WarningsJson = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    UserAction = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    FixedDataJson = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
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

            migrationBuilder.CreateIndex(
                name: "IX_MigrationChunks_SessionId",
                schema: "tenant",
                table: "MigrationChunks",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationValidationResults_ChunkId",
                schema: "tenant",
                table: "MigrationValidationResults",
                column: "ChunkId");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationValidationResults_SessionId",
                schema: "tenant",
                table: "MigrationValidationResults",
                column: "SessionId");
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
