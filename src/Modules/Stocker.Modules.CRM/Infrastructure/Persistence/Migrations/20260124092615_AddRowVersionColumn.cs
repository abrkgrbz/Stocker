using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRowVersionColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "crm",
                table: "WorkflowSteps",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "crm",
                table: "WorkflowStepExecutions",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "crm",
                table: "Workflows",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "crm",
                table: "WorkflowExecutions",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "crm",
                table: "Reminders",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "crm",
                table: "Notifications",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "crm",
                table: "Documents",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "crm",
                table: "WorkflowSteps");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "crm",
                table: "WorkflowStepExecutions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "crm",
                table: "Workflows");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "crm",
                table: "WorkflowExecutions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "crm",
                table: "Reminders");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "crm",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "crm",
                table: "Documents");
        }
    }
}
