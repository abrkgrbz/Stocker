using Stocker.SharedKernel.Common;

namespace Stocker.Modules.Inventory.Domain.Entities;

/// <summary>
/// Unit of measurement for products (e.g., Piece, Kilogram, Liter, Box)
/// </summary>
public class Unit : BaseEntity
{
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? Symbol { get; private set; }
    public string? Description { get; private set; }
    public bool IsBaseUnit { get; private set; }
    public int? BaseUnitId { get; private set; }
    public decimal ConversionFactor { get; private set; }
    public bool AllowDecimals { get; private set; }
    public int DecimalPlaces { get; private set; }
    public bool IsActive { get; private set; }
    public int DisplayOrder { get; private set; }

    public virtual Unit? BaseUnit { get; private set; }
    public virtual ICollection<Unit> DerivedUnits { get; private set; }
    public virtual ICollection<Product> Products { get; private set; }

    protected Unit() { }

    public Unit(string code, string name, string? symbol = null)
    {
        Code = code;
        Name = name;
        Symbol = symbol;
        IsBaseUnit = true;
        ConversionFactor = 1;
        AllowDecimals = false;
        DecimalPlaces = 0;
        IsActive = true;
        DisplayOrder = 0;
        DerivedUnits = new List<Unit>();
        Products = new List<Product>();
    }

    public static Unit CreateDerivedUnit(
        string code,
        string name,
        int baseUnitId,
        decimal conversionFactor,
        string? symbol = null)
    {
        var unit = new Unit(code, name, symbol);
        unit.IsBaseUnit = false;
        unit.BaseUnitId = baseUnitId;
        unit.ConversionFactor = conversionFactor;
        return unit;
    }

    public void UpdateUnit(string name, string? symbol, string? description)
    {
        Name = name;
        Symbol = symbol;
        Description = description;
    }

    public void SetDecimalSettings(bool allowDecimals, int decimalPlaces)
    {
        AllowDecimals = allowDecimals;
        DecimalPlaces = allowDecimals ? decimalPlaces : 0;
    }

    public void SetDisplayOrder(int order)
    {
        DisplayOrder = order;
    }

    public void SetConversionFactor(decimal factor)
    {
        if (IsBaseUnit)
            throw new InvalidOperationException("Cannot set conversion factor for base unit");

        ConversionFactor = factor;
    }

    public decimal ConvertToBase(decimal quantity)
    {
        return quantity * ConversionFactor;
    }

    public decimal ConvertFromBase(decimal quantity)
    {
        return quantity / ConversionFactor;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
