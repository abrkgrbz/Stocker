namespace Stocker.Domain.Master.Enums;

public enum PaymentMethod
{
    CreditCard = 0,
    DebitCard = 1,
    BankTransfer = 2,
    PayPal = 3,
    Stripe = 4,
    Other = 5
}