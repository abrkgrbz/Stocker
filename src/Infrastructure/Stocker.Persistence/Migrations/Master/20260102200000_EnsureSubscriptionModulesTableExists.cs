using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <summary>
    /// This migration ensures the SubscriptionModules table exists in the master schema.
    /// The table was originally defined in InitialPostgreSQL.cs (root Migrations folder)
    /// but may not have been applied to production databases that only run Master migrations.
    /// </summary>
    public partial class EnsureSubscriptionModulesTableExists : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create SubscriptionModules table if it doesn't exist
            // Using raw SQL to check existence first
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT FROM information_schema.tables
                        WHERE table_schema = 'master'
                        AND table_name = 'SubscriptionModules'
                    ) THEN
                        CREATE TABLE master.""SubscriptionModules"" (
                            ""Id"" uuid NOT NULL,
                            ""SubscriptionId"" uuid NOT NULL,
                            ""ModuleCode"" character varying(256) NOT NULL,
                            ""ModuleName"" character varying(256) NOT NULL,
                            ""MaxEntities"" integer NULL,
                            ""AddedAt"" timestamp with time zone NOT NULL,
                            CONSTRAINT ""PK_SubscriptionModules"" PRIMARY KEY (""Id""),
                            CONSTRAINT ""FK_SubscriptionModules_Subscriptions_SubscriptionId""
                                FOREIGN KEY (""SubscriptionId"")
                                REFERENCES master.""Subscriptions"" (""Id"")
                                ON DELETE CASCADE
                        );

                        CREATE INDEX ""IX_SubscriptionModules_SubscriptionId""
                            ON master.""SubscriptionModules"" (""SubscriptionId"");
                    END IF;
                END $$;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Don't drop the table in Down - it might have data
            // Only drop if explicitly needed
        }
    }
}
