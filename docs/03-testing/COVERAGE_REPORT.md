# Test Coverage Reports

## Overview
This project uses **Coverlet** for code coverage collection and **ReportGenerator** for creating HTML coverage reports.

## Prerequisites
The following packages are already installed:
- `coverlet.collector` - Collects coverage during test runs
- `coverlet.msbuild` - MSBuild integration for coverage
- `dotnet-reportgenerator-globaltool` - Generates HTML reports from coverage data

## Running Coverage Reports

### 1. Simple Coverage (Recommended for Development)
```powershell
# Run only unit tests coverage
powershell -ExecutionPolicy Bypass -File ./scripts/run-coverage-simple.ps1 -UnitOnly

# Run only integration tests coverage
powershell -ExecutionPolicy Bypass -File ./scripts/run-coverage-simple.ps1 -IntegrationOnly

# Run both (tolerates test failures)
powershell -ExecutionPolicy Bypass -File ./scripts/run-coverage-simple.ps1
```

### 2. Full Coverage Report
```powershell
# Run complete coverage analysis (fails if tests fail)
powershell -ExecutionPolicy Bypass -File ./scripts/run-coverage.ps1
```

### 3. CI/CD Coverage with Thresholds
```powershell
# Run with minimum coverage threshold (default 60%)
powershell -ExecutionPolicy Bypass -File ./scripts/run-coverage-ci.ps1

# Run with custom threshold
powershell -ExecutionPolicy Bypass -File ./scripts/run-coverage-ci.ps1 -MinimumCoverage 70
```

### 4. Linux/Mac Support
```bash
# Make script executable
chmod +x ./scripts/run-coverage.sh

# Run coverage
./scripts/run-coverage.sh
```

## Coverage Report Location
After running the scripts, coverage reports are available at:
- **HTML Report**: `coverage/report/index.html`
- **XML Report**: `coverage/report/Cobertura.xml`
- **Summary**: `coverage/report/Summary.txt`

## Current Coverage Status
As of the last run:
- **Line Coverage**: ~12%
- **Branch Coverage**: ~3.9%
- **Method Coverage**: ~4.9%

### Coverage by Module:
| Module | Line Coverage | Branch Coverage | Method Coverage |
|--------|---------------|-----------------|-----------------|
| Stocker.API | 0% | 0% | 0% |
| Stocker.Application | 2.71% | 1.4% | 1.98% |
| Stocker.Domain | 11.03% | 8.73% | 9.81% |
| Stocker.Identity | 0% | 0% | 0% |
| Stocker.Infrastructure | 5.64% | 5.99% | 5.17% |
| Stocker.Persistence | 3.73% | 7.19% | 14.38% |
| Stocker.SharedKernel | 16.77% | 21.27% | 17.07% |

## Excluded from Coverage
The following are automatically excluded from coverage reports:
- Test projects (`*.Tests`, `*.TestUtilities`)
- Migration files (`*.Migrations.*`)
- xUnit framework code
- Code marked with `[ExcludeFromCodeCoverage]` attribute

## Improving Coverage

### Priority Areas for Testing:
1. **Controllers** (API layer) - Currently 0% coverage
2. **Application Services** - Low coverage, business logic critical
3. **Identity/Authentication** - Security critical, needs coverage
4. **Infrastructure Services** - Integration points need testing

### Best Practices:
1. **Write tests before fixing bugs** - Ensure the bug doesn't reoccur
2. **Test business logic thoroughly** - Application layer is critical
3. **Integration tests for APIs** - Ensure endpoints work correctly
4. **Unit test domain logic** - Core business rules must be tested

## Continuous Integration

### GitHub Actions Integration
Add to your workflow:
```yaml
- name: Run Tests with Coverage
  run: powershell -ExecutionPolicy Bypass -File ./scripts/run-coverage-ci.ps1 -MinimumCoverage 60

- name: Upload Coverage Reports
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: coverage-report
    path: coverage/report/
```

### Azure DevOps Integration
```yaml
- task: PowerShell@2
  displayName: 'Run Tests with Coverage'
  inputs:
    filePath: './scripts/run-coverage-ci.ps1'
    arguments: '-MinimumCoverage 60'
    
- task: PublishCodeCoverageResults@1
  displayName: 'Publish Coverage Results'
  inputs:
    codeCoverageTool: 'Cobertura'
    summaryFileLocation: '$(System.DefaultWorkingDirectory)/coverage/coverage.cobertura.xml'
    reportDirectory: '$(System.DefaultWorkingDirectory)/coverage/report'
```

## Troubleshooting

### Common Issues:

1. **"ReportGenerator not found"**
   - Install globally: `dotnet tool install --global dotnet-reportgenerator-globaltool`

2. **"Coverage files not found"**
   - Ensure tests build successfully: `dotnet build`
   - Check test project references are correct

3. **Low/No Coverage Numbers**
   - Verify exclusion filters aren't too broad
   - Ensure coverlet packages are properly installed
   - Check that test projects reference the code projects

4. **Integration Tests Failing**
   - Check database connections
   - Ensure test containers are running
   - Verify test environment configuration

## Next Steps

1. **Set Coverage Goals**:
   - Short term: 25% overall coverage
   - Medium term: 50% coverage
   - Long term: 80% coverage for critical paths

2. **Integrate with CI/CD**:
   - Add coverage gates to PR checks
   - Generate coverage badges for README
   - Track coverage trends over time

3. **Focus on Critical Paths**:
   - Authentication/Authorization
   - Payment processing
   - Data validation
   - Business logic in Application layer