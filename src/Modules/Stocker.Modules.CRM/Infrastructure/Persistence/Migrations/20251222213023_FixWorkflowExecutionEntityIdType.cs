using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixWorkflowExecutionEntityIdType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // First convert existing integer values to string using raw SQL
            // This handles existing data without data loss
            migrationBuilder.Sql(@"
                ALTER TABLE crm.""WorkflowExecutions""
                ALTER COLUMN ""EntityId"" TYPE character varying(50)
                USING ""EntityId""::character varying;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "EntityId",
                schema: "crm",
                table: "WorkflowExecutions",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);
        }
    }
}
