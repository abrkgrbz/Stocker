namespace Stocker.Modules.CMS.Application.DTOs;

public record CMSSettingDto(
    Guid Id,
    string Key,
    string Value,
    string Group,
    string? Description
);

public record CreateSettingDto(
    string Key,
    string Value,
    string Group = "general",
    string? Description = null
);

public record UpdateSettingDto(
    string Value,
    string? Group = null,
    string? Description = null
);
