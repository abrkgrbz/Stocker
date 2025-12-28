using Stocker.Domain.Migration.Enums;

namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Interface for generating Excel templates for data migration
/// </summary>
public interface IExcelTemplateGenerator
{
    /// <summary>
    /// Generates an Excel template for the specified entity type
    /// </summary>
    /// <param name="entityType">The migration entity type</param>
    /// <returns>The Excel file content, file name, and content type</returns>
    (byte[] FileContent, string FileName, string ContentType) GenerateTemplate(MigrationEntityType entityType);
}
