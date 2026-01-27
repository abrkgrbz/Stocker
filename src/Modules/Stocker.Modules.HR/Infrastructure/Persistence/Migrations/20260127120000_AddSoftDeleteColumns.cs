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
            AddSoftDeleteColumnsToTable(migrationBuilder, "Employees");
            AddSoftDeleteColumnsToTable(migrationBuilder, "Departments");
            AddSoftDeleteColumnsToTable(migrationBuilder, "Positions");

            // Work Location and Shift Management
            AddSoftDeleteColumnsToTable(migrationBuilder, "WorkLocations");
            AddSoftDeleteColumnsToTable(migrationBuilder, "Shifts");
            AddSoftDeleteColumnsToTable(migrationBuilder, "WorkSchedules");

            // Time and Attendance
            AddSoftDeleteColumnsToTable(migrationBuilder, "Attendances");
            AddSoftDeleteColumnsToTable(migrationBuilder, "Leaves");
            AddSoftDeleteColumnsToTable(migrationBuilder, "LeaveTypes");
            AddSoftDeleteColumnsToTable(migrationBuilder, "LeaveBalances");
            AddSoftDeleteColumnsToTable(migrationBuilder, "Holidays");

            // Payroll and Expenses
            AddSoftDeleteColumnsToTable(migrationBuilder, "Payrolls");
            AddSoftDeleteColumnsToTable(migrationBuilder, "PayrollItems");
            AddSoftDeleteColumnsToTable(migrationBuilder, "Expenses");

            // Performance Management
            AddSoftDeleteColumnsToTable(migrationBuilder, "PerformanceReviews");
            AddSoftDeleteColumnsToTable(migrationBuilder, "PerformanceGoals");
            AddSoftDeleteColumnsToTable(migrationBuilder, "PerformanceReviewCriterias");

            // Training
            AddSoftDeleteColumnsToTable(migrationBuilder, "Trainings");
            AddSoftDeleteColumnsToTable(migrationBuilder, "EmployeeTrainings");

            // Documents
            AddSoftDeleteColumnsToTable(migrationBuilder, "EmployeeDocuments");

            // Announcements
            AddSoftDeleteColumnsToTable(migrationBuilder, "Announcements");
            AddSoftDeleteColumnsToTable(migrationBuilder, "AnnouncementAcknowledgments");

            // Career and Development
            AddSoftDeleteColumnsToTable(migrationBuilder, "CareerPaths");
            AddSoftDeleteColumnsToTable(migrationBuilder, "Certifications");
            AddSoftDeleteColumnsToTable(migrationBuilder, "EmployeeSkills");
            AddSoftDeleteColumnsToTable(migrationBuilder, "SuccessionPlans");

            // Disciplinary and Grievance
            AddSoftDeleteColumnsToTable(migrationBuilder, "DisciplinaryActions");
            AddSoftDeleteColumnsToTable(migrationBuilder, "Grievances");

            // Assets and Benefits
            AddSoftDeleteColumnsToTable(migrationBuilder, "EmployeeAssets");
            AddSoftDeleteColumnsToTable(migrationBuilder, "EmployeeBenefits");

            // Recruitment
            AddSoftDeleteColumnsToTable(migrationBuilder, "JobPostings");
            AddSoftDeleteColumnsToTable(migrationBuilder, "JobApplications");
            AddSoftDeleteColumnsToTable(migrationBuilder, "Interviews");
            AddSoftDeleteColumnsToTable(migrationBuilder, "Onboardings");

            // Time Management
            AddSoftDeleteColumnsToTable(migrationBuilder, "Overtimes");
            AddSoftDeleteColumnsToTable(migrationBuilder, "TimeSheets");

            // Payroll Extended
            AddSoftDeleteColumnsToTable(migrationBuilder, "Payslips");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Core Employee Management
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Employees");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Departments");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Positions");

            // Work Location and Shift Management
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "WorkLocations");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Shifts");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "WorkSchedules");

            // Time and Attendance
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Attendances");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Leaves");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "LeaveTypes");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "LeaveBalances");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Holidays");

            // Payroll and Expenses
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Payrolls");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PayrollItems");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Expenses");

            // Performance Management
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PerformanceReviews");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PerformanceGoals");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "PerformanceReviewCriterias");

            // Training
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Trainings");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "EmployeeTrainings");

            // Documents
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "EmployeeDocuments");

            // Announcements
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Announcements");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "AnnouncementAcknowledgments");

            // Career and Development
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "CareerPaths");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Certifications");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "EmployeeSkills");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "SuccessionPlans");

            // Disciplinary and Grievance
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "DisciplinaryActions");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Grievances");

            // Assets and Benefits
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "EmployeeAssets");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "EmployeeBenefits");

            // Recruitment
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "JobPostings");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "JobApplications");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Interviews");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Onboardings");

            // Time Management
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Overtimes");
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "TimeSheets");

            // Payroll Extended
            RemoveSoftDeleteColumnsFromTable(migrationBuilder, "Payslips");
        }

        private static void AddSoftDeleteColumnsToTable(MigrationBuilder migrationBuilder, string tableName)
        {
            // Use conditional SQL to avoid errors if table doesn't exist or columns already exist
            // PostgreSQL stores identifiers in lowercase in information_schema
            var tableNameLower = tableName.ToLowerInvariant();

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    -- Only add column if table exists and column doesn't exist
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'hr' AND lower(table_name) = '{tableNameLower}')
                       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'hr' AND lower(table_name) = '{tableNameLower}' AND lower(column_name) = 'isdeleted') THEN
                        ALTER TABLE hr.""{tableName}"" ADD COLUMN ""IsDeleted"" boolean NOT NULL DEFAULT false;
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'hr' AND lower(table_name) = '{tableNameLower}')
                       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'hr' AND lower(table_name) = '{tableNameLower}' AND lower(column_name) = 'deletedat') THEN
                        ALTER TABLE hr.""{tableName}"" ADD COLUMN ""DeletedAt"" timestamp with time zone NULL;
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql($@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'hr' AND lower(table_name) = '{tableNameLower}')
                       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'hr' AND lower(table_name) = '{tableNameLower}' AND lower(column_name) = 'deletedby') THEN
                        ALTER TABLE hr.""{tableName}"" ADD COLUMN ""DeletedBy"" character varying(100) NULL;
                    END IF;
                END $$;
            ");
        }

        private static void RemoveSoftDeleteColumnsFromTable(MigrationBuilder migrationBuilder, string tableName)
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
