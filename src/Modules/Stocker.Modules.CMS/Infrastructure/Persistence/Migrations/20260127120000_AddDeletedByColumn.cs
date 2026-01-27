using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Modules.CMS.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddDeletedByColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Core CMS tables
            AddDeletedByColumnToTable(migrationBuilder, "pages");
            AddDeletedByColumnToTable(migrationBuilder, "blog_categories");
            AddDeletedByColumnToTable(migrationBuilder, "blog_posts");
            AddDeletedByColumnToTable(migrationBuilder, "faq_categories");
            AddDeletedByColumnToTable(migrationBuilder, "faq_items");
            AddDeletedByColumnToTable(migrationBuilder, "media");
            AddDeletedByColumnToTable(migrationBuilder, "settings");
            AddDeletedByColumnToTable(migrationBuilder, "updates");

            // Landing Page tables
            AddDeletedByColumnToTable(migrationBuilder, "testimonials");
            AddDeletedByColumnToTable(migrationBuilder, "pricing_plans");
            AddDeletedByColumnToTable(migrationBuilder, "pricing_features");
            AddDeletedByColumnToTable(migrationBuilder, "features");
            AddDeletedByColumnToTable(migrationBuilder, "industries");
            AddDeletedByColumnToTable(migrationBuilder, "integrations");
            AddDeletedByColumnToTable(migrationBuilder, "integration_items");
            AddDeletedByColumnToTable(migrationBuilder, "stats");
            AddDeletedByColumnToTable(migrationBuilder, "partners");
            AddDeletedByColumnToTable(migrationBuilder, "achievements");

            // Company Page tables
            AddDeletedByColumnToTable(migrationBuilder, "team_members");
            AddDeletedByColumnToTable(migrationBuilder, "company_values");
            AddDeletedByColumnToTable(migrationBuilder, "contact_info");

            // Documentation tables
            AddDeletedByColumnToTable(migrationBuilder, "doc_categories");
            AddDeletedByColumnToTable(migrationBuilder, "doc_articles");

            // Social tables
            AddDeletedByColumnToTable(migrationBuilder, "social_links");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Core CMS tables
            RemoveDeletedByColumnFromTable(migrationBuilder, "pages");
            RemoveDeletedByColumnFromTable(migrationBuilder, "blog_categories");
            RemoveDeletedByColumnFromTable(migrationBuilder, "blog_posts");
            RemoveDeletedByColumnFromTable(migrationBuilder, "faq_categories");
            RemoveDeletedByColumnFromTable(migrationBuilder, "faq_items");
            RemoveDeletedByColumnFromTable(migrationBuilder, "media");
            RemoveDeletedByColumnFromTable(migrationBuilder, "settings");
            RemoveDeletedByColumnFromTable(migrationBuilder, "updates");

            // Landing Page tables
            RemoveDeletedByColumnFromTable(migrationBuilder, "testimonials");
            RemoveDeletedByColumnFromTable(migrationBuilder, "pricing_plans");
            RemoveDeletedByColumnFromTable(migrationBuilder, "pricing_features");
            RemoveDeletedByColumnFromTable(migrationBuilder, "features");
            RemoveDeletedByColumnFromTable(migrationBuilder, "industries");
            RemoveDeletedByColumnFromTable(migrationBuilder, "integrations");
            RemoveDeletedByColumnFromTable(migrationBuilder, "integration_items");
            RemoveDeletedByColumnFromTable(migrationBuilder, "stats");
            RemoveDeletedByColumnFromTable(migrationBuilder, "partners");
            RemoveDeletedByColumnFromTable(migrationBuilder, "achievements");

            // Company Page tables
            RemoveDeletedByColumnFromTable(migrationBuilder, "team_members");
            RemoveDeletedByColumnFromTable(migrationBuilder, "company_values");
            RemoveDeletedByColumnFromTable(migrationBuilder, "contact_info");

            // Documentation tables
            RemoveDeletedByColumnFromTable(migrationBuilder, "doc_categories");
            RemoveDeletedByColumnFromTable(migrationBuilder, "doc_articles");

            // Social tables
            RemoveDeletedByColumnFromTable(migrationBuilder, "social_links");
        }

        private static void AddDeletedByColumnToTable(MigrationBuilder migrationBuilder, string tableName)
        {
            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "cms",
                table: tableName,
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        private static void RemoveDeletedByColumnFromTable(MigrationBuilder migrationBuilder, string tableName)
        {
            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "cms",
                table: tableName);
        }
    }
}
