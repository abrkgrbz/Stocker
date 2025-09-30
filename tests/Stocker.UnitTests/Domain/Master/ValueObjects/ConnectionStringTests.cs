using FluentAssertions;
using Stocker.Domain.Master.ValueObjects;
using Xunit;

namespace Stocker.UnitTests.Domain.Master.ValueObjects;

public class ConnectionStringTests
{
    [Fact]
    public void Create_WithValidConnectionString_ShouldReturnSuccess()
    {
        // Arrange
        var connectionString = "Server=localhost;Database=TestDB;Trusted_Connection=true;";

        // Act
        var result = ConnectionString.Create(connectionString);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Value.Should().Be(connectionString);
    }

    [Fact]
    public void Create_WithDataSourceAndInitialCatalog_ShouldReturnSuccess()
    {
        // Arrange
        var connectionString = "Data Source=localhost;Initial Catalog=TestDB;User ID=sa;Password=Pass123;";

        // Act
        var result = ConnectionString.Create(connectionString);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Value.Should().Be(connectionString);
    }

    [Fact]
    public void Create_WithNullConnectionString_ShouldReturnFailure()
    {
        // Act
        var result = ConnectionString.Create(null);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("ConnectionString.Empty");
        result.Error.Description.Should().Be("Connection string cannot be empty.");
    }

    [Fact]
    public void Create_WithEmptyConnectionString_ShouldReturnFailure()
    {
        // Act
        var result = ConnectionString.Create("");

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("ConnectionString.Empty");
        result.Error.Description.Should().Be("Connection string cannot be empty.");
    }

    [Fact]
    public void Create_WithWhitespaceConnectionString_ShouldReturnFailure()
    {
        // Act
        var result = ConnectionString.Create("   ");

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("ConnectionString.Empty");
        result.Error.Description.Should().Be("Connection string cannot be empty.");
    }

    [Fact]
    public void Create_WithoutServerInfo_ShouldReturnFailure()
    {
        // Arrange
        var connectionString = "Database=TestDB;Trusted_Connection=true;";

        // Act
        var result = ConnectionString.Create(connectionString);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("ConnectionString.NoServer");
        result.Error.Description.Should().Be("Connection string must contain server information.");
    }

    [Fact]
    public void Create_WithoutDatabaseInfo_ShouldReturnFailure()
    {
        // Arrange
        var connectionString = "Server=localhost;Trusted_Connection=true;";

        // Act
        var result = ConnectionString.Create(connectionString);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("ConnectionString.NoDatabase");
        result.Error.Description.Should().Be("Connection string must contain database information.");
    }

    [Fact]
    public void Create_WithCaseInsensitiveServer_ShouldReturnSuccess()
    {
        // Arrange
        var connectionString = "SERVER=localhost;DATABASE=TestDB;";

        // Act
        var result = ConnectionString.Create(connectionString);

        // Assert
        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public void Create_WithCaseInsensitiveDataSource_ShouldReturnSuccess()
    {
        // Arrange
        var connectionString = "data source=localhost;initial catalog=TestDB;";

        // Act
        var result = ConnectionString.Create(connectionString);

        // Assert
        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public void ToString_ShouldReturnMaskedValue()
    {
        // Arrange
        var connectionString = "Server=localhost;Database=TestDB;User ID=sa;Password=Secret123;";
        var result = ConnectionString.Create(connectionString);

        // Act
        var stringValue = result.Value.ToString();

        // Assert
        stringValue.Should().Be("***Connection String***");
        stringValue.Should().NotContain("localhost");
        stringValue.Should().NotContain("TestDB");
        stringValue.Should().NotContain("Secret123");
    }

    [Fact]
    public void GetEqualityComponents_ShouldReturnValue()
    {
        // Arrange
        var connectionString = "Server=localhost;Database=TestDB;";
        var result = ConnectionString.Create(connectionString);

        // Act
        var components = result.Value.GetEqualityComponents().ToList();

        // Assert
        components.Should().HaveCount(1);
        components[0].Should().Be(connectionString);
    }

    [Fact]
    public void Equals_WithSameConnectionString_ShouldReturnTrue()
    {
        // Arrange
        var connectionString = "Server=localhost;Database=TestDB;";
        var result1 = ConnectionString.Create(connectionString);
        var result2 = ConnectionString.Create(connectionString);

        // Act
        var areEqual = result1.Value.Equals(result2.Value);

        // Assert
        areEqual.Should().BeTrue();
    }

    [Fact]
    public void Equals_WithDifferentConnectionString_ShouldReturnFalse()
    {
        // Arrange
        var result1 = ConnectionString.Create("Server=localhost;Database=TestDB1;");
        var result2 = ConnectionString.Create("Server=localhost;Database=TestDB2;");

        // Act
        var areEqual = result1.Value.Equals(result2.Value);

        // Assert
        areEqual.Should().BeFalse();
    }

    [Fact]
    public void GetHashCode_WithSameConnectionString_ShouldReturnSameHash()
    {
        // Arrange
        var connectionString = "Server=localhost;Database=TestDB;";
        var result1 = ConnectionString.Create(connectionString);
        var result2 = ConnectionString.Create(connectionString);

        // Act
        var hash1 = result1.Value.GetHashCode();
        var hash2 = result2.Value.GetHashCode();

        // Assert
        hash1.Should().Be(hash2);
    }

    [Fact]
    public void GetHashCode_WithDifferentConnectionString_ShouldReturnDifferentHash()
    {
        // Arrange
        var result1 = ConnectionString.Create("Server=localhost;Database=TestDB1;");
        var result2 = ConnectionString.Create("Server=localhost;Database=TestDB2;");

        // Act
        var hash1 = result1.Value.GetHashCode();
        var hash2 = result2.Value.GetHashCode();

        // Assert
        hash1.Should().NotBe(hash2);
    }

    [Fact]
    public void Create_WithComplexConnectionString_ShouldReturnSuccess()
    {
        // Arrange
        var connectionString = "Server=tcp:myserver.database.windows.net,1433;Database=myDataBase;User ID=mylogin@myserver;Password=myPassword;Trusted_Connection=False;Encrypt=True;Connection Timeout=30;MultipleActiveResultSets=True;";

        // Act
        var result = ConnectionString.Create(connectionString);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Value.Should().Be(connectionString);
    }

    [Fact]
    public void Create_WithSqliteConnectionString_ShouldReturnSuccess()
    {
        // Arrange
        var connectionString = "Data Source=app.db;";

        // Act
        var result = ConnectionString.Create(connectionString);

        // Assert
        result.IsSuccess.Should().BeTrue(); // Even though it doesn't have Database= or Initial Catalog=, it has Data Source which is valid for SQLite
    }

    [Fact]
    public void OperatorEquals_WithSameConnectionString_ShouldReturnTrue()
    {
        // Arrange
        var connectionString = "Server=localhost;Database=TestDB;";
        var conn1 = ConnectionString.Create(connectionString).Value;
        var conn2 = ConnectionString.Create(connectionString).Value;

        // Act & Assert
        (conn1 == conn2).Should().BeTrue();
    }

    [Fact]
    public void OperatorNotEquals_WithDifferentConnectionString_ShouldReturnTrue()
    {
        // Arrange
        var conn1 = ConnectionString.Create("Server=localhost;Database=TestDB1;").Value;
        var conn2 = ConnectionString.Create("Server=localhost;Database=TestDB2;").Value;

        // Act & Assert
        (conn1 != conn2).Should().BeTrue();
    }
}