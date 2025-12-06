using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.HR.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixLeaveTypeIdDuplicateForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LeaveBalances_LeaveTypes_LeaveTypeId1",
                schema: "hr",
                table: "LeaveBalances");

            migrationBuilder.DropForeignKey(
                name: "FK_Leaves_LeaveTypes_LeaveTypeId1",
                schema: "hr",
                table: "Leaves");

            migrationBuilder.DropIndex(
                name: "IX_Leaves_LeaveTypeId1",
                schema: "hr",
                table: "Leaves");

            migrationBuilder.DropIndex(
                name: "IX_LeaveBalances_LeaveTypeId1",
                schema: "hr",
                table: "LeaveBalances");

            migrationBuilder.DropColumn(
                name: "LeaveTypeId1",
                schema: "hr",
                table: "Leaves");

            migrationBuilder.DropColumn(
                name: "LeaveTypeId1",
                schema: "hr",
                table: "LeaveBalances");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LeaveTypeId1",
                schema: "hr",
                table: "Leaves",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "LeaveTypeId1",
                schema: "hr",
                table: "LeaveBalances",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Leaves_LeaveTypeId1",
                schema: "hr",
                table: "Leaves",
                column: "LeaveTypeId1");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveBalances_LeaveTypeId1",
                schema: "hr",
                table: "LeaveBalances",
                column: "LeaveTypeId1");

            migrationBuilder.AddForeignKey(
                name: "FK_LeaveBalances_LeaveTypes_LeaveTypeId1",
                schema: "hr",
                table: "LeaveBalances",
                column: "LeaveTypeId1",
                principalSchema: "hr",
                principalTable: "LeaveTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Leaves_LeaveTypes_LeaveTypeId1",
                schema: "hr",
                table: "Leaves",
                column: "LeaveTypeId1",
                principalSchema: "hr",
                principalTable: "LeaveTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
