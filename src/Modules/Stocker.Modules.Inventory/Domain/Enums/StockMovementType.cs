namespace Stocker.Modules.Inventory.Domain.Enums;

public enum StockMovementType
{
    Purchase = 1,
    Sales = 2,
    PurchaseReturn = 3,
    SalesReturn = 4,
    Transfer = 5,
    Production = 6,
    Consumption = 7,
    AdjustmentIncrease = 8,
    AdjustmentDecrease = 9,
    Opening = 10,
    Counting = 11,
    Damage = 12,
    Loss = 13,
    Found = 14
}