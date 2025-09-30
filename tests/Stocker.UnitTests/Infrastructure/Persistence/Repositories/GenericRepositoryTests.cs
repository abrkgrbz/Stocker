using Xunit;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Stocker.Persistence.Repositories;
using Stocker.SharedKernel.Primitives;
using Stocker.SharedKernel.Specifications;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;

namespace Stocker.UnitTests.Infrastructure.Persistence.Repositories
{
    // Test entity
    public class TestEntity : Entity<Guid>
    {
        public string Name { get; set; } = string.Empty;
        public int Value { get; set; }

        public TestEntity(Guid id, string name, int value)
        {
            Id = id;
            Name = name;
            Value = value;
        }
    }

    // Test DbContext
    public class TestDbContext : DbContext
    {
        public TestDbContext(DbContextOptions<TestDbContext> options) : base(options) { }
        public DbSet<TestEntity> TestEntities { get; set; }
    }

    public class GenericRepositoryTests : IDisposable
    {
        private readonly TestDbContext _context;
        private readonly GenericRepository<TestEntity, Guid, TestDbContext> _repository;

        public GenericRepositoryTests()
        {
            var options = new DbContextOptionsBuilder<TestDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new TestDbContext(options);
            _repository = new GenericRepository<TestEntity, Guid, TestDbContext>(_context);
        }

        [Fact]
        public void Constructor_Should_Throw_When_Context_Is_Null()
        {
            // Act & Assert
            var action = () => new GenericRepository<TestEntity, Guid, TestDbContext>(null);
            action.Should().Throw<ArgumentNullException>()
                .WithParameterName("context");
        }

        [Fact]
        public void AsQueryable_Should_Return_Queryable()
        {
            // Act
            var result = _repository.AsQueryable();

            // Assert
            result.Should().NotBeNull();
            result.Should().BeAssignableTo<IQueryable<TestEntity>>();
        }

        [Fact]
        public async Task GetByIdAsync_Should_Return_Entity_When_Exists()
        {
            // Arrange
            var entity = new TestEntity(Guid.NewGuid(), "Test", 100);
            _context.Set<TestEntity>().Add(entity);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByIdAsync(entity.Id);

            // Assert
            result.Should().NotBeNull();
            result!.Id.Should().Be(entity.Id);
            result.Name.Should().Be("Test");
            result.Value.Should().Be(100);
        }

        [Fact]
        public async Task GetByIdAsync_Should_Return_Null_When_Not_Exists()
        {
            // Arrange
            var id = Guid.NewGuid();

            // Act
            var result = await _repository.GetByIdAsync(id);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task GetAllAsync_Should_Return_All_Entities()
        {
            // Arrange
            var entities = new[]
            {
                new TestEntity(Guid.NewGuid(), "Test1", 100),
                new TestEntity(Guid.NewGuid(), "Test2", 200),
                new TestEntity(Guid.NewGuid(), "Test3", 300)
            };
            _context.Set<TestEntity>().AddRange(entities);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().HaveCount(3);
            result.Select(e => e.Name).Should().Contain(new[] { "Test1", "Test2", "Test3" });
        }

        [Fact]
        public async Task GetAllAsync_Should_Return_Empty_When_No_Entities()
        {
            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task FindAsync_With_Predicate_Should_Return_Matching_Entities()
        {
            // Arrange
            var entities = new[]
            {
                new TestEntity(Guid.NewGuid(), "Test1", 100),
                new TestEntity(Guid.NewGuid(), "Test2", 200),
                new TestEntity(Guid.NewGuid(), "Test3", 150)
            };
            _context.Set<TestEntity>().AddRange(entities);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.FindAsync(e => e.Value > 100);

            // Assert
            result.Should().HaveCount(2);
            result.All(e => e.Value > 100).Should().BeTrue();
        }

        [Fact]
        public async Task SingleOrDefaultAsync_Should_Return_Single_Entity_When_Matches()
        {
            // Arrange
            var entities = new[]
            {
                new TestEntity(Guid.NewGuid(), "Test1", 100),
                new TestEntity(Guid.NewGuid(), "Test2", 200),
                new TestEntity(Guid.NewGuid(), "Test3", 300)
            };
            _context.Set<TestEntity>().AddRange(entities);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.SingleOrDefaultAsync(e => e.Value == 200);

            // Assert
            result.Should().NotBeNull();
            result!.Name.Should().Be("Test2");
            result.Value.Should().Be(200);
        }

        [Fact]
        public async Task SingleOrDefaultAsync_Should_Return_Null_When_No_Match()
        {
            // Arrange
            var entity = new TestEntity(Guid.NewGuid(), "Test", 100);
            _context.Set<TestEntity>().Add(entity);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.SingleOrDefaultAsync(e => e.Value == 999);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task AnyAsync_Should_Return_True_When_Entities_Match()
        {
            // Arrange
            var entity = new TestEntity(Guid.NewGuid(), "Test", 100);
            _context.Set<TestEntity>().Add(entity);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.AnyAsync(e => e.Value == 100);

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public async Task AnyAsync_Should_Return_False_When_No_Entities_Match()
        {
            // Arrange
            var entity = new TestEntity(Guid.NewGuid(), "Test", 100);
            _context.Set<TestEntity>().Add(entity);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.AnyAsync(e => e.Value == 999);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task CountAsync_Should_Return_Count_Of_Matching_Entities()
        {
            // Arrange
            var entities = new[]
            {
                new TestEntity(Guid.NewGuid(), "Test1", 100),
                new TestEntity(Guid.NewGuid(), "Test2", 200),
                new TestEntity(Guid.NewGuid(), "Test3", 100),
                new TestEntity(Guid.NewGuid(), "Test4", 300)
            };
            _context.Set<TestEntity>().AddRange(entities);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.CountAsync(e => e.Value == 100);

            // Assert
            result.Should().Be(2);
        }

        [Fact]
        public async Task GetPagedAsync_Should_Return_Paged_Results()
        {
            // Arrange
            var entities = Enumerable.Range(1, 10)
                .Select(i => new TestEntity(Guid.NewGuid(), $"Test{i}", i * 10))
                .ToArray();
            _context.Set<TestEntity>().AddRange(entities);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetPagedAsync(
                pageIndex: 1,
                pageSize: 3,
                predicate: null,
                orderBy: q => q.OrderBy(e => e.Value));

            // Assert
            result.TotalCount.Should().Be(10);
            result.Items.Should().HaveCount(3);
            result.Items.First().Name.Should().Be("Test4"); // Second page, ordered by Value
            result.Items.Last().Name.Should().Be("Test6");
        }

        [Fact]
        public async Task GetPagedAsync_With_Predicate_Should_Filter_Results()
        {
            // Arrange
            var entities = Enumerable.Range(1, 10)
                .Select(i => new TestEntity(Guid.NewGuid(), $"Test{i}", i * 10))
                .ToArray();
            _context.Set<TestEntity>().AddRange(entities);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetPagedAsync(
                pageIndex: 0,
                pageSize: 5,
                predicate: e => e.Value > 50,
                orderBy: null);

            // Assert
            result.TotalCount.Should().Be(5); // Values 60, 70, 80, 90, 100
            result.Items.Should().HaveCount(5);
            result.Items.All(e => e.Value > 50).Should().BeTrue();
        }

        [Fact]
        public async Task AddAsync_Should_Add_Entity()
        {
            // Arrange
            var entity = new TestEntity(Guid.NewGuid(), "NewTest", 500);

            // Act
            var result = await _repository.AddAsync(entity);
            await _context.SaveChangesAsync();

            // Assert
            result.Should().Be(entity);
            var dbEntity = await _context.Set<TestEntity>().FindAsync(entity.Id);
            dbEntity.Should().NotBeNull();
            dbEntity!.Name.Should().Be("NewTest");
        }

        [Fact]
        public async Task AddRangeAsync_Should_Add_Multiple_Entities()
        {
            // Arrange
            var entities = new[]
            {
                new TestEntity(Guid.NewGuid(), "New1", 100),
                new TestEntity(Guid.NewGuid(), "New2", 200),
                new TestEntity(Guid.NewGuid(), "New3", 300)
            };

            // Act
            await _repository.AddRangeAsync(entities);
            await _context.SaveChangesAsync();

            // Assert
            var count = await _context.Set<TestEntity>().CountAsync();
            count.Should().Be(3);
        }

        [Fact]
        public async Task Update_Should_Update_Entity()
        {
            // Arrange
            var entity = new TestEntity(Guid.NewGuid(), "Original", 100);
            _context.Set<TestEntity>().Add(entity);
            await _context.SaveChangesAsync();

            // Act
            entity.Name = "Updated";
            entity.Value = 200;
            _repository.Update(entity);
            await _context.SaveChangesAsync();

            // Assert
            var dbEntity = await _context.Set<TestEntity>().FindAsync(entity.Id);
            dbEntity!.Name.Should().Be("Updated");
            dbEntity.Value.Should().Be(200);
        }

        [Fact]
        public async Task UpdateAsync_Should_Update_Entity()
        {
            // Arrange
            var entity = new TestEntity(Guid.NewGuid(), "Original", 100);
            _context.Set<TestEntity>().Add(entity);
            await _context.SaveChangesAsync();

            // Act
            entity.Name = "Updated";
            await _repository.UpdateAsync(entity);
            await _context.SaveChangesAsync();

            // Assert
            var dbEntity = await _context.Set<TestEntity>().FindAsync(entity.Id);
            dbEntity!.Name.Should().Be("Updated");
        }

        [Fact]
        public async Task Remove_Should_Remove_Entity()
        {
            // Arrange
            var entity = new TestEntity(Guid.NewGuid(), "ToRemove", 100);
            _context.Set<TestEntity>().Add(entity);
            await _context.SaveChangesAsync();

            // Act
            _repository.Remove(entity);
            await _context.SaveChangesAsync();

            // Assert
            var dbEntity = await _context.Set<TestEntity>().FindAsync(entity.Id);
            dbEntity.Should().BeNull();
        }

        [Fact]
        public async Task RemoveRange_Should_Remove_Multiple_Entities()
        {
            // Arrange
            var entities = new[]
            {
                new TestEntity(Guid.NewGuid(), "Remove1", 100),
                new TestEntity(Guid.NewGuid(), "Remove2", 200),
                new TestEntity(Guid.NewGuid(), "Remove3", 300)
            };
            _context.Set<TestEntity>().AddRange(entities);
            await _context.SaveChangesAsync();

            // Act
            _repository.RemoveRange(entities);
            await _context.SaveChangesAsync();

            // Assert
            var count = await _context.Set<TestEntity>().CountAsync();
            count.Should().Be(0);
        }

        [Fact]
        public async Task RemoveByIdAsync_Should_Remove_Entity_When_Exists()
        {
            // Arrange
            var entity = new TestEntity(Guid.NewGuid(), "ToRemove", 100);
            _context.Set<TestEntity>().Add(entity);
            await _context.SaveChangesAsync();

            // Act
            await _repository.RemoveByIdAsync(entity.Id);
            await _context.SaveChangesAsync();

            // Assert
            var dbEntity = await _context.Set<TestEntity>().FindAsync(entity.Id);
            dbEntity.Should().BeNull();
        }

        [Fact]
        public async Task RemoveByIdAsync_Should_Not_Throw_When_Entity_Not_Exists()
        {
            // Arrange
            var id = Guid.NewGuid();

            // Act
            var action = async () => await _repository.RemoveByIdAsync(id);

            // Assert
            await action.Should().NotThrowAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}