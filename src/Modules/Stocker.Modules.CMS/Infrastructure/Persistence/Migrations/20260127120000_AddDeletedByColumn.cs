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
            AddDeletedByColumn(migrationBuilder, "pages");
            AddDeletedByColumn(migrationBuilder, "blog_categories");
            AddDeletedByColumn(migrationBuilder, "blog_posts");
            AddDeletedByColumn(migrationBuilder, "faq_categories");
            AddDeletedByColumn(migrationBuilder, "faq_items");
            AddDeletedByColumn(migrationBuilder, "media");
            AddDeletedByColumn(migrationBuilder, "settings");
            AddDeletedByColumn(migrationBuilder, "updates");

            // Landing Page tables
            AddDeletedByColumn(migrationBuilder, "testimonials");
            AddDeletedByColumn(migrationBuilder, "pricing_plans");
            AddDeletedByColumn(migrationBuilder, "pricing_features");
            AddDeletedByColumn(migrationBuilder, "features");
            AddDeletedByColumn(migrationBuilder, "industries");
            AddDeletedByColumn(migrationBuilder, "integrations");
            AddDeletedByColumn(migrationBuilder, "integration_items");
            AddDeletedByColumn(migrationBuilder, "stats");
            AddDeletedByColumn(migrationBuilder, "partners");
            AddDeletedByColumn(migrationBuilder, "achievements");

            // Company Page tables
            AddDeletedByColumn(migrationBuilder, "team_members");
            AddDeletedByColumn(migrationBuilder, "company_values");
            AddDeletedByColumn(migrationBuilder, "contact_info");

            // Documentation tables
            AddDeletedByColumn(migrationBuilder, "doc_categories");
            AddDeletedByColumn(migrationBuilder, "doc_articles");

            // Social tables
            AddDeletedByColumn(migrationBuilder, "social_links");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Core CMS tables
            RemoveDeletedByColumn(migrationBuilder, "pages");
            RemoveDeletedByColumn(migrationBuilder, "blog_categories");
            RemoveDeletedByColumn(migrationBuilder, "blog_posts");
            RemoveDeletedByColumn(migrationBuilder, "faq_categories");
            RemoveDeletedByColumn(migrationBuilder, "faq_items");
            RemoveDeletedByColumn(migrationBuilder, "media");
            RemoveDeletedByColumn(migrationBuilder, "settings");
            RemoveDeletedByColumn(migrationBuilder, "updates");

            // Landing Page tables
            RemoveDeletedByColumn(migrationBuilder, "testimonials");
            RemoveDeletedByColumn(migrationBuilder, "pricing_plans");
            RemoveDeletedByColumn(migrationBuilder, "pricing_features");
            RemoveDeletedByColumn(migrationBuilder, "features");
            RemoveDeletedByColumn(migrationBuilder, "industries");
            RemoveDeletedByColumn(migrationBuilder, "integrations");
            RemoveDeletedByColumn(migrationBuilder, "integration_items");
            RemoveDeletedByColumn(migrationBuilder, "stats");
            RemoveDeletedByColumn(migrationBuilder, "partners");
            RemoveDeletedByColumn(migrationBuilder, "achievements");

            // Company Page tables
            RemoveDeletedByColumn(migrationBuilder, "team_members");
            RemoveDeletedByColumn(migrationBuilder, "company_values");
            RemoveDeletedByColumn(migrationBuilder, "contact_info");

            // Documentation tables
            RemoveDeletedByColumn(migrationBuilder, "doc_categories");
            RemoveDeletedByColumn(migrationBuilder, "doc_articles");

            // Social tables
            RemoveDeletedByColumn(migrationBuilder, "social_links");
        }

        private static void AddDeletedByColumn(MigrationBuilder migrationBuilder, string tableName)
        {
            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "cms",
                table: tableName,
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        private static void RemoveDeletedByColumn(MigrationBuilder migrationBuilder, string tableName)
        {
            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "cms",
                table: tableName);
        }
    }
}
