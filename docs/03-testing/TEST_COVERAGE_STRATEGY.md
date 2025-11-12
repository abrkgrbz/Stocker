# Test Coverage Strategy - Systematic Approach to 50% Coverage

## Current Status
- **Overall Coverage**: 7.9%
- **Tests**: 2290 passing, 3 skipped
- **Gap to Target**: ~51,000 lines need coverage to reach 50%

## Coverage by Layer
| Layer | Current | Lines | Priority |
|-------|---------|-------|----------|
| Persistence | 0% | ~8,000 | HIGH |
| Identity | 0% | ~2,500 | HIGH |
| Infrastructure | 4.7% | ~3,000 | MEDIUM |
| Application | 19.2% | ~15,000 | MEDIUM |
| Domain | 94.2% | ~5,000 | LOW |
| API | 0% | ~4,000 | LOW |

## Top Priority Files for Testing

### Tier 1: Maximum Impact (500+ lines, 0% coverage)
1. **ValidationService.cs** (953 lines) - Infrastructure
2. **InvoicesController.cs** (757 lines) - API
3. **Program.cs** (727 lines) - API startup
4. **TenantOnboarding.cs** (681 lines) - Domain
5. **EmailService.cs** (557 lines) - Infrastructure
6. **TenantFeature.cs** (550 lines) - Domain
7. **AuthenticationService.cs** (547 lines) - Identity ⭐

### Tier 2: High Impact (400-500 lines, 0% coverage)
8. **TenantsController.cs** (534 lines) - API
9. **TenantInitialData.cs** (527 lines) - Domain
10. **TenantSetupChecklist.cs** (524 lines) - Domain
11. **UserTenant.cs** (522 lines) - Domain
12. **TenantDocument.cs** (493 lines) - Domain
13. **TenantNotification.cs** (486 lines) - Domain
14. **DashboardRepository.cs** (478 lines) - Persistence ⭐
15. **UserRepository.cs** (472 lines) - Persistence ⭐
16. **MasterUser.cs** (471 lines) - Domain
17. **AnalyticsController.cs** (449 lines) - API
18. **TenantCustomization.cs** (444 lines) - Domain

### Tier 3: DbContexts and Core Infrastructure
19. **MasterDbContext.cs** (~300 lines) - Persistence ⭐
20. **TenantDbContext.cs** (~300 lines) - Persistence ⭐

## Testing Strategy by Phase

### Phase 1: Persistence Layer (Week 1)
**Goal**: 0% → 30% coverage
1. MasterDbContext tests
2. TenantDbContext tests
3. DashboardRepository tests
4. UserRepository tests
5. Configuration classes tests

### Phase 2: Identity Layer (Week 1-2)
**Goal**: 0% → 40% coverage
1. AuthenticationService tests
2. TokenGenerationService tests (fix previous issues)
3. UserManagementService tests
4. RefactoredAuthenticationService tests

### Phase 3: High-Impact Infrastructure (Week 2)
**Goal**: 4.7% → 30% coverage
1. ValidationService comprehensive tests
2. EmailService tests
3. Additional service tests

### Phase 4: Domain Entities (Week 2-3)
**Goal**: 94% → 98% coverage
1. TenantOnboarding tests
2. TenantFeature tests
3. MasterUser tests
4. Other tenant entities

### Phase 5: Application Layer (Week 3)
**Goal**: 19.2% → 40% coverage
1. Command handlers with proper mocking
2. Query handlers
3. Validators
4. Behaviors

### Phase 6: API Controllers (Week 3-4)
**Goal**: 0% → 20% coverage
1. InvoicesController tests
2. TenantsController tests
3. AnalyticsController tests

## Testing Patterns to Use

### For DbContexts
- In-memory database for configuration testing
- Model builder verification
- Entity tracking tests
- SaveChanges override tests

### For Repositories
- Integration tests with in-memory database
- CRUD operation coverage
- Complex query tests
- Transaction handling

### For Services
- Unit tests with mocking
- Edge case coverage
- Error handling scenarios
- Integration with dependencies

### For Domain Entities
- Constructor validation
- Business rule enforcement
- Value object behavior
- Aggregate invariants

### For Controllers
- Unit tests with mocked services
- Action result verification
- Authorization attribute tests
- Model validation

## Estimated Coverage Progress

| Week | Target Coverage | Lines to Cover | Tests to Add |
|------|----------------|----------------|--------------|
| 1 | 15% | ~8,000 | ~400 |
| 2 | 25% | ~10,000 | ~500 |
| 3 | 35% | ~10,000 | ~500 |
| 4 | 50% | ~13,000 | ~650 |

## Success Metrics
- Daily coverage increase: 1-2%
- Tests per day: ~100-150
- Coverage per test: ~20 lines average
- Build time: < 30 seconds
- Test execution time: < 5 minutes

## Next Immediate Steps
1. Create MasterDbContext tests
2. Create TenantDbContext tests
3. Test DashboardRepository
4. Test UserRepository
5. Run coverage report and verify progress