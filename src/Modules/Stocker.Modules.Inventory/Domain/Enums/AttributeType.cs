namespace Stocker.Modules.Inventory.Domain.Enums;

/// <summary>
/// Data type for product attributes
/// </summary>
public enum AttributeType
{
    /// <summary>
    /// Single line text input
    /// </summary>
    Text = 1,

    /// <summary>
    /// Multi-line text area
    /// </summary>
    TextArea = 2,

    /// <summary>
    /// Integer number
    /// </summary>
    Integer = 3,

    /// <summary>
    /// Decimal number
    /// </summary>
    Decimal = 4,

    /// <summary>
    /// Boolean (true/false)
    /// </summary>
    Boolean = 5,

    /// <summary>
    /// Date only
    /// </summary>
    Date = 6,

    /// <summary>
    /// Date and time
    /// </summary>
    DateTime = 7,

    /// <summary>
    /// Single selection from options
    /// </summary>
    Select = 8,

    /// <summary>
    /// Multiple selection from options
    /// </summary>
    MultiSelect = 9,

    /// <summary>
    /// Color picker
    /// </summary>
    Color = 10,

    /// <summary>
    /// URL/hyperlink
    /// </summary>
    Url = 11,

    /// <summary>
    /// File/image attachment
    /// </summary>
    File = 12,

    /// <summary>
    /// Size selection (S, M, L, XL, etc.)
    /// </summary>
    Size = 13
}
