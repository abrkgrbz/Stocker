using System;

namespace Stocker.Application.DTOs;

/// <summary>
/// Setting data transfer object
/// </summary>
public class SettingDto
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Description { get; set; }
    public string? DataType { get; set; }
    public bool IsReadOnly { get; set; }
    public bool IsEncrypted { get; set; }
    public DateTime? LastModified { get; set; }
    public string? ModifiedBy { get; set; }
}