# Test Coverage Report

## Current Status (September 30, 2025)

### Overall Coverage
- **Line Coverage**: 7.64%
- **Branch Coverage**: 30.74%
- **Method Coverage**: 45.52%
- **Target**: 50% line coverage

### Module Breakdown

| Module | Line Coverage | Branch Coverage | Method Coverage | Status |
|--------|--------------|-----------------|-----------------|---------|
| Stocker.Domain | 94.19% | 88.41% | 91.44% | ✅ Excellent |
| Stocker.SharedKernel | 26.86% | 30.85% | 29.67% | ⚠️ Needs Work |
| Stocker.Application | 15.3% | 13.78% | 9.57% | ❌ Critical |
| Stocker.Infrastructure | 3.68% | 1.26% | 5.17% | ❌ Critical |
| Stocker.Identity | 0% | 0% | 0% | ❌ No Coverage |
| Stocker.Persistence | 0% | 0% | 0% | ❌ No Coverage |

### Test Summary
- **Total Tests**: 2224
- **Passing**: 2221
- **Failing**: 0
- **Skipped**: 3

## Work Completed

### Infrastructure Setup
✅ Created test helper classes:
- `MockFactory` - Consistent mock creation
- `TestDataBuilder` - Test data generation with factory methods
- `DbContextHelper` - In-memory database setup

### Tests Added
✅ **Domain Layer** (94% coverage):
- Value Objects: Money, Email, PhoneNumber, Address, CompanyAddress
- Entities: All major domain entities
- Aggregate tests with domain events

✅ **Application Layer** (15% coverage):
- Command handlers: Login, Logout, RefreshToken
- Query handlers: Various tenant and user queries
- Validators: Some command validators

### Build Issues Fixed
✅ Fixed compilation errors related to:
- Entity factory methods vs constructors
- Value object creation (Result pattern)
- Removed mismatched test files

## Gap Analysis

### To Reach 50% Coverage
Current: 7.64% → Target: 50%
**Need to add**: ~42% more coverage

### Priority Areas
1. **Application Layer** (15.3% → 50%)
   - Add tests for remaining command handlers
   - Add tests for query handlers
   - Add tests for validators
   - Add tests for behaviors/pipelines

2. **SharedKernel** (26.86% → 50%)
   - Add tests for Results pattern
   - Add tests for common utilities
   - Add tests for base classes

3. **Infrastructure** (3.68% → 20%)
   - Add tests for services (EmailService, CacheService)
   - Add tests for repositories
   - Mock external dependencies

## Recommendations

### Quick Wins
1. **Validators** - Simple to test, high coverage return
2. **Query Handlers** - Mostly mapping logic, easy to test
3. **SharedKernel utilities** - Static methods, easy to test

### Medium Effort
1. **Command Handlers** - Need mocking but straightforward
2. **Application Services** - Business logic testing
3. **Infrastructure Services** - Mock external dependencies

### High Effort (Skip for now)
1. **Persistence Layer** - Complex EF Core mocking
2. **Identity Layer** - Complex authentication/authorization
3. **Integration Tests** - Already have separate project

## Next Steps

To reach 50% coverage efficiently:

1. **Focus on Application Layer** (+35% potential)
   - Create 20-30 handler tests
   - Create 10-15 validator tests
   - Create behavior/pipeline tests

2. **Improve SharedKernel** (+23% potential)
   - Test Result<T> patterns
   - Test base classes
   - Test utilities

3. **Add basic Infrastructure tests** (+16% potential)
   - Mock and test services
   - Test repositories with in-memory DB

## Files to Test Next

### High Priority
- `RegisterCommandHandler`
- `CreateTenantRegistrationCommandHandler`
- `VerifyEmailCommandHandler`
- `GetAllMasterUsersQueryHandler`
- `UpdateEmailSettingsCommandHandler`

### Medium Priority
- All remaining validators
- All remaining query handlers
- Pipeline behaviors

## Test Execution

```powershell
# Run unit tests with coverage
dotnet test tests/Stocker.UnitTests/Stocker.UnitTests.csproj /p:CollectCoverage=true /p:CoverletOutputFormat=opencover

# Generate HTML report
.\scripts\run-coverage.ps1 -UnitOnly
```

## Conclusion

While we've made good progress setting up the test infrastructure and achieving excellent Domain coverage (94%), we're still at 7.64% overall coverage. To reach the 50% target, we need to focus on adding Application layer tests which will provide the best return on investment.

Estimated effort to reach 50%:
- **Additional tests needed**: ~150-200 tests
- **Time estimate**: 4-6 hours of focused test writing
- **Priority**: Application > SharedKernel > Infrastructure