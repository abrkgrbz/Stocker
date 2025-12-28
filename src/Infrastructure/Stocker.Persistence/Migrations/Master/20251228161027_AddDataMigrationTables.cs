using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class AddDataMigrationTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LemonSqueezySubscriptions",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    SubscriptionId = table.Column<Guid>(type: "uuid", nullable: true),
                    LsSubscriptionId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    LsCustomerId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    LsProductId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    LsVariantId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    LsOrderId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    StatusFormatted = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TrialEndsAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RenewsAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndsAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PausedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CardBrand = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CardLastFour = table.Column<string>(type: "character varying(4)", maxLength: 4, nullable: true),
                    BillingAnchor = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    UnitPrice = table.Column<int>(type: "integer", nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "TRY"),
                    BillingInterval = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "month"),
                    BillingIntervalCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    CustomerPortalUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    UpdatePaymentMethodUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastWebhookEventId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LastWebhookAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LemonSqueezySubscriptions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MigrationSessions",
                schema: "Master",
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
                    OptionsJson = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    MappingConfigJson = table.Column<string>(type: "text", maxLength: 256, nullable: true),
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
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ChunkIndex = table.Column<int>(type: "integer", nullable: false),
                    TotalChunks = table.Column<int>(type: "integer", nullable: false),
                    RecordCount = table.Column<int>(type: "integer", nullable: false),
                    RawDataJson = table.Column<string>(type: "text", maxLength: 256, nullable: false),
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
                        principalSchema: "Master",
                        principalTable: "MigrationSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MigrationValidationResults",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ChunkId = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RowIndex = table.Column<int>(type: "integer", nullable: false),
                    GlobalRowIndex = table.Column<int>(type: "integer", nullable: false),
                    OriginalDataJson = table.Column<string>(type: "text", maxLength: 256, nullable: false),
                    TransformedDataJson = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ErrorsJson = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    WarningsJson = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    UserAction = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    FixedDataJson = table.Column<string>(type: "text", maxLength: 256, nullable: true),
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
                        principalSchema: "Master",
                        principalTable: "MigrationChunks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MigrationValidationResults_MigrationSessions_SessionId",
                        column: x => x.SessionId,
                        principalSchema: "Master",
                        principalTable: "MigrationSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LemonSqueezySubscriptions_LsCustomerId",
                schema: "master",
                table: "LemonSqueezySubscriptions",
                column: "LsCustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_LemonSqueezySubscriptions_LsSubscriptionId",
                schema: "master",
                table: "LemonSqueezySubscriptions",
                column: "LsSubscriptionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LemonSqueezySubscriptions_Status",
                schema: "master",
                table: "LemonSqueezySubscriptions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_LemonSqueezySubscriptions_TenantId",
                schema: "master",
                table: "LemonSqueezySubscriptions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_LemonSqueezySubscriptions_TenantId_Status",
                schema: "master",
                table: "LemonSqueezySubscriptions",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_MigrationChunks_SessionId",
                schema: "Master",
                table: "MigrationChunks",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationChunks_SessionId_ChunkIndex",
                schema: "Master",
                table: "MigrationChunks",
                columns: new[] { "SessionId", "ChunkIndex" });

            migrationBuilder.CreateIndex(
                name: "IX_MigrationChunks_SessionId_EntityType",
                schema: "Master",
                table: "MigrationChunks",
                columns: new[] { "SessionId", "EntityType" });

            migrationBuilder.CreateIndex(
                name: "IX_MigrationSessions_ExpiresAt",
                schema: "Master",
                table: "MigrationSessions",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationSessions_Status",
                schema: "Master",
                table: "MigrationSessions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationSessions_TenantId",
                schema: "Master",
                table: "MigrationSessions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationSessions_TenantId_CreatedAt",
                schema: "Master",
                table: "MigrationSessions",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_MigrationSessions_TenantId_Status",
                schema: "Master",
                table: "MigrationSessions",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_MigrationValidationResults_ChunkId",
                schema: "Master",
                table: "MigrationValidationResults",
                column: "ChunkId");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationValidationResults_SessionId",
                schema: "Master",
                table: "MigrationValidationResults",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationValidationResults_SessionId_EntityType",
                schema: "Master",
                table: "MigrationValidationResults",
                columns: new[] { "SessionId", "EntityType" });

            migrationBuilder.CreateIndex(
                name: "IX_MigrationValidationResults_SessionId_GlobalRowIndex",
                schema: "Master",
                table: "MigrationValidationResults",
                columns: new[] { "SessionId", "GlobalRowIndex" });

            migrationBuilder.CreateIndex(
                name: "IX_MigrationValidationResults_SessionId_Status",
                schema: "Master",
                table: "MigrationValidationResults",
                columns: new[] { "SessionId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_MigrationValidationResults_Status",
                schema: "Master",
                table: "MigrationValidationResults",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LemonSqueezySubscriptions",
                schema: "master");

            migrationBuilder.DropTable(
                name: "MigrationValidationResults",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "MigrationChunks",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "MigrationSessions",
                schema: "Master");
        }
    }
}
