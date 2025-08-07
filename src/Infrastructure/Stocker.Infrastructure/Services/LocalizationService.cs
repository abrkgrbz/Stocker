using Microsoft.Extensions.Localization;
using Stocker.Application.Common.Resources;
using Stocker.Application.Common.Services;
using System.Globalization;

namespace Stocker.Infrastructure.Services;

/// <summary>
/// Implementation of localization service
/// </summary>
public class LocalizationService : ILocalizationService
{
    private readonly IStringLocalizer<LocalizationResource> _localizer;
    private CultureInfo _currentCulture;

    public LocalizationService(IStringLocalizer<LocalizationResource> localizer)
    {
        _localizer = localizer;
        _currentCulture = CultureInfo.CurrentCulture;
    }

    public string CurrentCulture => _currentCulture.Name;

    public string GetLocalizedString(string key)
    {
        return _localizer[key];
    }

    public string GetLocalizedString(string key, params object[] parameters)
    {
        return string.Format(_localizer[key], parameters);
    }

    public void SetCulture(string culture)
    {
        _currentCulture = new CultureInfo(culture);
        CultureInfo.CurrentCulture = _currentCulture;
        CultureInfo.CurrentUICulture = _currentCulture;
    }
}