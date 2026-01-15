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
            migrationBuilder.AlterColumn<string>(
                name: "WarningsJson",
                schema: "tenant",
                table: "MigrationValidationResults",
                type: "text",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UserAction",
                schema: "tenant",
                table: "MigrationValidationResults",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TransformedDataJson",
                schema: "tenant",
                table: "MigrationValidationResults",
                type: "text",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                schema: "tenant",
                table: "MigrationValidationResults",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "OriginalDataJson",
                schema: "tenant",
                table: "MigrationValidationResults",
                type: "text",
                maxLength: 256,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256);

            migrationBuilder.AlterColumn<string>(
                name: "FixedDataJson",
                schema: "tenant",
                table: "MigrationValidationResults",
                type: "text",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ErrorsJson",
                schema: "tenant",
                table: "MigrationValidationResults",
                type: "text",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "EntityType",
                schema: "tenant",
                table: "MigrationValidationResults",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "WarningRecords",
                schema: "tenant",
                table: "MigrationSessions",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "ValidRecords",
                schema: "tenant",
                table: "MigrationSessions",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "TotalRecords",
                schema: "tenant",
                table: "MigrationSessions",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                schema: "tenant",
                table: "MigrationSessions",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "SourceType",
                schema: "tenant",
                table: "MigrationSessions",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "SourceName",
                schema: "tenant",
                table: "MigrationSessions",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256);

            migrationBuilder.AlterColumn<int>(
                name: "SkippedRecords",
                schema: "tenant",
                table: "MigrationSessions",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "OptionsJson",
                schema: "tenant",
                table: "MigrationSessions",
                type: "text",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "MappingConfigJson",
                schema: "tenant",
                table: "MigrationSessions",
                type: "text",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ImportedRecords",
                schema: "tenant",
                table: "MigrationSessions",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "ImportJobId",
                schema: "tenant",
                table: "MigrationSessions",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ErrorRecords",
                schema: "tenant",
                table: "MigrationSessions",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "ErrorMessage",
                schema: "tenant",
                table: "MigrationSessions",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Entities",
                schema: "tenant",
                table: "MigrationSessions",
                type: "text",
                nullable: false,
                oldClrType: typeof(int[]),
                oldType: "integer[]");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                schema: "tenant",
                table: "MigrationChunks",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "RawDataJson",
                schema: "tenant",
                table: "MigrationChunks",
                type: "text",
                maxLength: 256,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256);

            migrationBuilder.AlterColumn<string>(
                name: "EntityType",
                schema: "tenant",
                table: "MigrationChunks",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

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

            migrationBuilder.CreateIndex(
                name: "IX_MigrationValidationResults_SessionId_Status",
                schema: "tenant",
                table: "MigrationValidationResults",
                columns: new[] { "SessionId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_MigrationValidationResults_Status",
                schema: "tenant",
                table: "MigrationValidationResults",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationSessions_ExpiresAt",
                schema: "tenant",
                table: "MigrationSessions",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationSessions_Status",
                schema: "tenant",
                table: "MigrationSessions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationSessions_TenantId",
                schema: "tenant",
                table: "MigrationSessions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationSessions_TenantId_CreatedAt",
                schema: "tenant",
                table: "MigrationSessions",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_MigrationSessions_TenantId_Status",
                schema: "tenant",
                table: "MigrationSessions",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_MigrationChunks_SessionId_ChunkIndex",
                schema: "tenant",
                table: "MigrationChunks",
                columns: new[] { "SessionId", "ChunkIndex" });

            migrationBuilder.CreateIndex(
                name: "IX_MigrationChunks_SessionId_EntityType",
                schema: "tenant",
                table: "MigrationChunks",
                columns: new[] { "SessionId", "EntityType" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MigrationValidationResults_SessionId_EntityType",
                schema: "tenant",
                table: "MigrationValidationResults");

            migrationBuilder.DropIndex(
                name: "IX_MigrationValidationResults_SessionId_GlobalRowIndex",
                schema: "tenant",
                table: "MigrationValidationResults");

            migrationBuilder.DropIndex(
                name: "IX_MigrationValidationResults_SessionId_Status",
                schema: "tenant",
                table: "MigrationValidationResults");

            migrationBuilder.DropIndex(
                name: "IX_MigrationValidationResults_Status",
                schema: "tenant",
                table: "MigrationValidationResults");

            migrationBuilder.DropIndex(
                name: "IX_MigrationSessions_ExpiresAt",
                schema: "tenant",
                table: "MigrationSessions");

            migrationBuilder.DropIndex(
                name: "IX_MigrationSessions_Status",
                schema: "tenant",
                table: "MigrationSessions");

            migrationBuilder.DropIndex(
                name: "IX_MigrationSessions_TenantId",
                schema: "tenant",
                table: "MigrationSessions");

            migrationBuilder.DropIndex(
                name: "IX_MigrationSessions_TenantId_CreatedAt",
                schema: "tenant",
                table: "MigrationSessions");

            migrationBuilder.DropIndex(
                name: "IX_MigrationSessions_TenantId_Status",
                schema: "tenant",
                table: "MigrationSessions");

            migrationBuilder.DropIndex(
                name: "IX_MigrationChunks_SessionId_ChunkIndex",
                schema: "tenant",
                table: "MigrationChunks");

            migrationBuilder.DropIndex(
                name: "IX_MigrationChunks_SessionId_EntityType",
                schema: "tenant",
                table: "MigrationChunks");

            migrationBuilder.AlterColumn<string>(
                name: "WarningsJson",
                schema: "tenant",
                table: "MigrationValidationResults",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UserAction",
                schema: "tenant",
                table: "MigrationValidationResults",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TransformedDataJson",
                schema: "tenant",
                table: "MigrationValidationResults",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                schema: "tenant",
                table: "MigrationValidationResults",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "OriginalDataJson",
                schema: "tenant",
                table: "MigrationValidationResults",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text",
                oldMaxLength: 256);

            migrationBuilder.AlterColumn<string>(
                name: "FixedDataJson",
                schema: "tenant",
                table: "MigrationValidationResults",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ErrorsJson",
                schema: "tenant",
                table: "MigrationValidationResults",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "EntityType",
                schema: "tenant",
                table: "MigrationValidationResults",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<int>(
                name: "WarningRecords",
                schema: "tenant",
                table: "MigrationSessions",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "ValidRecords",
                schema: "tenant",
                table: "MigrationSessions",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "TotalRecords",
                schema: "tenant",
                table: "MigrationSessions",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                schema: "tenant",
                table: "MigrationSessions",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<int>(
                name: "SourceType",
                schema: "tenant",
                table: "MigrationSessions",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "SourceName",
                schema: "tenant",
                table: "MigrationSessions",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<int>(
                name: "SkippedRecords",
                schema: "tenant",
                table: "MigrationSessions",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "OptionsJson",
                schema: "tenant",
                table: "MigrationSessions",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "MappingConfigJson",
                schema: "tenant",
                table: "MigrationSessions",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ImportedRecords",
                schema: "tenant",
                table: "MigrationSessions",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "ImportJobId",
                schema: "tenant",
                table: "MigrationSessions",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ErrorRecords",
                schema: "tenant",
                table: "MigrationSessions",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "ErrorMessage",
                schema: "tenant",
                table: "MigrationSessions",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AlterColumn<int[]>(
                name: "Entities",
                schema: "tenant",
                table: "MigrationSessions",
                type: "integer[]",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                schema: "tenant",
                table: "MigrationChunks",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "RawDataJson",
                schema: "tenant",
                table: "MigrationChunks",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text",
                oldMaxLength: 256);

            migrationBuilder.AlterColumn<int>(
                name: "EntityType",
                schema: "tenant",
                table: "MigrationChunks",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);
        }
    }
}
