namespace Stocker.SignalR.Models.Validation;

/// <summary>
/// Password strength analysis result
/// </summary>
public class PasswordStrength
{
    /// <summary>
    /// Password strength score (0-100)
    /// </summary>
    public int Score { get; set; }

    /// <summary>
    /// Strength level description (e.g., "Weak", "Medium", "Strong")
    /// </summary>
    public string Level { get; set; } = string.Empty;

    /// <summary>
    /// Color indicator for UI (e.g., "red", "yellow", "green")
    /// </summary>
    public string Color { get; set; } = string.Empty;

    /// <summary>
    /// Suggestions for improving password strength
    /// </summary>
    public string[] Suggestions { get; set; } = Array.Empty<string>();
}
