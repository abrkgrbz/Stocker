using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Stocker.Persistence.Contexts;
using System;

namespace Stocker.UnitTests.Common.TestHelpers;

public static class DbContextHelper
{
    public static MasterDbContext CreateInMemoryMasterDbContext(string? databaseName = null)
    {
        var options = new DbContextOptionsBuilder<MasterDbContext>()
            .UseInMemoryDatabase(databaseName ?? Guid.NewGuid().ToString())
            .Options;

        return new MasterDbContext(options);
    }

    public static TenantDbContext CreateInMemoryTenantDbContext(Guid? tenantId = null, string? databaseName = null)
    {
        var options = new DbContextOptionsBuilder<TenantDbContext>()
            .UseInMemoryDatabase(databaseName ?? Guid.NewGuid().ToString())
            .Options;

        return new TenantDbContext(options, tenantId ?? Guid.NewGuid());
    }

    public static DbContextOptions<T> CreateOptions<T>(string? databaseName = null) where T : DbContext
    {
        return new DbContextOptionsBuilder<T>()
            .UseInMemoryDatabase(databaseName ?? Guid.NewGuid().ToString())
            .Options;
    }

    public static Mock<DbSet<T>> CreateDbSetMock<T>(params T[] elements) where T : class
    {
        var queryable = elements.AsQueryable();
        var dbSetMock = new Mock<DbSet<T>>();

        dbSetMock.As<IQueryable<T>>().Setup(m => m.Provider).Returns(queryable.Provider);
        dbSetMock.As<IQueryable<T>>().Setup(m => m.Expression).Returns(queryable.Expression);
        dbSetMock.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
        dbSetMock.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(queryable.GetEnumerator());

        return dbSetMock;
    }
}