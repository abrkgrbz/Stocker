using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.HR.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Core Employee Management
            AddSoftDeleteColumns(migrationBuilder, "Employees");
            AddSoftDeleteColumns(migrationBuilder, "Departments");
            AddSoftDeleteColumns(migrationBuilder, "Positions");

            // Work Location and Shift Management
            AddSoftDeleteColumns(migrationBuilder, "WorkLocations");
            AddSoftDeleteColumns(migrationBuilder, "Shifts");
            AddSoftDeleteColumns(migrationBuilder, "WorkSchedules");

            // Time and Attendance
            AddSoftDeleteColumns(migrationBuilder, "Attendances");
            AddSoftDeleteColumns(migrationBuilder, "Leaves");
            AddSoftDeleteColumns(migrationBuilder, "LeaveTypes");
            AddSoftDeleteColumns(migrationBuilder, "LeaveBalances");
            AddSoftDeleteColumns(migrationBuilder, "Holidays");

            // Payroll and Expenses
            AddSoftDeleteColumns(migrationBuilder, "Payrolls");
            AddSoftDeleteColumns(migrationBuilder, "PayrollItems");
            AddSoftDeleteColumns(migrationBuilder, "Expenses");

            // Performance Management
            AddSoftDeleteColumns(migrationBuilder, "PerformanceReviews");
            AddSoftDeleteColumns(migrationBuilder, "PerformanceGoals");
            AddSoftDeleteColumns(migrationBuilder, "PerformanceReviewCriterias");

            // Training
            AddSoftDeleteColumns(migrationBuilder, "Trainings");
            AddSoftDeleteColumns(migrationBuilder, "EmployeeTrainings");

            // Documents
            AddSoftDeleteColumns(migrationBuilder, "EmployeeDocuments");

            // Announcements
            AddSoftDeleteColumns(migrationBuilder, "Announcements");
            AddSoftDeleteColumns(migrationBuilder, "AnnouncementAcknowledgments");

            // Career and Development
            AddSoftDeleteColumns(migrationBuilder, "CareerPaths");
            AddSoftDeleteColumns(migrationBuilder, "Certifications");
            AddSoftDeleteColumns(migrationBuilder, "EmployeeSkills");
            AddSoftDeleteColumns(migrationBuilder, "SuccessionPlans");

            // Disciplinary and Grievance
            AddSoftDeleteColumns(migrationBuilder, "DisciplinaryActions");
            AddSoftDeleteColumns(migrationBuilder, "Grievances");

            // Assets and Benefits
            AddSoftDeleteColumns(migrationBuilder, "EmployeeAssets");
            AddSoftDeleteColumns(migrationBuilder, "EmployeeBenefits");

            // Recruitment
            AddSoftDeleteColumns(migrationBuilder, "JobPostings");
            AddSoftDeleteColumns(migrationBuilder, "JobApplications");
            AddSoftDeleteColumns(migrationBuilder, "Interviews");
            AddSoftDeleteColumns(migrationBuilder, "Onboardings");

            // Time Management
            AddSoftDeleteColumns(migrationBuilder, "Overtimes");
            AddSoftDeleteColumns(migrationBuilder, "TimeSheets");

            // Payroll Extended
            AddSoftDeleteColumns(migrationBuilder, "Payslips");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Core Employee Management
            RemoveSoftDeleteColumns(migrationBuilder, "Employees");
            RemoveSoftDeleteColumns(migrationBuilder, "Departments");
            RemoveSoftDeleteColumns(migrationBuilder, "Positions");

            // Work Location and Shift Management
            RemoveSoftDeleteColumns(migrationBuilder, "WorkLocations");
            RemoveSoftDeleteColumns(migrationBuilder, "Shifts");
            RemoveSoftDeleteColumns(migrationBuilder, "WorkSchedules");

            // Time and Attendance
            RemoveSoftDeleteColumns(migrationBuilder, "Attendances");
            RemoveSoftDeleteColumns(migrationBuilder, "Leaves");
            RemoveSoftDeleteColumns(migrationBuilder, "LeaveTypes");
            RemoveSoftDeleteColumns(migrationBuilder, "LeaveBalances");
            RemoveSoftDeleteColumns(migrationBuilder, "Holidays");

            // Payroll and Expenses
            RemoveSoftDeleteColumns(migrationBuilder, "Payrolls");
            RemoveSoftDeleteColumns(migrationBuilder, "PayrollItems");
            RemoveSoftDeleteColumns(migrationBuilder, "Expenses");

            // Performance Management
            RemoveSoftDeleteColumns(migrationBuilder, "PerformanceReviews");
            RemoveSoftDeleteColumns(migrationBuilder, "PerformanceGoals");
            RemoveSoftDeleteColumns(migrationBuilder, "PerformanceReviewCriterias");

            // Training
            RemoveSoftDeleteColumns(migrationBuilder, "Trainings");
            RemoveSoftDeleteColumns(migrationBuilder, "EmployeeTrainings");

            // Documents
            RemoveSoftDeleteColumns(migrationBuilder, "EmployeeDocuments");

            // Announcements
            RemoveSoftDeleteColumns(migrationBuilder, "Announcements");
            RemoveSoftDeleteColumns(migrationBuilder, "AnnouncementAcknowledgments");

            // Career and Development
            RemoveSoftDeleteColumns(migrationBuilder, "CareerPaths");
            RemoveSoftDeleteColumns(migrationBuilder, "Certifications");
            RemoveSoftDeleteColumns(migrationBuilder, "EmployeeSkills");
            RemoveSoftDeleteColumns(migrationBuilder, "SuccessionPlans");

            // Disciplinary and Grievance
            RemoveSoftDeleteColumns(migrationBuilder, "DisciplinaryActions");
            RemoveSoftDeleteColumns(migrationBuilder, "Grievances");

            // Assets and Benefits
            RemoveSoftDeleteColumns(migrationBuilder, "EmployeeAssets");
            RemoveSoftDeleteColumns(migrationBuilder, "EmployeeBenefits");

            // Recruitment
            RemoveSoftDeleteColumns(migrationBuilder, "JobPostings");
            RemoveSoftDeleteColumns(migrationBuilder, "JobApplications");
            RemoveSoftDeleteColumns(migrationBuilder, "Interviews");
            RemoveSoftDeleteColumns(migrationBuilder, "Onboardings");

            // Time Management
            RemoveSoftDeleteColumns(migrationBuilder, "Overtimes");
            RemoveSoftDeleteColumns(migrationBuilder, "TimeSheets");

            // Payroll Extended
            RemoveSoftDeleteColumns(migrationBuilder, "Payslips");
        }

        private static void AddSoftDeleteColumns(MigrationBuilder migrationBuilder, string tableName)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "hr",
                table: tableName,
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "hr",
                table: tableName,
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "hr",
                table: tableName,
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        private static void RemoveSoftDeleteColumns(MigrationBuilder migrationBuilder, string tableName)
        {
            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "hr",
                table: tableName);

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "hr",
                table: tableName);

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "hr",
                table: tableName);
        }
    }
}
