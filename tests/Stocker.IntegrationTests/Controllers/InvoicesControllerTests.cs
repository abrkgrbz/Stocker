using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Tenant.Entities;
using Stocker.Domain.Tenant.Enums;
using Stocker.IntegrationTests.DTOs;
using Stocker.Persistence.Contexts;
using Stocker.TestUtilities;
using Xunit;

namespace Stocker.IntegrationTests.Controllers;

public class InvoicesControllerTests : IntegrationTestBase, IClassFixture<WebApplicationFactory<Program>>
{
    private readonly Guid _tenantId;
    private readonly MasterUser _testUser;
    private readonly Tenant _testTenant;
    private readonly Customer _testCustomer;
    private readonly MasterDbContext _masterDbContext;

    public InvoicesControllerTests(WebApplicationFactory<Program> factory) : base(factory)
    {
        // Setup test data
        _testTenant = TestDataBuilder.Master.CreateTenant("Test Company");
        _testUser = TestDataBuilder.Master.CreateUser("admin@test.com");
        _tenantId = _testTenant.Id;

        // Get master database context
        _masterDbContext = GetMasterDbContext();
        
        // Seed master database
        _masterDbContext.Tenants.Add(_testTenant);
        _masterDbContext.MasterUsers.Add(_testUser);
        _masterDbContext.SaveChanges();

        // Create a test customer for invoices
        var tenantDbContext = CreateTenantDbContext();
        _testCustomer = TestDataBuilder.TenantData.CreateCustomer(_tenantId, "Test Customer");
        tenantDbContext.Customers.Add(_testCustomer);
        tenantDbContext.SaveChanges();
        tenantDbContext.Dispose();
    }

    [Fact]
    public async Task GetAll_ShouldReturnEmptyList_WhenNoInvoices()
    {
        // Arrange
        AuthenticateAsAdmin();

        // Act
        var response = await Client.GetAsync($"/api/tenants/{_tenantId}/invoices");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var invoices = await response.Content.ReadFromJsonAsync<List<InvoiceDto>>();
        invoices.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAll_ShouldReturnInvoices_WhenInvoicesExist()
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var tenantDbContext = CreateTenantDbContext();
        var invoice1 = TestDataBuilder.TenantData.CreateInvoice(_tenantId, _testCustomer.Id);
        var invoice2 = TestDataBuilder.TenantData.CreateInvoice(_tenantId, _testCustomer.Id);
        
        tenantDbContext.Invoices.AddRange(invoice1, invoice2);
        await tenantDbContext.SaveChangesAsync();

        // Act
        var response = await Client.GetAsync($"/api/tenants/{_tenantId}/invoices");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var invoices = await response.Content.ReadFromJsonAsync<List<InvoiceDto>>();
        invoices.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetById_ShouldReturnInvoice_WhenInvoiceExists()
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var tenantDbContext = CreateTenantDbContext();
        var invoice = TestDataBuilder.TenantData.CreateInvoice(_tenantId, _testCustomer.Id);
        invoice.SetNotes("Test Notes");
        
        // Add items to invoice
        var item = Domain.Tenant.Entities.InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Test Product",
            2,
            Money.Create(100, "TRY")
        );
        invoice.AddItem(item);
        
        tenantDbContext.Invoices.Add(invoice);
        await tenantDbContext.SaveChangesAsync();

        // Act
        var response = await Client.GetAsync($"/api/tenants/{_tenantId}/invoices/{invoice.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<InvoiceDto>();
        result.Should().NotBeNull();
        result!.Id.Should().Be(invoice.Id);
        result.InvoiceNumber.Should().Be(invoice.InvoiceNumber);
        result.Status.Should().Be("Draft");
        result.TotalAmount.Should().Be(200); // 100 * 2
    }

    [Fact]
    public async Task GetById_ShouldReturnNotFound_WhenInvoiceDoesNotExist()
    {
        // Arrange
        AuthenticateAsAdmin();
        var nonExistentId = Guid.NewGuid();

        // Act
        var response = await Client.GetAsync($"/api/tenants/{_tenantId}/invoices/{nonExistentId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Create_ShouldCreateInvoice_WithValidData()
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var createDto = new CreateInvoiceDto
        {
            InvoiceNumber = "INV-2024-001",
            CustomerId = _testCustomer.Id,
            InvoiceDate = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(30),
            Notes = "Test invoice",
            Terms = "Net 30",
            Items = new List<CreateInvoiceItemDto>
            {
                new CreateInvoiceItemDto
                {
                    ProductId = Guid.NewGuid(),
                    ProductName = "Product 1",
                    Quantity = 2,
                    UnitPrice = 100,
                    Currency = "TRY",
                    Description = "Test product"
                },
                new CreateInvoiceItemDto
                {
                    ProductId = Guid.NewGuid(),
                    ProductName = "Product 2",
                    Quantity = 1,
                    UnitPrice = 50,
                    Currency = "TRY"
                }
            }
        };

        // Act
        var response = await Client.PostAsJsonAsync($"/api/tenants/{_tenantId}/invoices", createDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var result = await response.Content.ReadFromJsonAsync<InvoiceDto>();
        result.Should().NotBeNull();
        result!.InvoiceNumber.Should().Be("INV-2024-001");
        result.Status.Should().Be("Draft");
        result.SubTotal.Should().Be(250); // (100*2) + (50*1)
        result.TotalAmount.Should().Be(250);
        
        // Verify in database
        var tenantDbContext = CreateTenantDbContext();
        var invoice = await tenantDbContext.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == result.Id);
        invoice.Should().NotBeNull();
        invoice!.Items.Should().HaveCount(2);
    }

    [Fact]
    public async Task Create_ShouldReturnBadRequest_WithEmptyInvoiceNumber()
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var createDto = new CreateInvoiceDto
        {
            InvoiceNumber = "", // Empty invoice number
            CustomerId = _testCustomer.Id,
            InvoiceDate = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(30)
        };

        // Act
        var response = await Client.PostAsJsonAsync($"/api/tenants/{_tenantId}/invoices", createDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task SendInvoice_ShouldChangeStatusToSent_WhenInvoiceIsDraft()
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var tenantDbContext = CreateTenantDbContext();
        var invoice = TestDataBuilder.TenantData.CreateInvoice(_tenantId, _testCustomer.Id);
        
        // Add an item to make invoice valid for sending
        var item = Domain.Tenant.Entities.InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Test Product",
            1,
            Money.Create(100, "TRY")
        );
        invoice.AddItem(item);
        
        tenantDbContext.Invoices.Add(invoice);
        await tenantDbContext.SaveChangesAsync();

        // Act
        var response = await Client.PostAsync($"/api/tenants/{_tenantId}/invoices/{invoice.Id}/send", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        // Verify status change
        tenantDbContext = CreateTenantDbContext();
        var sentInvoice = await tenantDbContext.Invoices
            .FirstOrDefaultAsync(i => i.Id == invoice.Id);
        sentInvoice!.Status.Should().Be(InvoiceStatus.Sent);
    }

    [Fact]
    public async Task MarkAsPaid_ShouldChangeStatusToPaid_WhenInvoiceIsSent()
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var tenantDbContext = CreateTenantDbContext();
        var invoice = TestDataBuilder.TenantData.CreateInvoice(_tenantId, _testCustomer.Id);
        
        var item = Domain.Tenant.Entities.InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Test Product",
            1,
            Money.Create(100, "TRY")
        );
        invoice.AddItem(item);
        invoice.Send(); // Send the invoice first
        
        tenantDbContext.Invoices.Add(invoice);
        await tenantDbContext.SaveChangesAsync();

        var paymentDto = new MarkInvoiceAsPaidDto
        {
            PaymentDate = DateTime.UtcNow,
            PaymentMethod = "Credit Card",
            PaymentReference = "PAY-123456"
        };

        // Act
        var response = await Client.PostAsJsonAsync($"/api/tenants/{_tenantId}/invoices/{invoice.Id}/mark-as-paid", paymentDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        // Verify status change
        tenantDbContext = CreateTenantDbContext();
        var paidInvoice = await tenantDbContext.Invoices
            .FirstOrDefaultAsync(i => i.Id == invoice.Id);
        paidInvoice!.Status.Should().Be(InvoiceStatus.Paid);
        paidInvoice.PaymentMethod.Should().Be("Credit Card");
        paidInvoice.PaymentReference.Should().Be("PAY-123456");
    }

    [Fact]
    public async Task CancelInvoice_ShouldChangeStatusToCancelled_WhenInvoiceIsNotPaid()
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var tenantDbContext = CreateTenantDbContext();
        var invoice = TestDataBuilder.TenantData.CreateInvoice(_tenantId, _testCustomer.Id);
        
        var item = Domain.Tenant.Entities.InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Test Product",
            1,
            Money.Create(100, "TRY")
        );
        invoice.AddItem(item);
        invoice.Send();
        
        tenantDbContext.Invoices.Add(invoice);
        await tenantDbContext.SaveChangesAsync();

        var cancelDto = new CancelInvoiceDto
        {
            Reason = "Customer cancelled the order"
        };

        // Act
        var response = await Client.PostAsJsonAsync($"/api/tenants/{_tenantId}/invoices/{invoice.Id}/cancel", cancelDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        // Verify status change
        tenantDbContext = CreateTenantDbContext();
        var cancelledInvoice = await tenantDbContext.Invoices
            .FirstOrDefaultAsync(i => i.Id == invoice.Id);
        cancelledInvoice!.Status.Should().Be(InvoiceStatus.Cancelled);
        cancelledInvoice.Notes.Should().Contain("Customer cancelled the order");
    }

    [Fact]
    public async Task Delete_ShouldDeleteInvoice_WhenInvoiceIsDraft()
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var tenantDbContext = CreateTenantDbContext();
        var invoice = TestDataBuilder.TenantData.CreateInvoice(_tenantId, _testCustomer.Id);
        
        tenantDbContext.Invoices.Add(invoice);
        await tenantDbContext.SaveChangesAsync();

        // Act
        var response = await Client.DeleteAsync($"/api/tenants/{_tenantId}/invoices/{invoice.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        
        // Verify deletion
        tenantDbContext = CreateTenantDbContext();
        var deletedInvoice = await tenantDbContext.Invoices
            .FirstOrDefaultAsync(i => i.Id == invoice.Id);
        deletedInvoice.Should().BeNull();
    }

    [Fact]
    public async Task GetAll_ShouldReturnUnauthorized_WithoutAuthentication()
    {
        // Act
        var response = await Client.GetAsync($"/api/tenants/{_tenantId}/invoices");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    private TenantDbContext CreateTenantDbContext()
    {
        // Use the same factory that the controllers use
        var factory = Services.GetRequiredService<ITenantDbContextFactory>();
        return (TenantDbContext)factory.CreateDbContext(_tenantId);
    }
    
    private MasterDbContext GetMasterDbContext()
    {
        var options = new DbContextOptionsBuilder<MasterDbContext>()
            .UseInMemoryDatabase($"MasterDb_{Guid.NewGuid()}")
            .Options;
        
        return new MasterDbContext(options);
    }
}