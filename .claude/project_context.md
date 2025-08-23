# Claude Code Project Context

## Quick Commands
- Build: `dotnet build`
- Run: `dotnet run --project src/API/Stocker.API`
- Test: `dotnet test`
- Migration: `dotnet ef database update -c MasterDbContext`

## Recent Changes Tracking
Track all changes with clear commit messages and update CHANGELOG.md

## Code Patterns
- Use background jobs for long-running operations
- Always validate input with FluentValidation
- Use Result<T> pattern for operation results
- Implement retry policies for external services

## Testing Approach
- Unit tests for business logic
- Integration tests for API endpoints
- Use in-memory database for testing

## Security Considerations
- Never commit secrets
- Use environment variables for sensitive data
- Implement rate limiting on all public endpoints
- Validate all user inputs