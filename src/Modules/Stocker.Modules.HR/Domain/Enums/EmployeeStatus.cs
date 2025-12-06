namespace Stocker.Modules.HR.Domain.Enums;

/// <summary>
/// Çalışan durumu
/// </summary>
public enum EmployeeStatus
{
    /// <summary>
    /// Aktif
    /// </summary>
    Active = 1,

    /// <summary>
    /// Pasif
    /// </summary>
    Inactive = 2,

    /// <summary>
    /// Askıda (Ücretsiz izin vb.)
    /// </summary>
    OnLeave = 3,

    /// <summary>
    /// İşten çıkarıldı
    /// </summary>
    Terminated = 4,

    /// <summary>
    /// İstifa etti
    /// </summary>
    Resigned = 5,

    /// <summary>
    /// Emekli
    /// </summary>
    Retired = 6,

    /// <summary>
    /// Deneme süresinde
    /// </summary>
    Probation = 7,

    /// <summary>
    /// Askerde
    /// </summary>
    MilitaryService = 8,

    /// <summary>
    /// Doğum izni
    /// </summary>
    MaternityLeave = 9,

    /// <summary>
    /// Hastalık izni
    /// </summary>
    SickLeave = 10
}
