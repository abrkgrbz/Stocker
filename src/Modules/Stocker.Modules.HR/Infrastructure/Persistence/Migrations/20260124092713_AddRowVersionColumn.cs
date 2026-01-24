using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.HR.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRowVersionColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "WorkSchedules",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "WorkLocations",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "Trainings",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "TimeSheets",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "TimeSheetEntry",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "SuccessionPlans",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "SuccessionCandidate",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "Skill",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "Shifts",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "Positions",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "PerformanceReviews",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "PerformanceReviewCriteria",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "PerformanceGoals",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "Payslips",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "PayslipItem",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "Payrolls",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "PayrollItems",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "Overtimes",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "OnboardingTemplateTask",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "OnboardingTemplate",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "OnboardingTask",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "Onboardings",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "LeaveTypes",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "Leaves",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "LeaveBalances",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "JobPostings",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "JobApplications",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "Interviews",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "InterviewFeedback",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "Holidays",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "Grievances",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "Expenses",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "EmployeeTrainings",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "EmployeeSkills",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "Employees",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "EmployeeDocuments",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "EmployeeBenefits",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "EmployeeAssets",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "DisciplinaryActions",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "Departments",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "Certifications",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "CareerPaths",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "CareerMilestone",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "Attendances",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "Announcements",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "RowVersion",
                schema: "hr",
                table: "AnnouncementAcknowledgments",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "WorkSchedules");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "WorkLocations");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "Trainings");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "TimeSheets");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "TimeSheetEntry");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "SuccessionPlans");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "SuccessionCandidate");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "Skill");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "Positions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "PerformanceReviews");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "PerformanceReviewCriteria");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "PerformanceGoals");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "Payslips");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "PayslipItem");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "Payrolls");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "PayrollItems");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "Overtimes");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "OnboardingTemplateTask");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "OnboardingTemplate");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "OnboardingTask");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "Onboardings");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "LeaveTypes");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "Leaves");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "LeaveBalances");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "JobPostings");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "JobApplications");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "Interviews");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "InterviewFeedback");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "Holidays");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "Grievances");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "Expenses");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "EmployeeTrainings");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "EmployeeSkills");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "EmployeeDocuments");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "EmployeeBenefits");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "EmployeeAssets");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "DisciplinaryActions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "Certifications");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "CareerPaths");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "CareerMilestone");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "hr",
                table: "AnnouncementAcknowledgments");
        }
    }
}
