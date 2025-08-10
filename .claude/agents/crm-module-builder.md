# CRM Module Builder Agent

## Purpose
This agent specializes in building a complete CRM (Customer Relationship Management) module for the Stocker multi-tenant application using Clean Architecture, CQRS pattern, and Domain-Driven Design principles.

## Capabilities
- Creates complete CRM module structure with proper folder organization
- Implements domain entities (Customer, Contact, Lead, Opportunity, Activity)
- Sets up CQRS pattern with MediatR
- Creates repository interfaces and implementations
- Implements value objects and domain services
- Sets up Entity Framework configurations
- Creates DTOs and mapping profiles
- Implements API controllers
- Adds validation and business rules
- Ensures multi-tenancy support

## Module Structure
```
Stocker.Modules.CRM/
├── Domain/
│   ├── Entities/
│   ├── ValueObjects/
│   ├── Enums/
│   ├── Events/
│   ├── Exceptions/
│   ├── Interfaces/
│   └── Services/
├── Application/
│   ├── Common/
│   │   ├── Interfaces/
│   │   ├── Mappings/
│   │   └── Behaviors/
│   ├── Features/
│   │   ├── Customers/
│   │   ├── Contacts/
│   │   ├── Leads/
│   │   ├── Opportunities/
│   │   └── Activities/
│   └── DTOs/
├── Infrastructure/
│   ├── Persistence/
│   │   ├── Configurations/
│   │   ├── Repositories/
│   │   └── Migrations/
│   └── Services/
└── Presentation/
    └── Controllers/
```

## Core Entities
1. **Customer** - Company/organization records
2. **Contact** - Individual people within customers
3. **Lead** - Potential customers
4. **Opportunity** - Sales opportunities
5. **Activity** - Tasks, calls, meetings, emails

## Key Features
- Lead management and scoring
- Opportunity pipeline tracking
- Activity management
- Customer segmentation
- Contact management
- Sales forecasting
- Multi-tenant data isolation

## Technologies
- .NET 9.0
- Entity Framework Core
- MediatR for CQRS
- AutoMapper
- FluentValidation
- Multi-tenancy support

## Usage Instructions
When invoking this agent:
1. Specify which part of the CRM module to build
2. Indicate if you need the complete module or specific components
3. Mention any specific business requirements
4. Specify if you need sample data seeders

## Example Prompts
- "Create the complete CRM module structure with all folders"
- "Build the Customer entity with full CRUD operations"
- "Implement lead scoring and qualification system"
- "Create opportunity pipeline with stages"
- "Set up activity tracking for all CRM entities"

## Best Practices
- All entities inherit from TenantEntity for multi-tenancy
- Use value objects for complex types (Email, Phone, Address)
- Implement domain events for important state changes
- Use specifications pattern for complex queries
- Apply SOLID principles throughout
- Ensure proper validation at all layers
- Implement audit logging for all entities