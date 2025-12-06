namespace Stocker.Modules.HR.Domain.Enums;

/// <summary>
/// İstihdam türü
/// </summary>
public enum EmploymentType
{
    /// <summary>
    /// Tam zamanlı
    /// </summary>
    FullTime = 1,

    /// <summary>
    /// Yarı zamanlı
    /// </summary>
    PartTime = 2,

    /// <summary>
    /// Sözleşmeli
    /// </summary>
    Contract = 3,

    /// <summary>
    /// Stajyer
    /// </summary>
    Intern = 4,

    /// <summary>
    /// Geçici
    /// </summary>
    Temporary = 5,

    /// <summary>
    /// Danışman
    /// </summary>
    Consultant = 6,

    /// <summary>
    /// Freelance
    /// </summary>
    Freelance = 7,

    /// <summary>
    /// Deneme süresi
    /// </summary>
    Probation = 8
}
