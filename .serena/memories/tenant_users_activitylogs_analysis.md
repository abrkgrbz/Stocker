# Tenant Users & Activity Logs Analysis

## 📊 CRITICAL FINDINGS

### 1. Tenant Users Page (Users/index.tsx)

**Status:** 🟡 PARTIALLY INTEGRATED (70% Real, 30% Mock)

#### ✅ REAL API (Working):
**Line 158:** `const response = await userService.getByTenant(id);`
**Endpoint:** `GET /api/tenant/users?tenantId={id}`
**Service:** `userService` from `services/api`

**Data Transformation (Lines 161-179):**
```typescript
const transformedUsers: TenantUser[] = response.map(user => ({
  id: user.id,                    // ✅ Real
  name: user.fullName,            // ✅ Real
  email: user.email,              // ✅ Real
  phone: undefined,               // ❌ Missing in API
  role: user.roles.join(', '),    // ✅ Real
  department: undefined,          // ❌ Missing in API
  title: undefined,               // ❌ Missing in API
  status: user.isActive ? 'active' : 'inactive', // ✅ Real
  lastLogin: user.lastLogin,      // ✅ Real
  createdAt: user.createdAt,      // ✅ Real
  emailVerified: user.isEmailConfirmed, // ✅ Real
  twoFactorEnabled: user.isTwoFactorEnabled, // ✅ Real
  permissions: [],                // ❌ Missing in API
  loginCount: 0,                  // ❌ Missing in API
  ipAddress: undefined,           // ❌ Missing in API
  location: undefined             // ❌ Missing in API
}));
```

#### ❌ MOCK DATA (Lines 196-200+):
**Roles Data:**
```typescript
const fetchRoles = async () => {
  // Simulated data
  setRoles([
    {
      id: '1',
      name: 'Admin',
      description: 'Full system access',
      permissions: ['*'],
      userCount: 5,
      isSystem: true,
      color: 'red'
    },
    // More mock roles...
  ]);
};
```

**Missing Backend:**
- `GET /api/master/roles` - Role list endpoint
- `GET /api/master/roles/{id}` - Role details
- User statistics (loginCount, ipAddress, location)

**Impact:** 
- User list works ✅
- Role management incomplete ❌
- Some user fields missing ⚠️

---

### 2. Activity Logs Page (ActivityLogs.tsx)

**Status:** 🔴 100% MOCK DATA

#### ❌ ALL MOCK (Lines 124-200+):
```typescript
// Mock data
const mockLogs: ActivityLog[] = [
  {
    id: '1',
    timestamp: '2024-12-07T14:30:00Z',
    action: 'Kullanıcı girişi',
    category: 'auth',
    severity: 'info',
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@abc-corp.com',
      role: 'Admin',
    },
    description: 'Başarılı giriş yapıldı',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    location: 'İstanbul, Türkiye',
    sessionId: 'ses_abc123',
  },
  // More hardcoded logs...
];
```

**Current Implementation:**
- No API service imported ❌
- No API calls made ❌
- All data hardcoded ❌
- Uses ProTable from Ant Design Pro ⚠️

**Missing Backend:**
```
GET /api/master/tenants/{id}/activity-logs
GET /api/master/tenants/{id}/security-events
GET /api/admin/logs?tenantId={id}&category={category}
POST /api/master/tenants/{id}/activity-logs/export
```

**Impact:** CRITICAL - No real audit trail ❌

---

## 🎯 PRIORITY ACTIONS

### IMMEDIATE (Today - 2-3 hours):

#### 1. Fix Users Page Roles (30 minutes)
**Backend Task:**
```csharp
// Controller: MasterAuthController.cs or RolesController.cs
[HttpGet("roles")]
[Authorize(Roles = "SistemYoneticisi")]
public async Task<IActionResult> GetRoles()
{
    var roles = await _roleManager.Roles
        .Select(r => new {
            Id = r.Id,
            Name = r.Name,
            Description = r.Description ?? "",
            Permissions = r.Claims.Select(c => c.ClaimValue).ToList(),
            UserCount = _userManager.Users.Count(u => u.Roles.Contains(r.Name)),
            IsSystem = r.Name.StartsWith("System"),
            Color = GetRoleColor(r.Name)
        })
        .ToListAsync();
    
    return Ok(roles);
}
```

**Frontend Task:**
```typescript
// Update Users/index.tsx:195
const fetchRoles = async () => {
  try {
    const roles = await roleService.getAll(); // Use real API
    setRoles(roles);
  } catch (error) {
    message.error('Roller yüklenemedi');
  }
};
```

#### 2. Connect Activity Logs (2-3 hours)

**Backend Task (Priority):**
```csharp
// Controller: MasterTenantController.cs
[HttpGet("{id}/activity-logs")]
[Authorize(Roles = "SistemYoneticisi")]
public async Task<IActionResult> GetActivityLogs(
    Guid id,
    [FromQuery] string? category = null,
    [FromQuery] string? severity = null,
    [FromQuery] DateTime? startDate = null,
    [FromQuery] DateTime? endDate = null,
    [FromQuery] int pageNumber = 1,
    [FromQuery] int pageSize = 50)
{
    var logs = await _auditLogService.GetTenantLogsAsync(
        id, 
        category, 
        severity, 
        startDate ?? DateTime.UtcNow.AddDays(-30),
        endDate ?? DateTime.UtcNow,
        pageNumber,
        pageSize
    );
    
    return Ok(new {
        logs = logs.Items.Select(l => new {
            Id = l.Id,
            Timestamp = l.CreatedAt,
            Action = l.Action,
            Category = l.Category,
            Severity = l.Severity,
            User = new {
                Id = l.UserId,
                Name = l.User.FullName,
                Email = l.User.Email,
                Role = l.User.Roles.FirstOrDefault()
            },
            Target = l.TargetEntity,
            Description = l.Description,
            Details = l.Details,
            IpAddress = l.IpAddress,
            UserAgent = l.UserAgent,
            Location = l.Location
        }),
        totalCount = logs.TotalCount,
        pageNumber = logs.PageNumber,
        pageSize = logs.PageSize
    });
}
```

**Frontend Task:**
```typescript
// Create: services/api/activityLogService.ts
export const activityLogService = {
  async getTenantLogs(
    tenantId: string, 
    params?: {
      category?: string;
      severity?: string;
      startDate?: string;
      endDate?: string;
      pageNumber?: number;
      pageSize?: number;
    }
  ) {
    return apiClient.get(`/api/master/tenants/${tenantId}/activity-logs`, params);
  }
};

// Update: ActivityLogs.tsx
import { activityLogService } from '../../../services/api/activityLogService';

const fetchLogs = async () => {
  setLoading(true);
  try {
    const response = await activityLogService.getTenantLogs(id!, {
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      severity: severityFilter !== 'all' ? severityFilter : undefined,
      pageNumber: 1,
      pageSize: 50
    });
    
    setLogs(response.logs);
    setTotalCount(response.totalCount);
  } catch (error) {
    message.error('Activity logs yüklenemedi');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchLogs();
}, [id, categoryFilter, severityFilter]);
```

---

## 📋 BACKEND ENDPOINTS NEEDED

### Priority P0 (Critical - Today):
```
✅ GET /api/tenant/users?tenantId={id} (Already exists)
❌ GET /api/master/roles (Create today)
❌ GET /api/master/tenants/{id}/activity-logs (Create today)
```

### Priority P1 (Important - Tomorrow):
```
❌ GET /api/master/tenants/{id}/security-events
❌ POST /api/master/tenants/{id}/activity-logs/export
❌ GET /api/master/users/{userId}/activity-logs
```

### Priority P2 (Nice to Have):
```
❌ GET /api/master/tenants/{id}/users/{userId}/sessions
❌ GET /api/master/tenants/{id}/users/{userId}/permissions
❌ POST /api/master/tenants/{id}/users/{userId}/reset-password
```

---

## 🔥 QUICK IMPLEMENTATION PLAN

### Step 1: Backend (2 hours)
```bash
# 1. Create RolesController.cs
dotnet new controller -n RolesController -o src/API/Stocker.API/Controllers/Master/

# 2. Add GetRoles endpoint
# 3. Add GetActivityLogs to MasterTenantController
# 4. Test with Swagger
```

### Step 2: Frontend (1 hour)
```bash
# 1. Create activityLogService.ts
# 2. Update Users/index.tsx fetchRoles()
# 3. Update ActivityLogs.tsx with real API
# 4. Test in browser
```

### Step 3: Testing (30 minutes)
```bash
# 1. Test role list display
# 2. Test activity logs pagination
# 3. Test filters (category, severity)
# 4. Test error handling
```

---

## ✅ COMPLETION CRITERIA

### Users Page:
- [x] User list displays (Already working)
- [ ] Roles fetched from real API
- [ ] Role filtering works
- [ ] Role assignment works
- [ ] Missing user fields handled gracefully

### Activity Logs Page:
- [ ] Logs fetched from real API
- [ ] Pagination works
- [ ] Category filter works
- [ ] Severity filter works
- [ ] Date range filter works
- [ ] Export functionality (Optional)

---

## 📊 CURRENT STATUS SUMMARY

| Feature | Status | Mock % | Real % | Priority |
|---------|--------|--------|--------|----------|
| Tenant List | ✅ Done | 0% | 100% | - |
| Tenant CRUD | ✅ Done | 0% | 100% | - |
| Tenant Details | ✅ Done | 0% | 100% | - |
| **Tenant Users** | 🟡 Partial | 30% | 70% | P0 |
| **Activity Logs** | 🔴 Mock | 100% | 0% | P0 |
| Tenant Health | 🔴 Mock | 100% | 0% | P1 |
| Tenant Domains | 🔴 Mock | 100% | 0% | P2 |
| Tenant Migrations | ⚠️ Unknown | ? | ? | P2 |

---

## 🎯 TODAY'S GOALS

1. ✅ Analyze Users & ActivityLogs pages (DONE)
2. [ ] Create Roles endpoint (Backend - 1 hour)
3. [ ] Create ActivityLogs endpoint (Backend - 2 hours)
4. [ ] Connect Users roles (Frontend - 30 min)
5. [ ] Connect ActivityLogs (Frontend - 1 hour)

**Total Time:** ~4-5 hours
**Result:** Users & ActivityLogs 100% real data ✅

---

**Analysis Date:** 2025-01-18
**Next Action:** Create backend endpoints for roles and activity logs
