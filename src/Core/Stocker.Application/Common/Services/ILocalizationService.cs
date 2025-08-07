namespace Stocker.Application.Common.Services;

/// <summary>
/// Service for handling localization
/// </summary>
public interface ILocalizationService
{
    /// <summary>
    /// Gets localized string for the given key
    /// </summary>
    string GetLocalizedString(string key);

    /// <summary>
    /// Gets localized string with parameters
    /// </summary>
    string GetLocalizedString(string key, params object[] parameters);

    /// <summary>
    /// Gets the current culture
    /// </summary>
    string CurrentCulture { get; }

    /// <summary>
    /// Sets the culture for the current request
    /// </summary>
    void SetCulture(string culture);
}