using Stocker.SharedKernel.Results;

namespace Stocker.Application.Services;

/// <summary>
/// Service for interacting with Iyzico payment platform
/// Iyzico is a Turkish payment gateway supporting subscriptions and one-time payments
/// </summary>
public interface IIyzicoService
{
    // Checkout (3D Secure payment form)
    Task<Result<IyzicoCheckoutResponse>> CreateCheckoutFormAsync(IyzicoCheckoutRequest request, CancellationToken cancellationToken = default);
    Task<Result<IyzicoPaymentResult>> RetrieveCheckoutFormResultAsync(string token, CancellationToken cancellationToken = default);

    // 3D Secure Verification
    Task<Result<Iyzico3DSecureResult>> Verify3DSecureAsync(string token, CancellationToken cancellationToken = default);

    // Checkout Form Result (alias for RetrieveCheckoutFormResultAsync)
    Task<Result<IyzicoCheckoutFormResult>> GetCheckoutFormResultAsync(string token, CancellationToken cancellationToken = default);

    // Subscription Management
    Task<Result<IyzicoSubscriptionInfo>> CreateSubscriptionAsync(IyzicoCreateSubscriptionRequest request, CancellationToken cancellationToken = default);
    Task<Result<IyzicoSubscriptionInfo>> GetSubscriptionAsync(string subscriptionReferenceCode, CancellationToken cancellationToken = default);
    Task<Result> CancelSubscriptionAsync(string subscriptionReferenceCode, CancellationToken cancellationToken = default);
    Task<Result> UpgradeSubscriptionAsync(string subscriptionReferenceCode, string newPricingPlanReferenceCode, CancellationToken cancellationToken = default);
    Task<Result> DowngradeSubscriptionAsync(string subscriptionReferenceCode, string newPricingPlanReferenceCode, CancellationToken cancellationToken = default);
    Task<Result> RetrySubscriptionPaymentAsync(string subscriptionReferenceCode, CancellationToken cancellationToken = default);

    // Customer Management
    Task<Result<IyzicoCustomerInfo>> CreateCustomerAsync(IyzicoCreateCustomerRequest request, CancellationToken cancellationToken = default);
    Task<Result<IyzicoCustomerInfo>> GetCustomerAsync(string customerReferenceCode, CancellationToken cancellationToken = default);
    Task<Result> UpdateCustomerAsync(string customerReferenceCode, IyzicoUpdateCustomerRequest request, CancellationToken cancellationToken = default);

    // Card Management
    Task<Result<IyzicoCardInfo>> SaveCardAsync(IyzicoSaveCardRequest request, CancellationToken cancellationToken = default);
    Task<Result<List<IyzicoCardInfo>>> GetSavedCardsAsync(string customerReferenceCode, CancellationToken cancellationToken = default);
    Task<Result> DeleteSavedCardAsync(string cardToken, string customerReferenceCode, CancellationToken cancellationToken = default);

    // Pricing Plans
    Task<Result<List<IyzicoPricingPlan>>> GetPricingPlansAsync(string productReferenceCode, CancellationToken cancellationToken = default);
    Task<Result<IyzicoPricingPlan>> CreatePricingPlanAsync(IyzicoCreatePricingPlanRequest request, CancellationToken cancellationToken = default);

    // Webhooks
    Task<Result> ProcessWebhookAsync(string payload, CancellationToken cancellationToken = default);

    // Installment Options
    Task<Result<IyzicoInstallmentInfo>> GetInstallmentOptionsAsync(string binNumber, decimal price, CancellationToken cancellationToken = default);

    // Refund
    Task<Result<IyzicoRefundResult>> RefundPaymentAsync(string paymentTransactionId, decimal amount, CancellationToken cancellationToken = default);
}

#region Request/Response DTOs

public record IyzicoCheckoutRequest
{
    public Guid TenantId { get; init; }
    public string CustomerEmail { get; init; } = string.Empty;
    public string CustomerName { get; init; } = string.Empty;
    public string? CustomerGsmNumber { get; init; }
    public string? CustomerIdentityNumber { get; init; }
    public decimal Price { get; init; }
    public string Currency { get; init; } = "TRY";
    public string? BasketId { get; init; }
    public string PaymentGroup { get; init; } = "SUBSCRIPTION"; // PRODUCT, LISTING, SUBSCRIPTION
    public string CallbackUrl { get; init; } = string.Empty;
    public IyzicoAddress? BillingAddress { get; init; }
    public IyzicoAddress? ShippingAddress { get; init; }
    public List<IyzicoBasketItem> BasketItems { get; init; } = new();
    public int? InstallmentCount { get; init; }
    public bool EnableInstallment { get; init; } = true;
    public bool Enable3DSecure { get; init; } = true;
}

public record IyzicoAddress
{
    public string ContactName { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string Country { get; init; } = "Turkey";
    public string Address { get; init; } = string.Empty;
    public string? ZipCode { get; init; }
}

public record IyzicoBasketItem
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Category1 { get; init; } = string.Empty;
    public string? Category2 { get; init; }
    public string ItemType { get; init; } = "VIRTUAL"; // PHYSICAL, VIRTUAL
    public decimal Price { get; init; }
}

public record IyzicoCheckoutResponse
{
    public string Token { get; init; } = string.Empty;
    public string CheckoutFormContent { get; init; } = string.Empty;
    public long TokenExpireTime { get; init; }
    public string PaymentPageUrl { get; init; } = string.Empty;
}

public record IyzicoPaymentResult
{
    public bool Success { get; init; }
    public string? PaymentId { get; init; }
    public string? PaymentTransactionId { get; init; }
    public decimal? PaidPrice { get; init; }
    public string? Currency { get; init; }
    public int? Installment { get; init; }
    public string? CardAssociation { get; init; }
    public string? CardFamily { get; init; }
    public string? CardType { get; init; }
    public string? BinNumber { get; init; }
    public string? LastFourDigits { get; init; }
    public string? ErrorCode { get; init; }
    public string? ErrorMessage { get; init; }
}

public record IyzicoCreateSubscriptionRequest
{
    public string CustomerReferenceCode { get; init; } = string.Empty;
    public string PricingPlanReferenceCode { get; init; } = string.Empty;
    public string? CardToken { get; init; }
    public string? SubscriptionInitialStatus { get; init; } = "ACTIVE"; // ACTIVE, PENDING
    public string? CardHolderName { get; init; }
    public string? CardNumber { get; init; }
    public string? ExpireMonth { get; init; }
    public string? ExpireYear { get; init; }
    public string? Cvc { get; init; }
    public bool RegisterCard { get; init; } = true;
}

public record IyzicoSubscriptionInfo
{
    public string ReferenceCode { get; init; } = string.Empty;
    public string ParentReferenceCode { get; init; } = string.Empty;
    public string CustomerReferenceCode { get; init; } = string.Empty;
    public string PricingPlanReferenceCode { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public DateTime? TrialStartDate { get; init; }
    public DateTime? TrialEndDate { get; init; }
    public decimal? Price { get; init; }
    public string? Currency { get; init; }
    public string? PlanName { get; init; }
    public string? ProductName { get; init; }
}

public record IyzicoCreateCustomerRequest
{
    public string Name { get; init; } = string.Empty;
    public string Surname { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? GsmNumber { get; init; }
    public string? IdentityNumber { get; init; }
    public string? ShippingContactName { get; init; }
    public string? ShippingCity { get; init; }
    public string? ShippingCountry { get; init; }
    public string? ShippingAddress { get; init; }
    public string? ShippingZipCode { get; init; }
    public string? BillingContactName { get; init; }
    public string? BillingCity { get; init; }
    public string? BillingCountry { get; init; }
    public string? BillingAddress { get; init; }
    public string? BillingZipCode { get; init; }
}

public record IyzicoCustomerInfo
{
    public string ReferenceCode { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Surname { get; init; } = string.Empty;
    public string? GsmNumber { get; init; }
    public string? IdentityNumber { get; init; }
    public DateTime CreatedDate { get; init; }
}

public record IyzicoUpdateCustomerRequest
{
    public string? Name { get; init; }
    public string? Surname { get; init; }
    public string? GsmNumber { get; init; }
    public string? IdentityNumber { get; init; }
    public string? BillingContactName { get; init; }
    public string? BillingCity { get; init; }
    public string? BillingCountry { get; init; }
    public string? BillingAddress { get; init; }
    public string? BillingZipCode { get; init; }
}

public record IyzicoSaveCardRequest
{
    public string CustomerReferenceCode { get; init; } = string.Empty;
    public string CardAlias { get; init; } = string.Empty;
    public string CardHolderName { get; init; } = string.Empty;
    public string CardNumber { get; init; } = string.Empty;
    public string ExpireMonth { get; init; } = string.Empty;
    public string ExpireYear { get; init; } = string.Empty;
}

public record IyzicoCardInfo
{
    public string CardToken { get; init; } = string.Empty;
    public string CardAlias { get; init; } = string.Empty;
    public string BinNumber { get; init; } = string.Empty;
    public string LastFourDigits { get; init; } = string.Empty;
    public string CardType { get; init; } = string.Empty;
    public string CardAssociation { get; init; } = string.Empty;
    public string CardFamily { get; init; } = string.Empty;
    public string? CardBankName { get; init; }
    public int? CardBankCode { get; init; }
}

public record IyzicoPricingPlan
{
    public string ReferenceCode { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string ProductReferenceCode { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public string Currency { get; init; } = "TRY";
    public string PaymentInterval { get; init; } = "MONTHLY"; // DAILY, WEEKLY, MONTHLY, YEARLY
    public int PaymentIntervalCount { get; init; } = 1;
    public int? TrialPeriodDays { get; init; }
    public int? RecurrenceCount { get; init; }
    public string PlanPaymentType { get; init; } = "RECURRING"; // RECURRING
    public string Status { get; init; } = string.Empty;
}

public record IyzicoCreatePricingPlanRequest
{
    public string Name { get; init; } = string.Empty;
    public string ProductReferenceCode { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public string Currency { get; init; } = "TRY";
    public string PaymentInterval { get; init; } = "MONTHLY";
    public int PaymentIntervalCount { get; init; } = 1;
    public int? TrialPeriodDays { get; init; }
    public int? RecurrenceCount { get; init; }
    public string PlanPaymentType { get; init; } = "RECURRING";
}

public record IyzicoInstallmentInfo
{
    public string BinNumber { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public string? CardAssociation { get; init; }
    public string? CardFamily { get; init; }
    public string? CardType { get; init; }
    public string? BankName { get; init; }
    public int? BankCode { get; init; }
    public List<IyzicoInstallmentDetail> InstallmentDetails { get; init; } = new();
}

public record IyzicoInstallmentDetail
{
    public int InstallmentNumber { get; init; }
    public decimal TotalPrice { get; init; }
    public decimal InstallmentPrice { get; init; }
}

public record IyzicoRefundResult
{
    public bool Success { get; init; }
    public string? PaymentTransactionId { get; init; }
    public decimal? RefundedAmount { get; init; }
    public string? ErrorCode { get; init; }
    public string? ErrorMessage { get; init; }
}

public record Iyzico3DSecureResult
{
    public bool IsSuccess { get; init; }
    public string? PaymentId { get; init; }
    public string? PaymentTransactionId { get; init; }
    public decimal? PaidPrice { get; init; }
    public string? Currency { get; init; }
    public int? Installment { get; init; }
    public string? CardAssociation { get; init; }
    public string? CardFamily { get; init; }
    public string? BinNumber { get; init; }
    public string? LastFourDigits { get; init; }
    public string? MdStatus { get; init; }
    public string? ErrorCode { get; init; }
    public string? ErrorMessage { get; init; }
}

public record IyzicoCheckoutFormResult
{
    public bool IsSuccess { get; init; }
    public string? PaymentId { get; init; }
    public string? PaymentTransactionId { get; init; }
    public decimal? PaidPrice { get; init; }
    public string? Currency { get; init; }
    public int? Installment { get; init; }
    public string? CardAssociation { get; init; }
    public string? CardFamily { get; init; }
    public string? BinNumber { get; init; }
    public string? LastFourDigits { get; init; }
    public string? CardToken { get; init; }
    public string? ErrorCode { get; init; }
    public string? ErrorMessage { get; init; }
}

#endregion
