using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <summary>
    /// This migration moves tables from the incorrectly named "Master" schema (uppercase M)
    /// to the correct "master" schema (lowercase m).
    ///
    /// Affected tables:
    /// - BackupSchedules
    /// - MigrationChunks
    /// - MigrationSessions
    /// - MigrationValidationResults
    /// - TenantBackups
    /// - TenantContracts
    /// - TenantHealthChecks
    /// - TenantLimits
    /// </summary>
    public partial class MoveTablesFromMasterToLowercaseSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Move tables from "Master" schema to "master" schema
            // Using ALTER TABLE ... SET SCHEMA for each table

            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    -- Check if Master schema exists (case-sensitive)
                    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'Master') THEN

                        -- Move BackupSchedules if it exists in Master schema
                        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Master' AND table_name = 'BackupSchedules') THEN
                            -- Drop if exists in master (lowercase) to avoid conflict
                            DROP TABLE IF EXISTS master.""BackupSchedules"" CASCADE;
                            ALTER TABLE ""Master"".""BackupSchedules"" SET SCHEMA master;
                            RAISE NOTICE 'Moved BackupSchedules from Master to master schema';
                        END IF;

                        -- Move MigrationChunks if it exists in Master schema
                        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Master' AND table_name = 'MigrationChunks') THEN
                            DROP TABLE IF EXISTS master.""MigrationChunks"" CASCADE;
                            ALTER TABLE ""Master"".""MigrationChunks"" SET SCHEMA master;
                            RAISE NOTICE 'Moved MigrationChunks from Master to master schema';
                        END IF;

                        -- Move MigrationSessions if it exists in Master schema
                        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Master' AND table_name = 'MigrationSessions') THEN
                            DROP TABLE IF EXISTS master.""MigrationSessions"" CASCADE;
                            ALTER TABLE ""Master"".""MigrationSessions"" SET SCHEMA master;
                            RAISE NOTICE 'Moved MigrationSessions from Master to master schema';
                        END IF;

                        -- Move MigrationValidationResults if it exists in Master schema
                        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Master' AND table_name = 'MigrationValidationResults') THEN
                            DROP TABLE IF EXISTS master.""MigrationValidationResults"" CASCADE;
                            ALTER TABLE ""Master"".""MigrationValidationResults"" SET SCHEMA master;
                            RAISE NOTICE 'Moved MigrationValidationResults from Master to master schema';
                        END IF;

                        -- Move TenantBackups if it exists in Master schema
                        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Master' AND table_name = 'TenantBackups') THEN
                            DROP TABLE IF EXISTS master.""TenantBackups"" CASCADE;
                            ALTER TABLE ""Master"".""TenantBackups"" SET SCHEMA master;
                            RAISE NOTICE 'Moved TenantBackups from Master to master schema';
                        END IF;

                        -- Move TenantContracts if it exists in Master schema
                        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Master' AND table_name = 'TenantContracts') THEN
                            DROP TABLE IF EXISTS master.""TenantContracts"" CASCADE;
                            ALTER TABLE ""Master"".""TenantContracts"" SET SCHEMA master;
                            RAISE NOTICE 'Moved TenantContracts from Master to master schema';
                        END IF;

                        -- Move TenantHealthChecks if it exists in Master schema
                        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Master' AND table_name = 'TenantHealthChecks') THEN
                            DROP TABLE IF EXISTS master.""TenantHealthChecks"" CASCADE;
                            ALTER TABLE ""Master"".""TenantHealthChecks"" SET SCHEMA master;
                            RAISE NOTICE 'Moved TenantHealthChecks from Master to master schema';
                        END IF;

                        -- Move TenantLimits if it exists in Master schema
                        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Master' AND table_name = 'TenantLimits') THEN
                            DROP TABLE IF EXISTS master.""TenantLimits"" CASCADE;
                            ALTER TABLE ""Master"".""TenantLimits"" SET SCHEMA master;
                            RAISE NOTICE 'Moved TenantLimits from Master to master schema';
                        END IF;

                        -- Drop the empty Master schema if it has no more tables
                        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Master') THEN
                            DROP SCHEMA IF EXISTS ""Master"";
                            RAISE NOTICE 'Dropped empty Master schema';
                        END IF;

                    ELSE
                        RAISE NOTICE 'Master schema does not exist, nothing to migrate';
                    END IF;
                END $$;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // We don't want to move tables back to the wrong schema
            // This is a one-way migration to fix the schema naming issue
        }
    }
}
