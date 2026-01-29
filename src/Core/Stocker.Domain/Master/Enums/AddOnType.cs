namespace Stocker.Domain.Master.Enums;

/// <summary>
/// Add-on türleri
/// </summary>
public enum AddOnType
{
    /// <summary>
    /// Özellik add-on'u (Gelişmiş Raporlama, Çoklu Şube vb.)
    /// </summary>
    Feature = 0,

    /// <summary>
    /// Depolama add-on'u (Ek 50GB, 100GB vb.)
    /// </summary>
    Storage = 1,

    /// <summary>
    /// Kullanıcı add-on'u (Ek kullanıcı paketi)
    /// </summary>
    Users = 2,

    /// <summary>
    /// API add-on'u (API erişimi, rate limit artışı)
    /// </summary>
    Api = 3,

    /// <summary>
    /// Entegrasyon add-on'u (WhatsApp, E-Fatura, Marketplace vb.)
    /// </summary>
    Integration = 4,

    /// <summary>
    /// Destek add-on'u (Öncelikli destek, 7/24 destek vb.)
    /// </summary>
    Support = 5
}
