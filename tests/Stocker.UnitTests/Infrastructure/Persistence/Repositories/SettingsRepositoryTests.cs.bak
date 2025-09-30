using Xunit;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Stocker.Persistence.Repositories;
using Stocker.Persistence.Contexts;
using Stocker.Domain.Tenant.Entities;
using Stocker.Domain.Entities.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Stocker.UnitTests.Infrastructure.Persistence.Repositories
{
    public class SettingsRepositoryTests
    {
        private TenantDbContext CreateTenantContext(Guid tenantId)
        {
            var options = new DbContextOptionsBuilder<TenantDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestTenantDb_{Guid.NewGuid()}")
                .EnableSensitiveDataLogging()
                .Options;

            return new TenantDbContext(options, tenantId);
        }

        private MasterDbContext CreateMasterContext()
        {
            var options = new DbContextOptionsBuilder<MasterDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestMasterDb_{Guid.NewGuid()}")
                .EnableSensitiveDataLogging()
                .Options;

            return new MasterDbContext(options);
        }

        private (TenantDbContext tenantContext, MasterDbContext masterContext, SettingsRepository repository, Guid tenantId) CreateTestEnvironment()
        {
            var tenantId = Guid.NewGuid();
            var tenantContext = CreateTenantContext(tenantId);
            var masterContext = CreateMasterContext();
            var repository = new SettingsRepository(tenantContext, masterContext);

            SeedTestData(tenantContext, masterContext, tenantId);

            return (tenantContext, masterContext, repository, tenantId);
        }

        private void SeedTestData(TenantDbContext tenantContext, MasterDbContext masterContext, Guid tenantId)
        {
            // Seed Tenant Settings
            var settings = new[]
            {
                TenantSettings.Create(tenantId, "App.Name", "Test Company", "General", "string"),
                TenantSettings.Create(tenantId, "Security.MaxLoginAttempts", "5", "Security", "integer"),
                TenantSettings.Create(tenantId, "Email.FromAddress", "test@example.com", "Email", "string"),
                TenantSettings.Create(tenantId, "Notification.Enabled", "true", "Notification", "boolean")
            };

            foreach (var setting in settings)
            {
                tenantContext.TenantSettings.Add(setting);
            }
            tenantContext.SaveChanges();

            // Seed Tenant Modules
            var modules = new[]
            {
                TenantModules.Create(tenantId, "INV", "Envanter", "Inventory management module", isEnabled: true),
                TenantModules.Create(tenantId, "FIN", "Finans", "Finance module", isEnabled: false)
            };

            foreach (var module in modules)
            {
                tenantContext.TenantModules.Add(module);
            }
            tenantContext.SaveChanges();

            // Seed System Settings
            var systemSettings = new[]
            {
                new SystemSettings("General", "App.Name", "Stocker", null, false, false),
                new SystemSettings("General", "App.Version", "1.0.0", null, false, false),
                new SystemSettings("Security", "Security.PasswordMinLength", "8", null, false, false),
                new SystemSettings("Email", "Smtp.Host", "smtp.gmail.com", null, false, false)
            };

            foreach (var setting in systemSettings)
            {
                masterContext.SystemSettings.Add(setting);
            }
            masterContext.SaveChanges();

            // Clear change tracker to avoid tracking issues in tests
            tenantContext.ChangeTracker.Clear();
            masterContext.ChangeTracker.Clear();
        }

        #region TenantSettings Tests

        [Fact]
        public async Task GetTenantSettingsAsync_Should_Return_All_Settings_For_Tenant()
        {
            // Arrange
            var (tenantContext, masterContext, repository, tenantId) = CreateTestEnvironment();

            // Act
            var result = await repository.GetTenantSettingsAsync(tenantId);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(4);
            result.Should().BeInAscendingOrder(s => s.Category).And.ThenBeInAscendingOrder(s => s.SettingKey);

            // Cleanup
            tenantContext.Dispose();
            masterContext.Dispose();
        }

        [Fact]
        public async Task GetTenantSettingsAsync_Should_Filter_By_Category()
        {
            // Arrange
            var (tenantContext, masterContext, repository, tenantId) = CreateTestEnvironment();

            // Act
            var result = await repository.GetTenantSettingsAsync(tenantId, "Security");

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            result.First().Category.Should().Be("Security");

            // Cleanup
            tenantContext.Dispose();
            masterContext.Dispose();
        }

        [Fact]
        public async Task GetTenantSettingsAsync_Should_Return_Empty_For_NonExistent_Tenant()
        {
            // Arrange
            var (tenantContext, masterContext, repository, tenantId) = CreateTestEnvironment();

            // Act
            var result = await repository.GetTenantSettingsAsync(Guid.NewGuid());

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();

            // Cleanup
            tenantContext.Dispose();
            masterContext.Dispose();
        }

        [Fact]
        public async Task GetTenantSettingByKeyAsync_Should_Return_Setting_When_Exists()
        {
            // Act
            var result = await _repository.GetTenantSettingByKeyAsync(_testTenantId, "App.Name");

            // Assert
            result.Should().NotBeNull();
            result!.SettingKey.Should().Be("App.Name");
            result.SettingValue.Should().Be("Test Company");
        }

        [Fact]
        public async Task GetTenantSettingByKeyAsync_Should_Return_Null_When_Not_Found()
        {
            // Act
            var result = await _repository.GetTenantSettingByKeyAsync(_testTenantId, "NonExistent.Key");

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task CreateTenantSettingAsync_Should_Add_New_Setting()
        {
            // Arrange
            var newSetting = TenantSettings.Create(_testTenantId, "Test.Key", "TestValue", "Test", "string");

            // Act
            var result = await _repository.CreateTenantSettingAsync(newSetting);

            // Assert
            result.Should().NotBeNull();
            result.SettingKey.Should().Be("Test.Key");

            var dbSetting = await _tenantContext.TenantSettings
                .FirstOrDefaultAsync(s => s.SettingKey == "Test.Key");
            dbSetting.Should().NotBeNull();
        }

        [Fact]
        public async Task UpdateTenantSettingAsync_Should_Update_Existing_Setting()
        {
            // Act
            var result = await _repository.UpdateTenantSettingAsync(_testTenantId, "App.Name", "Updated Company");

            // Assert
            result.Should().NotBeNull();
            result!.SettingValue.Should().Be("Updated Company");

            var dbSetting = await _tenantContext.TenantSettings
                .FirstOrDefaultAsync(s => s.SettingKey == "App.Name");
            dbSetting!.SettingValue.Should().Be("Updated Company");
        }

        [Fact]
        public async Task UpdateTenantSettingAsync_Should_Return_Null_When_Not_Found()
        {
            // Act
            var result = await _repository.UpdateTenantSettingAsync(_testTenantId, "NonExistent.Key", "Value");

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task DeleteTenantSettingAsync_Should_Remove_Setting()
        {
            // Act
            var result = await _repository.DeleteTenantSettingAsync(_testTenantId, "Notification.Enabled");

            // Assert
            result.Should().BeTrue();

            var dbSetting = await _tenantContext.TenantSettings
                .FirstOrDefaultAsync(s => s.SettingKey == "Notification.Enabled");
            dbSetting.Should().BeNull();
        }

        [Fact]
        public async Task DeleteTenantSettingAsync_Should_Return_False_When_Not_Found()
        {
            // Act
            var result = await _repository.DeleteTenantSettingAsync(_testTenantId, "NonExistent.Key");

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task GetGroupedSettingsAsync_Should_Return_Settings_Grouped_By_Category()
        {
            // Act
            var result = await _repository.GetGroupedSettingsAsync(_testTenantId);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCountGreaterThan(0);
            result.Should().AllSatisfy(category =>
            {
                category.Category.Should().NotBeNullOrEmpty();
                category.Settings.Should().NotBeNull();
            });
        }

        [Fact]
        public async Task BulkUpdateSettingsAsync_Should_Update_Multiple_Settings()
        {
            // Arrange
            var updates = new Dictionary<string, string>
            {
                { "App.Name", "Bulk Updated" },
                { "Security.MaxLoginAttempts", "10" }
            };

            // Act
            var result = await _repository.BulkUpdateSettingsAsync(_testTenantId, updates);

            // Assert
            result.Should().BeTrue();

            var appName = await _tenantContext.TenantSettings
                .FirstOrDefaultAsync(s => s.SettingKey == "App.Name");
            appName!.SettingValue.Should().Be("Bulk Updated");

            var maxAttempts = await _tenantContext.TenantSettings
                .FirstOrDefaultAsync(s => s.SettingKey == "Security.MaxLoginAttempts");
            maxAttempts!.SettingValue.Should().Be("10");
        }

        [Fact]
        public async Task BulkUpdateSettingsAsync_Should_Create_New_Settings_If_Not_Exist()
        {
            // Arrange
            var updates = new Dictionary<string, string>
            {
                { "New.Setting1", "Value1" },
                { "New.Setting2", "123" }
            };

            // Act
            var result = await _repository.BulkUpdateSettingsAsync(_testTenantId, updates);

            // Assert
            result.Should().BeTrue();

            var newSettings = await _tenantContext.TenantSettings
                .Where(s => s.SettingKey.StartsWith("New."))
                .ToListAsync();
            newSettings.Should().HaveCount(2);
        }

        #endregion

        #region TenantModules Tests

        [Fact]
        public async Task GetTenantModulesAsync_Should_Return_All_Modules()
        {
            // Act
            var result = await _repository.GetTenantModulesAsync(_testTenantId);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().BeInAscendingOrder(m => m.ModuleName);
        }

        [Fact]
        public async Task GetTenantModulesAsync_Should_Return_Empty_For_NonExistent_Tenant()
        {
            // Act
            var result = await _repository.GetTenantModulesAsync(Guid.NewGuid());

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task GetTenantModuleAsync_Should_Return_Module_When_Exists()
        {
            // Act
            var result = await _repository.GetTenantModuleAsync(_testTenantId, "INV");

            // Assert
            result.Should().NotBeNull();
            result!.ModuleCode.Should().Be("INV");
            result.ModuleName.Should().Be("Envanter");
        }

        [Fact]
        public async Task GetTenantModuleAsync_Should_Return_Null_When_Not_Found()
        {
            // Act
            var result = await _repository.GetTenantModuleAsync(_testTenantId, "NOTEXIST");

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task ToggleModuleAsync_Should_Enable_Disabled_Module()
        {
            // Act
            var result = await _repository.ToggleModuleAsync(_testTenantId, "FIN");

            // Assert
            result.Should().BeTrue();

            var module = await _tenantContext.TenantModules
                .FirstOrDefaultAsync(m => m.ModuleCode == "FIN");
            module!.IsEnabled.Should().BeTrue();
        }

        [Fact]
        public async Task ToggleModuleAsync_Should_Disable_Enabled_Module()
        {
            // Act
            var result = await _repository.ToggleModuleAsync(_testTenantId, "INV");

            // Assert
            result.Should().BeTrue();

            var module = await _tenantContext.TenantModules
                .FirstOrDefaultAsync(m => m.ModuleCode == "INV");
            module!.IsEnabled.Should().BeFalse();
        }

        [Fact]
        public async Task ToggleModuleAsync_Should_Return_False_When_Module_Not_Found()
        {
            // Act
            var result = await _repository.ToggleModuleAsync(_testTenantId, "NOTEXIST");

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task UpdateModuleSettingsAsync_Should_Update_Configuration()
        {
            // Arrange
            var newConfig = "{\"setting1\":\"value1\"}";

            // Act
            var result = await _repository.UpdateModuleSettingsAsync(_testTenantId, "INV", newConfig);

            // Assert
            result.Should().BeTrue();

            var module = await _tenantContext.TenantModules
                .FirstOrDefaultAsync(m => m.ModuleCode == "INV");
            module!.Configuration.Should().Be(newConfig);
        }

        [Fact]
        public async Task UpdateModuleSettingsAsync_Should_Return_False_When_Module_Not_Found()
        {
            // Act
            var result = await _repository.UpdateModuleSettingsAsync(_testTenantId, "NOTEXIST", "{}");

            // Assert
            result.Should().BeFalse();
        }

        #endregion

        #region SystemSettings Tests

        [Fact]
        public async Task GetSystemSettingsAsync_Should_Return_Grouped_Settings()
        {
            // Act
            var result = await _repository.GetSystemSettingsAsync();

            // Assert
            result.Should().NotBeNull();
        }

        [Fact]
        public async Task UpdateSystemSettingAsync_Should_Update_Existing_Setting()
        {
            // Act
            var result = await _repository.UpdateSystemSettingAsync("App.Version", "2.0.0");

            // Assert
            result.Should().BeTrue();

            var setting = await _masterContext.SystemSettings
                .FirstOrDefaultAsync(s => s.Key == "App.Version");
            setting!.Value.Should().Be("2.0.0");
        }

        [Fact]
        public async Task UpdateSystemSettingAsync_Should_Create_New_Setting_If_Not_Exists()
        {
            // Act
            var result = await _repository.UpdateSystemSettingAsync("New.Setting", "NewValue");

            // Assert
            result.Should().BeTrue();

            var setting = await _masterContext.SystemSettings
                .FirstOrDefaultAsync(s => s.Key == "New.Setting");
            setting.Should().NotBeNull();
            setting!.Value.Should().Be("NewValue");
        }

        [Fact]
        public async Task GetEmailSettingsAsync_Should_Return_Email_Configuration()
        {
            // Act
            var result = await _repository.GetEmailSettingsAsync();

            // Assert
            result.Should().NotBeNull();
        }

        [Fact]
        public async Task GetSecuritySettingsAsync_Should_Return_Security_Configuration()
        {
            // Act
            var result = await _repository.GetSecuritySettingsAsync();

            // Assert
            result.Should().NotBeNull();
        }

        [Fact]
        public async Task GetGeneralSettingsAsync_Should_Return_General_Configuration()
        {
            // Act
            var result = await _repository.GetGeneralSettingsAsync();

            // Assert
            result.Should().NotBeNull();
        }

        #endregion
    }
}