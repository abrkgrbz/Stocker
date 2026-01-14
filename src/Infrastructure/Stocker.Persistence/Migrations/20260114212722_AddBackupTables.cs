using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddBackupTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create BackupSchedules table if it doesn't exist
            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS master.""BackupSchedules"" (
                    ""Id"" uuid NOT NULL,
                    ""TenantId"" uuid NOT NULL,
                    ""ScheduleName"" character varying(200) NOT NULL,
                    ""ScheduleType"" character varying(50) NOT NULL,
                    ""CronExpression"" character varying(100) NOT NULL,
                    ""BackupType"" character varying(50) NOT NULL,
                    ""IncludeDatabase"" boolean NOT NULL,
                    ""IncludeFiles"" boolean NOT NULL,
                    ""IncludeConfiguration"" boolean NOT NULL,
                    ""Compress"" boolean NOT NULL,
                    ""Encrypt"" boolean NOT NULL,
                    ""RetentionDays"" integer NOT NULL DEFAULT 30,
                    ""IsEnabled"" boolean NOT NULL DEFAULT true,
                    ""HangfireJobId"" character varying(200),
                    ""LastExecutedAt"" timestamp with time zone,
                    ""NextExecutionAt"" timestamp with time zone,
                    ""SuccessCount"" integer NOT NULL DEFAULT 0,
                    ""FailureCount"" integer NOT NULL DEFAULT 0,
                    ""LastErrorMessage"" character varying(1000),
                    ""CreatedAt"" timestamp with time zone NOT NULL,
                    ""LastModifiedAt"" timestamp with time zone NOT NULL,
                    ""CreatedBy"" character varying(100),
                    ""ModifiedBy"" character varying(100),
                    CONSTRAINT ""PK_BackupSchedules"" PRIMARY KEY (""Id""),
                    CONSTRAINT ""FK_BackupSchedules_Tenants_TenantId"" FOREIGN KEY (""TenantId"") REFERENCES master.""Tenants""(""Id"") ON DELETE CASCADE
                );

                CREATE INDEX IF NOT EXISTS ""IX_BackupSchedules_TenantId"" ON master.""BackupSchedules"" (""TenantId"");
                CREATE INDEX IF NOT EXISTS ""IX_BackupSchedules_TenantId_IsEnabled"" ON master.""BackupSchedules"" (""TenantId"", ""IsEnabled"");
                CREATE INDEX IF NOT EXISTS ""IX_BackupSchedules_HangfireJobId"" ON master.""BackupSchedules"" (""HangfireJobId"");
            ");

            // Create TenantBackups table if it doesn't exist
            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS master.""TenantBackups"" (
                    ""Id"" uuid NOT NULL,
                    ""TenantId"" uuid NOT NULL,
                    ""BackupName"" character varying(200) NOT NULL,
                    ""BackupType"" character varying(50) NOT NULL,
                    ""Status"" character varying(50) NOT NULL,
                    ""CreatedAt"" timestamp with time zone NOT NULL,
                    ""CompletedAt"" timestamp with time zone,
                    ""CreatedBy"" character varying(100) NOT NULL,
                    ""SizeInBytes"" bigint NOT NULL,
                    ""FilePath"" character varying(500),
                    ""StorageLocation"" character varying(100),
                    ""DownloadUrl"" character varying(1000),
                    ""ExpiresAt"" timestamp with time zone,
                    ""IncludesDatabase"" boolean NOT NULL,
                    ""IncludesFiles"" boolean NOT NULL,
                    ""IncludesConfiguration"" boolean NOT NULL,
                    ""IsCompressed"" boolean NOT NULL,
                    ""IsEncrypted"" boolean NOT NULL,
                    ""EncryptionKey"" character varying(500),
                    ""IsRestorable"" boolean NOT NULL,
                    ""LastRestoredAt"" timestamp with time zone,
                    ""RestoreCount"" integer NOT NULL DEFAULT 0,
                    ""RestoreNotes"" character varying(1000),
                    ""ErrorMessage"" character varying(1000),
                    ""RetryCount"" integer NOT NULL DEFAULT 0,
                    ""Description"" character varying(500),
                    ""Tags"" text,
                    ""Metadata"" text,
                    CONSTRAINT ""PK_TenantBackups"" PRIMARY KEY (""Id""),
                    CONSTRAINT ""FK_TenantBackups_Tenants_TenantId"" FOREIGN KEY (""TenantId"") REFERENCES master.""Tenants""(""Id"") ON DELETE CASCADE
                );

                CREATE INDEX IF NOT EXISTS ""IX_TenantBackups_TenantId"" ON master.""TenantBackups"" (""TenantId"");
                CREATE INDEX IF NOT EXISTS ""IX_TenantBackups_CreatedAt"" ON master.""TenantBackups"" (""CreatedAt"");
                CREATE INDEX IF NOT EXISTS ""IX_TenantBackups_TenantId_Status"" ON master.""TenantBackups"" (""TenantId"", ""Status"");
                CREATE INDEX IF NOT EXISTS ""IX_TenantBackups_TenantId_CreatedAt"" ON master.""TenantBackups"" (""TenantId"", ""CreatedAt"");
                CREATE INDEX IF NOT EXISTS ""IX_TenantBackups_TenantId_BackupType"" ON master.""TenantBackups"" (""TenantId"", ""BackupType"");
            ");

            // Move all tables from "Master" schema to "master" schema
            // This fixes case-sensitivity issues in PostgreSQL
            migrationBuilder.Sql(@"
                -- Move tables from Master to master schema if they exist
                DO $$
                BEGIN
                    -- TenantBillings
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Master' AND table_name = 'TenantBillings') THEN
                        ALTER TABLE ""Master"".""TenantBillings"" SET SCHEMA master;
                    END IF;
                    -- TenantContracts
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Master' AND table_name = 'TenantContracts') THEN
                        ALTER TABLE ""Master"".""TenantContracts"" SET SCHEMA master;
                    END IF;
                    -- TenantHealthChecks
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Master' AND table_name = 'TenantHealthChecks') THEN
                        ALTER TABLE ""Master"".""TenantHealthChecks"" SET SCHEMA master;
                    END IF;
                    -- TenantLimits
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Master' AND table_name = 'TenantLimits') THEN
                        ALTER TABLE ""Master"".""TenantLimits"" SET SCHEMA master;
                    END IF;
                    -- MigrationSessions
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Master' AND table_name = 'MigrationSessions') THEN
                        ALTER TABLE ""Master"".""MigrationSessions"" SET SCHEMA master;
                    END IF;
                    -- MigrationChunks
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Master' AND table_name = 'MigrationChunks') THEN
                        ALTER TABLE ""Master"".""MigrationChunks"" SET SCHEMA master;
                    END IF;
                    -- MigrationValidationResults
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Master' AND table_name = 'MigrationValidationResults') THEN
                        ALTER TABLE ""Master"".""MigrationValidationResults"" SET SCHEMA master;
                    END IF;
                    -- TenantBackups (if exists in Master schema)
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Master' AND table_name = 'TenantBackups') THEN
                        DROP TABLE ""Master"".""TenantBackups"" CASCADE;
                    END IF;
                    -- BackupSchedules (if exists in Master schema)
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Master' AND table_name = 'BackupSchedules') THEN
                        DROP TABLE ""Master"".""BackupSchedules"" CASCADE;
                    END IF;
                    -- Drop Master schema if empty
                    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Master') THEN
                        DROP SCHEMA IF EXISTS ""Master"";
                    END IF;
                END $$;
            ");

            // Add LemonSqueezy columns to Packages if they don't exist
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'master' AND table_name = 'Packages' AND column_name = 'LemonSqueezyProductId') THEN
                        ALTER TABLE master.""Packages"" ADD COLUMN ""LemonSqueezyProductId"" character varying(256);
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'master' AND table_name = 'Packages' AND column_name = 'LemonSqueezyVariantId') THEN
                        ALTER TABLE master.""Packages"" ADD COLUMN ""LemonSqueezyVariantId"" character varying(256);
                    END IF;
                END $$;
            ");

            // Create unique index on SubscriptionModules if it doesn't exist
            migrationBuilder.Sql(@"
                CREATE UNIQUE INDEX IF NOT EXISTS ""IX_SubscriptionModules_SubscriptionId_ModuleCode""
                ON master.""SubscriptionModules"" (""SubscriptionId"", ""ModuleCode"");
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SubscriptionModules_SubscriptionId_ModuleCode",
                schema: "master",
                table: "SubscriptionModules");

            migrationBuilder.DropColumn(
                name: "LemonSqueezyProductId",
                schema: "master",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "LemonSqueezyVariantId",
                schema: "master",
                table: "Packages");

            migrationBuilder.DropTable(
                name: "TenantBackups",
                schema: "master");

            migrationBuilder.DropTable(
                name: "BackupSchedules",
                schema: "master");
        }
    }
}
