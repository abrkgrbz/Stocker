using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Tenant
{
    /// <inheritdoc />
    public partial class AddSetupWizardToTenantDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SetupWizards",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WizardType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TotalSteps = table.Column<int>(type: "int", nullable: false),
                    CompletedSteps = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    CurrentStepIndex = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    ProgressPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 0m),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastActivityAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    StartedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CompletedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SetupWizards", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SetupWizardSteps",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WizardId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StepOrder = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CanSkip = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    StepData = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    ValidationErrors = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Duration = table.Column<TimeSpan>(type: "time", nullable: true),
                    StartedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CompletedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsSkipped = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    SkipReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SkippedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SkippedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SetupWizardSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SetupWizardSteps_SetupWizards_WizardId",
                        column: x => x.WizardId,
                        principalSchema: "tenant",
                        principalTable: "SetupWizards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SetupWizards_Status",
                schema: "tenant",
                table: "SetupWizards",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_SetupWizards_WizardType",
                schema: "tenant",
                table: "SetupWizards",
                column: "WizardType");

            migrationBuilder.CreateIndex(
                name: "IX_SetupWizards_WizardType_Status",
                schema: "tenant",
                table: "SetupWizards",
                columns: new[] { "WizardType", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_SetupWizardSteps_Name",
                schema: "tenant",
                table: "SetupWizardSteps",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_SetupWizardSteps_Status",
                schema: "tenant",
                table: "SetupWizardSteps",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_SetupWizardSteps_WizardId",
                schema: "tenant",
                table: "SetupWizardSteps",
                column: "WizardId");

            migrationBuilder.CreateIndex(
                name: "IX_SetupWizardSteps_WizardId_StepOrder",
                schema: "tenant",
                table: "SetupWizardSteps",
                columns: new[] { "WizardId", "StepOrder" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SetupWizardSteps",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "SetupWizards",
                schema: "tenant");
        }
    }
}
