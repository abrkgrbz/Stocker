using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRemindersAndNotificationsTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // First, convert integer enum values to string values for Reminders table
            // Status: 0=Pending, 1=Snoozed, 2=Triggered, 3=Completed, 4=Dismissed
            migrationBuilder.Sql(@"
                ALTER TABLE crm.""Reminders""
                ALTER COLUMN ""Status"" TYPE character varying(50)
                USING CASE ""Status""
                    WHEN 0 THEN 'Pending'
                    WHEN 1 THEN 'Snoozed'
                    WHEN 2 THEN 'Triggered'
                    WHEN 3 THEN 'Completed'
                    WHEN 4 THEN 'Dismissed'
                    ELSE 'Pending'
                END;
            ");

            // Type: 0=General, 1=Task, 2=Meeting, 3=FollowUp, 4=Birthday, 5=ContractRenewal, 6=PaymentDue
            migrationBuilder.Sql(@"
                ALTER TABLE crm.""Reminders""
                ALTER COLUMN ""Type"" TYPE character varying(50)
                USING CASE ""Type""
                    WHEN 0 THEN 'General'
                    WHEN 1 THEN 'Task'
                    WHEN 2 THEN 'Meeting'
                    WHEN 3 THEN 'FollowUp'
                    WHEN 4 THEN 'Birthday'
                    WHEN 5 THEN 'ContractRenewal'
                    WHEN 6 THEN 'PaymentDue'
                    ELSE 'General'
                END;
            ");

            // RecurrenceType: 0=None, 1=Daily, 2=Weekly, 3=Monthly, 4=Yearly
            migrationBuilder.Sql(@"
                ALTER TABLE crm.""Reminders""
                ALTER COLUMN ""RecurrenceType"" TYPE character varying(50)
                USING CASE ""RecurrenceType""
                    WHEN 0 THEN 'None'
                    WHEN 1 THEN 'Daily'
                    WHEN 2 THEN 'Weekly'
                    WHEN 3 THEN 'Monthly'
                    WHEN 4 THEN 'Yearly'
                    ELSE 'None'
                END;
            ");

            // Update other Reminders columns
            migrationBuilder.AlterColumn<string>(
                name: "Title",
                schema: "crm",
                table: "Reminders",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "RelatedEntityType",
                schema: "crm",
                table: "Reminders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RecurrencePattern",
                schema: "crm",
                table: "Reminders",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Participants",
                schema: "crm",
                table: "Reminders",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "crm",
                table: "Reminders",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            // Convert integer enum values to string values for Notifications table
            // Check if Notifications table exists first
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'crm' AND table_name = 'Notifications') THEN
                        -- Status: 0=Pending, 1=Sent, 2=Failed
                        ALTER TABLE crm.""Notifications""
                        ALTER COLUMN ""Status"" TYPE character varying(50)
                        USING CASE ""Status""
                            WHEN 0 THEN 'Pending'
                            WHEN 1 THEN 'Sent'
                            WHEN 2 THEN 'Failed'
                            ELSE 'Pending'
                        END;

                        -- Type conversion
                        ALTER TABLE crm.""Notifications""
                        ALTER COLUMN ""Type"" TYPE character varying(50)
                        USING CASE ""Type""
                            WHEN 0 THEN 'Info'
                            WHEN 1 THEN 'Warning'
                            WHEN 2 THEN 'Error'
                            WHEN 3 THEN 'Success'
                            ELSE 'Info'
                        END;

                        -- Channel conversion
                        ALTER TABLE crm.""Notifications""
                        ALTER COLUMN ""Channel"" TYPE character varying(50)
                        USING CASE ""Channel""
                            WHEN 0 THEN 'InApp'
                            WHEN 1 THEN 'Email'
                            WHEN 2 THEN 'Push'
                            WHEN 3 THEN 'SMS'
                            ELSE 'InApp'
                        END;

                        -- Update other columns
                        ALTER TABLE crm.""Notifications"" ALTER COLUMN ""Title"" TYPE character varying(500);
                        ALTER TABLE crm.""Notifications"" ALTER COLUMN ""Message"" TYPE character varying(4000);
                        ALTER TABLE crm.""Notifications"" ALTER COLUMN ""RelatedEntityType"" TYPE character varying(100);
                        ALTER TABLE crm.""Notifications"" ALTER COLUMN ""ErrorMessage"" TYPE character varying(2000);
                        ALTER TABLE crm.""Notifications"" ALTER COLUMN ""Metadata"" TYPE character varying(8000);
                    END IF;
                END $$;
            ");

            // Create indexes for Reminders (drop first if exists to avoid duplicates)
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS crm.""IX_Reminders_RemindAt"";");
            migrationBuilder.CreateIndex(
                name: "IX_Reminders_RemindAt",
                schema: "crm",
                table: "Reminders",
                column: "RemindAt");

            migrationBuilder.Sql(@"DROP INDEX IF EXISTS crm.""IX_Reminders_Status"";");
            migrationBuilder.CreateIndex(
                name: "IX_Reminders_Status",
                schema: "crm",
                table: "Reminders",
                column: "Status");

            migrationBuilder.Sql(@"DROP INDEX IF EXISTS crm.""IX_Reminders_TenantId"";");
            migrationBuilder.CreateIndex(
                name: "IX_Reminders_TenantId",
                schema: "crm",
                table: "Reminders",
                column: "TenantId");

            migrationBuilder.Sql(@"DROP INDEX IF EXISTS crm.""IX_Reminders_TenantId_Status_RemindAt"";");
            migrationBuilder.CreateIndex(
                name: "IX_Reminders_TenantId_Status_RemindAt",
                schema: "crm",
                table: "Reminders",
                columns: new[] { "TenantId", "Status", "RemindAt" });

            migrationBuilder.Sql(@"DROP INDEX IF EXISTS crm.""IX_Reminders_TenantId_UserId_Status"";");
            migrationBuilder.CreateIndex(
                name: "IX_Reminders_TenantId_UserId_Status",
                schema: "crm",
                table: "Reminders",
                columns: new[] { "TenantId", "UserId", "Status" });

            migrationBuilder.Sql(@"DROP INDEX IF EXISTS crm.""IX_Reminders_UserId"";");
            migrationBuilder.CreateIndex(
                name: "IX_Reminders_UserId",
                schema: "crm",
                table: "Reminders",
                column: "UserId");

            // Create indexes for Notifications (if table exists)
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'crm' AND table_name = 'Notifications') THEN
                        DROP INDEX IF EXISTS crm.""IX_Notifications_Status"";
                        DROP INDEX IF EXISTS crm.""IX_Notifications_TenantId"";
                        DROP INDEX IF EXISTS crm.""IX_Notifications_TenantId_UserId_ReadAt"";
                        DROP INDEX IF EXISTS crm.""IX_Notifications_TenantId_UserId_Status"";
                        DROP INDEX IF EXISTS crm.""IX_Notifications_UserId"";

                        CREATE INDEX ""IX_Notifications_Status"" ON crm.""Notifications"" (""Status"");
                        CREATE INDEX ""IX_Notifications_TenantId"" ON crm.""Notifications"" (""TenantId"");
                        CREATE INDEX ""IX_Notifications_TenantId_UserId_ReadAt"" ON crm.""Notifications"" (""TenantId"", ""UserId"", ""ReadAt"");
                        CREATE INDEX ""IX_Notifications_TenantId_UserId_Status"" ON crm.""Notifications"" (""TenantId"", ""UserId"", ""Status"");
                        CREATE INDEX ""IX_Notifications_UserId"" ON crm.""Notifications"" (""UserId"");
                    END IF;
                END $$;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reminders_RemindAt",
                schema: "crm",
                table: "Reminders");

            migrationBuilder.DropIndex(
                name: "IX_Reminders_Status",
                schema: "crm",
                table: "Reminders");

            migrationBuilder.DropIndex(
                name: "IX_Reminders_TenantId",
                schema: "crm",
                table: "Reminders");

            migrationBuilder.DropIndex(
                name: "IX_Reminders_TenantId_Status_RemindAt",
                schema: "crm",
                table: "Reminders");

            migrationBuilder.DropIndex(
                name: "IX_Reminders_TenantId_UserId_Status",
                schema: "crm",
                table: "Reminders");

            migrationBuilder.DropIndex(
                name: "IX_Reminders_UserId",
                schema: "crm",
                table: "Reminders");

            // Drop Notifications indexes
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'crm' AND table_name = 'Notifications') THEN
                        DROP INDEX IF EXISTS crm.""IX_Notifications_Status"";
                        DROP INDEX IF EXISTS crm.""IX_Notifications_TenantId"";
                        DROP INDEX IF EXISTS crm.""IX_Notifications_TenantId_UserId_ReadAt"";
                        DROP INDEX IF EXISTS crm.""IX_Notifications_TenantId_UserId_Status"";
                        DROP INDEX IF EXISTS crm.""IX_Notifications_UserId"";
                    END IF;
                END $$;
            ");

            // Revert Reminders columns to integer
            migrationBuilder.Sql(@"
                ALTER TABLE crm.""Reminders""
                ALTER COLUMN ""Status"" TYPE integer
                USING CASE ""Status""
                    WHEN 'Pending' THEN 0
                    WHEN 'Snoozed' THEN 1
                    WHEN 'Triggered' THEN 2
                    WHEN 'Completed' THEN 3
                    WHEN 'Dismissed' THEN 4
                    ELSE 0
                END;
            ");

            migrationBuilder.Sql(@"
                ALTER TABLE crm.""Reminders""
                ALTER COLUMN ""Type"" TYPE integer
                USING CASE ""Type""
                    WHEN 'General' THEN 0
                    WHEN 'Task' THEN 1
                    WHEN 'Meeting' THEN 2
                    WHEN 'FollowUp' THEN 3
                    WHEN 'Birthday' THEN 4
                    WHEN 'ContractRenewal' THEN 5
                    WHEN 'PaymentDue' THEN 6
                    ELSE 0
                END;
            ");

            migrationBuilder.Sql(@"
                ALTER TABLE crm.""Reminders""
                ALTER COLUMN ""RecurrenceType"" TYPE integer
                USING CASE ""RecurrenceType""
                    WHEN 'None' THEN 0
                    WHEN 'Daily' THEN 1
                    WHEN 'Weekly' THEN 2
                    WHEN 'Monthly' THEN 3
                    WHEN 'Yearly' THEN 4
                    ELSE 0
                END;
            ");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                schema: "crm",
                table: "Reminders",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "RelatedEntityType",
                schema: "crm",
                table: "Reminders",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RecurrencePattern",
                schema: "crm",
                table: "Reminders",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Participants",
                schema: "crm",
                table: "Reminders",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(4000)",
                oldMaxLength: 4000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "crm",
                table: "Reminders",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            // Revert Notifications columns
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'crm' AND table_name = 'Notifications') THEN
                        ALTER TABLE crm.""Notifications""
                        ALTER COLUMN ""Status"" TYPE integer
                        USING CASE ""Status""
                            WHEN 'Pending' THEN 0
                            WHEN 'Sent' THEN 1
                            WHEN 'Failed' THEN 2
                            ELSE 0
                        END;

                        ALTER TABLE crm.""Notifications""
                        ALTER COLUMN ""Type"" TYPE integer
                        USING CASE ""Type""
                            WHEN 'Info' THEN 0
                            WHEN 'Warning' THEN 1
                            WHEN 'Error' THEN 2
                            WHEN 'Success' THEN 3
                            ELSE 0
                        END;

                        ALTER TABLE crm.""Notifications""
                        ALTER COLUMN ""Channel"" TYPE integer
                        USING CASE ""Channel""
                            WHEN 'InApp' THEN 0
                            WHEN 'Email' THEN 1
                            WHEN 'Push' THEN 2
                            WHEN 'SMS' THEN 3
                            ELSE 0
                        END;

                        ALTER TABLE crm.""Notifications"" ALTER COLUMN ""Title"" TYPE text;
                        ALTER TABLE crm.""Notifications"" ALTER COLUMN ""Message"" TYPE text;
                        ALTER TABLE crm.""Notifications"" ALTER COLUMN ""RelatedEntityType"" TYPE text;
                        ALTER TABLE crm.""Notifications"" ALTER COLUMN ""ErrorMessage"" TYPE text;
                        ALTER TABLE crm.""Notifications"" ALTER COLUMN ""Metadata"" TYPE text;
                    END IF;
                END $$;
            ");
        }
    }
}
