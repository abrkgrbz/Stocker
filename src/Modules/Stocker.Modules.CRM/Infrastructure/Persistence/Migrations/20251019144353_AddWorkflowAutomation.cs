using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkflowAutomation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Workflows",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    TriggerType = table.Column<int>(type: "int", nullable: false),
                    EntityType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TriggerConditions = table.Column<string>(type: "nvarchar(max)", maxLength: 4000, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    ExecutionOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LastExecutedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExecutionCount = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Workflows", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WorkflowExecutions",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkflowId = table.Column<int>(type: "int", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EntityId = table.Column<int>(type: "int", nullable: false),
                    EntityType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TriggeredBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TriggerData = table.Column<string>(type: "nvarchar(max)", maxLength: 4000, nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    CurrentStepOrder = table.Column<int>(type: "int", nullable: false),
                    TotalSteps = table.Column<int>(type: "int", nullable: false),
                    CompletedSteps = table.Column<int>(type: "int", nullable: false),
                    FailedSteps = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkflowExecutions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkflowExecutions_Workflows_WorkflowId",
                        column: x => x.WorkflowId,
                        principalSchema: "crm",
                        principalTable: "Workflows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WorkflowSteps",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkflowId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ActionType = table.Column<int>(type: "int", nullable: false),
                    StepOrder = table.Column<int>(type: "int", nullable: false),
                    ActionConfiguration = table.Column<string>(type: "nvarchar(max)", maxLength: 4000, nullable: false),
                    Conditions = table.Column<string>(type: "nvarchar(max)", maxLength: 4000, nullable: false),
                    DelayMinutes = table.Column<int>(type: "int", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    ContinueOnError = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkflowSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkflowSteps_Workflows_WorkflowId",
                        column: x => x.WorkflowId,
                        principalSchema: "crm",
                        principalTable: "Workflows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkflowStepExecutions",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkflowExecutionId = table.Column<int>(type: "int", nullable: false),
                    WorkflowStepId = table.Column<int>(type: "int", nullable: false),
                    StepName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ActionType = table.Column<int>(type: "int", nullable: false),
                    StepOrder = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    InputData = table.Column<string>(type: "nvarchar(max)", maxLength: 4000, nullable: false),
                    OutputData = table.Column<string>(type: "nvarchar(max)", maxLength: 4000, nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    RetryCount = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkflowStepExecutions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkflowStepExecutions_WorkflowExecutions_WorkflowExecutionId",
                        column: x => x.WorkflowExecutionId,
                        principalSchema: "crm",
                        principalTable: "WorkflowExecutions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WorkflowStepExecutions_WorkflowSteps_WorkflowStepId",
                        column: x => x.WorkflowStepId,
                        principalSchema: "crm",
                        principalTable: "WorkflowSteps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowExecutions_Entity",
                schema: "crm",
                table: "WorkflowExecutions",
                columns: new[] { "EntityId", "EntityType" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowExecutions_Status",
                schema: "crm",
                table: "WorkflowExecutions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowExecutions_Tenant_StartedAt",
                schema: "crm",
                table: "WorkflowExecutions",
                columns: new[] { "TenantId", "StartedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowExecutions_Workflow_Status",
                schema: "crm",
                table: "WorkflowExecutions",
                columns: new[] { "WorkflowId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Workflows_EntityType_TriggerType",
                schema: "crm",
                table: "Workflows",
                columns: new[] { "EntityType", "TriggerType" });

            migrationBuilder.CreateIndex(
                name: "IX_Workflows_IsActive",
                schema: "crm",
                table: "Workflows",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Workflows_Tenant_Active",
                schema: "crm",
                table: "Workflows",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowStepExecutions_Execution_Order",
                schema: "crm",
                table: "WorkflowStepExecutions",
                columns: new[] { "WorkflowExecutionId", "StepOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowStepExecutions_Status",
                schema: "crm",
                table: "WorkflowStepExecutions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowStepExecutions_WorkflowStepId",
                schema: "crm",
                table: "WorkflowStepExecutions",
                column: "WorkflowStepId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowSteps_IsEnabled",
                schema: "crm",
                table: "WorkflowSteps",
                column: "IsEnabled");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowSteps_Workflow_Order",
                schema: "crm",
                table: "WorkflowSteps",
                columns: new[] { "WorkflowId", "StepOrder" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WorkflowStepExecutions",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "WorkflowExecutions",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "WorkflowSteps",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "Workflows",
                schema: "crm");
        }
    }
}
