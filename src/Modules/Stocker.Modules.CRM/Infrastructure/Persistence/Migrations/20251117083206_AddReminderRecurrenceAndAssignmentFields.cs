using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddReminderRecurrenceAndAssignmentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AssignedToUserId",
                schema: "crm",
                table: "Reminders",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DueDate",
                schema: "crm",
                table: "Reminders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "MeetingEndTime",
                schema: "crm",
                table: "Reminders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "MeetingStartTime",
                schema: "crm",
                table: "Reminders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Participants",
                schema: "crm",
                table: "Reminders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RecurrenceEndDate",
                schema: "crm",
                table: "Reminders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RecurrencePattern",
                schema: "crm",
                table: "Reminders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RecurrenceType",
                schema: "crm",
                table: "Reminders",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssignedToUserId",
                schema: "crm",
                table: "Reminders");

            migrationBuilder.DropColumn(
                name: "DueDate",
                schema: "crm",
                table: "Reminders");

            migrationBuilder.DropColumn(
                name: "MeetingEndTime",
                schema: "crm",
                table: "Reminders");

            migrationBuilder.DropColumn(
                name: "MeetingStartTime",
                schema: "crm",
                table: "Reminders");

            migrationBuilder.DropColumn(
                name: "Participants",
                schema: "crm",
                table: "Reminders");

            migrationBuilder.DropColumn(
                name: "RecurrenceEndDate",
                schema: "crm",
                table: "Reminders");

            migrationBuilder.DropColumn(
                name: "RecurrencePattern",
                schema: "crm",
                table: "Reminders");

            migrationBuilder.DropColumn(
                name: "RecurrenceType",
                schema: "crm",
                table: "Reminders");
        }
    }
}
