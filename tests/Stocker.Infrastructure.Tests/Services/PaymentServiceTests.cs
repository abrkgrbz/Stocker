using Xunit;
using Moq;
using Moq.Protected;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stocker.Infrastructure.Services;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Text;
using Newtonsoft.Json;
using FluentAssertions;

namespace Stocker.Infrastructure.Tests.Services;

public class PaymentServiceTests
{
    private readonly Mock<IConfiguration> _configurationMock;
    private readonly Mock<ILogger<PaymentService>> _loggerMock;
    private readonly Mock<IHttpClientFactory> _httpClientFactoryMock;
    private readonly Mock<HttpMessageHandler> _httpMessageHandlerMock;
    private readonly PaymentService _paymentService;

    public PaymentServiceTests()
    {
        _configurationMock = new Mock<IConfiguration>();
        _loggerMock = new Mock<ILogger<PaymentService>>();
        _httpClientFactoryMock = new Mock<IHttpClientFactory>();
        _httpMessageHandlerMock = new Mock<HttpMessageHandler>();

        // Setup configuration
        _configurationMock.Setup(x => x["Payment:Iyzico:ApiKey"]).Returns("sandbox-api-key");
        _configurationMock.Setup(x => x["Payment:Iyzico:SecretKey"]).Returns("sandbox-secret-key");
        _configurationMock.Setup(x => x["Payment:Iyzico:BaseUrl"]).Returns("https://sandbox-api.iyzipay.com");

        // Setup HttpClient
        var httpClient = new HttpClient(_httpMessageHandlerMock.Object);
        _httpClientFactoryMock.Setup(x => x.CreateClient("Iyzico")).Returns(httpClient);

        _paymentService = new PaymentService(
            _configurationMock.Object,
            _loggerMock.Object,
            _httpClientFactoryMock.Object);
    }

    [Fact]
    public async Task ProcessPaymentAsync_Success_ReturnsSuccessResult()
    {
        // Arrange
        var request = CreateTestPaymentRequest();
        var successResponse = new IyzicoPaymentResponse
        {
            Status = "success",
            PaymentId = "12345678",
            PaymentTransId = "trans-123",
            ConversationId = "conv-123"
        };

        SetupHttpResponse(HttpStatusCode.OK, successResponse);

        // Act
        var result = await _paymentService.ProcessPaymentAsync(request);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.PaymentId.Should().Be("12345678");
        result.Value.Status.Should().Be(PaymentStatus.Success);
        result.Value.TransactionId.Should().Be("trans-123");
        result.Value.Amount.Should().Be(request.Amount);
    }

    [Fact]
    public async Task ProcessPaymentAsync_Failure_ReturnsFailureResult()
    {
        // Arrange
        var request = CreateTestPaymentRequest();
        var failureResponse = new IyzicoPaymentResponse
        {
            Status = "failure",
            ErrorCode = "12",
            ErrorMessage = "Invalid card number"
        };

        SetupHttpResponse(HttpStatusCode.OK, failureResponse);

        // Act
        var result = await _paymentService.ProcessPaymentAsync(request);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error!.Code.Should().Be("Payment.Failed");
        result.Error.Message.Should().Be("Invalid card number");
    }

    [Fact]
    public async Task ProcessPaymentAsync_HttpError_ReturnsFailureResult()
    {
        // Arrange
        var request = CreateTestPaymentRequest();
        SetupHttpResponse(HttpStatusCode.BadRequest, null);

        // Act
        var result = await _paymentService.ProcessPaymentAsync(request);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error!.Code.Should().Be("Payment.RequestFailed");
    }

    [Fact]
    public async Task ProcessPaymentAsync_Exception_ReturnsFailureResult()
    {
        // Arrange
        var request = CreateTestPaymentRequest();
        
        _httpMessageHandlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ThrowsAsync(new HttpRequestException("Network error"));

        // Act
        var result = await _paymentService.ProcessPaymentAsync(request);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error!.Code.Should().Be("Payment.Error");
        result.Error.Message.Should().Contain("Network error");
    }

    [Fact]
    public async Task RefundPaymentAsync_Success_ReturnsSuccessResult()
    {
        // Arrange
        var paymentId = "12345678";
        var amount = 100.00m;
        var successResponse = new IyzicoRefundResponse
        {
            Status = "success",
            PaymentId = paymentId,
            PaymentTransId = "refund-trans-123",
            Price = "100.00",
            Currency = "TRY"
        };

        SetupHttpResponse(HttpStatusCode.OK, successResponse);

        // Act
        var result = await _paymentService.RefundPaymentAsync(paymentId, amount);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.PaymentId.Should().Be(paymentId);
        result.Value.Status.Should().Be(PaymentStatus.Refunded);
        result.Value.Amount.Should().Be(amount);
    }

    [Fact]
    public async Task GetPaymentStatusAsync_Success_ReturnsCorrectStatus()
    {
        // Arrange
        var paymentId = "12345678";
        var successResponse = new IyzicoPaymentDetailResponse
        {
            Status = "success",
            PaymentStatus = "SUCCESS",
            PaymentId = paymentId
        };

        SetupHttpResponse(HttpStatusCode.OK, successResponse);

        // Act
        var result = await _paymentService.GetPaymentStatusAsync(paymentId);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(PaymentStatus.Success);
    }

    [Fact]
    public async Task GetPaymentStatusAsync_PendingStatus_ReturnsPending()
    {
        // Arrange
        var paymentId = "12345678";
        var pendingResponse = new IyzicoPaymentDetailResponse
        {
            Status = "success",
            PaymentStatus = "INIT_THREEDS",
            PaymentId = paymentId
        };

        SetupHttpResponse(HttpStatusCode.OK, pendingResponse);

        // Act
        var result = await _paymentService.GetPaymentStatusAsync(paymentId);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(PaymentStatus.Pending);
    }

    [Fact]
    public async Task GetPaymentHistoryAsync_ReturnsEmptyList()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var result = await _paymentService.GetPaymentHistoryAsync(tenantId);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Count.Should().Be(0);
    }

    private PaymentRequest CreateTestPaymentRequest()
    {
        return new PaymentRequest
        {
            TenantId = Guid.NewGuid(),
            OrderId = "TEST-ORDER-001",
            Amount = 100.00m,
            Currency = "TRY",
            Description = "Test Payment",
            CardHolderName = "John Doe",
            CardNumber = "5528790000000008",
            ExpiryMonth = "12",
            ExpiryYear = "2030",
            Cvv = "123",
            BuyerName = "John",
            BuyerSurname = "Doe",
            BuyerEmail = "test@test.com",
            BuyerPhone = "+905350000000",
            BuyerIdentityNumber = "74300864791",
            BuyerAddress = "Test Address",
            BuyerCity = "Istanbul",
            BuyerIp = "127.0.0.1"
        };
    }

    private void SetupHttpResponse<T>(HttpStatusCode statusCode, T? responseContent)
    {
        var httpResponse = new HttpResponseMessage
        {
            StatusCode = statusCode,
            Content = responseContent != null 
                ? new StringContent(JsonConvert.SerializeObject(responseContent), Encoding.UTF8, "application/json")
                : new StringContent("", Encoding.UTF8, "application/json")
        };

        _httpMessageHandlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(httpResponse);
    }
}

// Test-specific response classes (since they're internal in PaymentService)
public class IyzicoPaymentResponse
{
    public string? Status { get; set; }
    public string? ErrorCode { get; set; }
    public string? ErrorMessage { get; set; }
    public string? PaymentId { get; set; }
    public string? PaymentTransId { get; set; }
    public string? ConversationId { get; set; }
}

public class IyzicoRefundResponse : IyzicoPaymentResponse
{
    public string? Price { get; set; }
    public string? Currency { get; set; }
}

public class IyzicoPaymentDetailResponse : IyzicoPaymentResponse
{
    public string? PaymentStatus { get; set; }
    public string? Price { get; set; }
    public string? PaidPrice { get; set; }
    public string? Currency { get; set; }
}