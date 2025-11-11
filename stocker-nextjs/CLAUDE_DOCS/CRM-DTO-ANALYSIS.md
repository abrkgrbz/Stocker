# CRM Module DTO Analysis & Fixes

## Summary
Analysis of frontend-backend DTO compatibility for all CRM entities.

## Backend Command Structures

### Commands with Wrapper Objects ❌
These commands expect data wrapped in a property:

| Entity | Backend Command | Wrapper Property | Status |
|--------|----------------|------------------|--------|
| Lead | `CreateLeadCommand` | `LeadData` | ✅ FIXED |
| Customer | `CreateCustomerCommand` | `CustomerData` | ✅ HANDLED IN SERVICE |

### Commands with Direct Properties ✅
These commands accept properties directly (no wrapper):

| Entity | Backend Command | Status |
|--------|----------------|--------|
| Activity | `CreateActivityCommand` | ✅ OK |
| Deal | `CreateDealCommand` | ✅ OK |
| Opportunity | `CreateOpportunityCommand` | ✅ OK |
| Campaign | `CreateCampaignCommand` | ✅ OK |

## Fixes Applied

### 1. Lead Creation ✅
**File**: `stocker-nextjs/src/lib/api/hooks/useCRM.ts`
**Lines**: 280-285

```typescript
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => {
      // Backend expects { LeadData: {...} } format
      const payload = { LeadData: data };
      return CRMService.createLead(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.leads });
      message.success('Lead oluşturuldu');
    },
    onError: () => {
      message.error('Lead oluşturulamadı');
    },
  });
}
```

**Backend Expects**:
```csharp
public class CreateLeadCommand : IRequest<Result<LeadDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateLeadDto LeadData { get; set; } = null!;
}
```

### 2. Customer Creation ✅
**File**: `stocker-nextjs/src/lib/api/services/crm.service.ts`
**Lines**: 337-350

**Status**: Already handled correctly in service layer. The service wraps the data:

```typescript
static async createCustomer(data: CreateCustomerDto): Promise<Customer> {
  // CRM module expects: CreateCustomerCommand { CustomerData: CreateCustomerDto }
  const command = {
    CustomerData: {
      CompanyName: data.companyName,
      Email: data.email,
      Phone: this.formatPhoneNumber(data.phone),
      // ... other fields
    }
  };
  return ApiService.post<Customer>(this.getPath('customers'), command);
}
```

**Backend Expects**:
```csharp
public class CreateCustomerCommand : IRequest<Result<CustomerDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateCustomerDto CustomerData { get; set; } = null!;
}
```

### 3. Activity Creation ✅
**Status**: No wrapper needed. Command accepts direct properties.

**Backend**:
```csharp
public class CreateActivityCommand : IRequest<Result<ActivityDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ActivityType Type { get; set; }
    // ... direct properties
}
```

### 4. Deal Creation ✅
**Status**: No wrapper needed. Command accepts direct properties.

**Backend**:
```csharp
public class CreateDealCommand : IRequest<Result<DealDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    // ... direct properties
}
```

### 5. Opportunity Creation ✅
**Status**: No wrapper needed. Command accepts direct properties.

**Backend**:
```csharp
public class CreateOpportunityCommand : IRequest<Result<OpportunityDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    // ... direct properties
}
```

### 6. Campaign Creation ✅
**Status**: No wrapper needed. Command accepts direct properties.

**Backend**:
```csharp
public class CreateCampaignCommand : IRequest<Result<CampaignDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    // ... direct properties
}
```

## Testing Checklist

### Lead ✅
- [x] Create lead from /crm/leads page
- [x] Verify LeadData wrapper is sent
- [x] Check backend receives correct format

### Customer ✅
- [x] Create customer from /crm/customers page
- [x] Verify CustomerData wrapper is sent
- [x] Service layer handles wrapping

### Deal ✅
- [x] Create deal from /crm/deals page
- [x] Verify direct properties sent (no wrapper)
- [x] Activity creation from deal detail page works

### Opportunity ✅
- [x] Create opportunity from /crm/opportunities page
- [x] Verify direct properties sent (no wrapper)

### Campaign ✅
- [x] Create campaign from /crm/campaigns page
- [x] Verify direct properties sent (no wrapper)

### Activity ✅
- [x] Create activity from /crm/activities page
- [x] Create activity from deal detail page
- [x] Verify direct properties sent (no wrapper)
- [x] Verify Guid conversion for entity IDs

## Common Issues & Solutions

### Issue 1: "The [Entity]Data field is required"
**Cause**: Backend expects wrapper object but frontend sends flat object

**Solution**: Wrap data in hook:
```typescript
mutationFn: (data: any) => {
  const payload = { EntityData: data };
  return CRMService.createEntity(payload);
}
```

### Issue 2: Type mismatch for entity IDs
**Cause**: Frontend sends number but backend expects Guid (string)

**Solution**: Convert to string:
```typescript
leadId: values.leadId ? String(values.leadId) : null
```

### Issue 3: Cannot read properties of undefined (reading 'toISOString')
**Cause**: Date field not validated before calling toISOString()

**Solution**: Add null safety check:
```typescript
if (!values.startTime) {
  message.error('Başlangıç zamanı gerekli');
  return;
}
const dueDate = values.startTime.toISOString();
```

## Architecture Pattern

### When to Wrap Data
**Rule**: Check backend Command definition

```csharp
// Wrapper Pattern ❌
public class CreateEntityCommand : IRequest<Result<EntityDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateEntityDto EntityData { get; set; } = null!;  // <-- Wrapper property
}

// Direct Pattern ✅
public class CreateEntityCommand : IRequest<Result<EntityDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;  // <-- Direct properties
    public string? Description { get; set; }
}
```

### Best Practice
1. Always check backend Command structure first
2. Wrap data in hook if needed (not in service layer)
3. Keep service layer methods consistent
4. Add TypeScript types for better type safety

## Related Commits
- `530db8ca` - fix(CRM): Wrap lead data in LeadData property for backend
- `4f3045f1` - fix(CRM): Convert entity IDs to Guid format and add debug logging
- `5de2bd8d` - fix(CRM): Add null safety check for startTime in ActivityModal
- `1dcfa38d` - fix(CRM): Add activity creation functionality to deal detail page

## Last Updated
2025-01-11
