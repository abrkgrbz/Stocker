using Stocker.Domain.Master.Entities;
using Stocker.Domain.Tenant.Entities;
using MasterUserType = Stocker.Domain.Master.Enums.UserType;
using Stocker.Domain.Master.ValueObjects;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Enums;
using System;
using System.Collections.Generic;

namespace Stocker.UnitTests.Common.TestHelpers;

public class TestDataBuilder
{
    private static int _counter = 1;

    public static Tenant CreateTenant(string? name = null, string? code = null)
    {
        var tenantName = name ?? $"Test Tenant {_counter}";
        var tenantCode = code ?? $"TEST{_counter:D3}";
        var databaseName = $"TestDb_{_counter}";
        var connectionStringResult = ConnectionString.Create($"Server=localhost;Database={databaseName};");
        var contactEmailResult = Email.Create($"contact{_counter}@test.com");

        var tenant = Tenant.Create(
            tenantName,
            tenantCode,
            databaseName,
            connectionStringResult.Value,
            contactEmailResult.Value
        );

        _counter++;
        return tenant;
    }

    public static MasterUser CreateMasterUser(string? emailStr = null, MasterUserType userType = MasterUserType.Personel)
    {
        var username = $"testuser{_counter}";
        var emailResult = Email.Create(emailStr ?? $"user{_counter}@test.com");
        var password = "Test123!@#";
        var firstName = $"Test{_counter}";
        var lastName = $"User{_counter}";

        var user = MasterUser.Create(
            username,
            emailResult.Value,
            password,
            firstName,
            lastName,
            userType
        );

        _counter++;
        return user;
    }

    public static TenantUser CreateTenantUser(Guid tenantId, Guid masterUserId, string? emailStr = null)
    {
        var username = $"tenantuser{_counter}";
        var emailResult = Email.Create(emailStr ?? $"tenant.user{_counter}@test.com");
        var firstName = $"Tenant{_counter}";
        var lastName = $"User{_counter}";

        var user = TenantUser.Create(
            tenantId,
            masterUserId,
            username,
            emailResult.Value,
            firstName,
            lastName
        );

        _counter++;
        return user;
    }

    // Company and Customer creation methods are commented out for now as they need complex setup
    // public static Company CreateCompany(string? name = null)
    // public static Customer CreateCustomer(string? name = null, string? email = null)

    // Product, Invoice, Package, and Role creation methods are commented out for now as they need complex setup
    // public static Product CreateProduct(string? name = null, decimal? price = null)
    // public static Stocker.Domain.Master.Entities.Invoice CreateInvoice(Guid tenantId)
    // public static Package CreatePackage(string? name = null, decimal? price = null)
    // public static Role CreateRole(string? name = null)

    public static void ResetCounter()
    {
        _counter = 1;
    }
}