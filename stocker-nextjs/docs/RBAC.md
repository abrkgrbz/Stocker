# Role-Based Access Control (RBAC) System

Comprehensive guide for implementing role-based permissions in Stocker Next.js tenant application.

## Role Hierarchy

The system supports three role levels:

1. **FirmaYöneticisi** (Company Manager) - Full admin privileges
2. **Yönetici** (Manager) - Limited admin privileges
3. **Kullanıcı** (User) - Standard user privileges

## Permission Matrix

| Permission | FirmaYöneticisi | Yönetici | Kullanıcı |
|-----------|----------------|---------|----------|
| Manage Users | ✅ | ❌ | ❌ |
| Manage Tenant Settings | ✅ | ❌ | ❌ |
| Manage Modules | ✅ | ❌ | ❌ |
| View All Data | ✅ | ✅ | ❌ |
| Manage Integrations | ✅ | ✅ | ❌ |
| Manage Billing | ✅ | ❌ | ❌ |
| Manage Security | ✅ | ❌ | ❌ |
| Manage Roles | ✅ | ❌ | ❌ |
| Delete Data | ✅ | ❌ | ❌ |
| Export Data | ✅ | ✅ | ❌ |

## Usage Examples

### 1. Using the useRole Hook

The `useRole()` hook provides easy access to role information and permissions:

```typescript
import { useRole } from '@/hooks/useRole';

function MyComponent() {
  const { isAdmin, isManager, hasPermission, displayName, badgeColor } = useRole();

  return (
    <div>
      {/* Show admin-only content */}
      {isAdmin && <AdminDashboard />}

      {/* Show manager or admin content */}
      {isManager && <ManagerTools />}

      {/* Check specific permission */}
      {hasPermission('canManageUsers') && (
        <Button>Kullanıcı Yönetimi</Button>
      )}

      {/* Display role info */}
      <Tag color={badgeColor}>{displayName}</Tag>
    </div>
  );
}
```

### 2. Protecting Routes with AdminRoute

Use `AdminRoute` to restrict entire pages to admin users:

```typescript
import { AdminRoute } from '@/components/auth/AdminRoute';

export default function AdminPage() {
  return (
    <AdminRoute fallback={<LoadingSpinner />}>
      <div>
        <h1>Admin Panel</h1>
        {/* Admin-only content */}
      </div>
    </AdminRoute>
  );
}
```

### 3. Conditional Rendering with PermissionGate

Use `PermissionGate` for fine-grained permission checks:

```typescript
import { PermissionGate, AdminOnly, ManagerOnly } from '@/components/auth/PermissionGate';

function Dashboard() {
  return (
    <div>
      {/* Only show for users with specific permission */}
      <PermissionGate permission="canManageUsers">
        <UserManagementSection />
      </PermissionGate>

      {/* Only show for admins */}
      <AdminOnly>
        <SystemSettings />
      </AdminOnly>

      {/* Only show for managers and admins */}
      <ManagerOnly>
        <ReportsSection />
      </ManagerOnly>

      {/* Show different content based on permission */}
      <PermissionGate
        permission="canViewAllData"
        fallback={<p>Yalnızca kendi verilerinizi görebilirsiniz</p>}
      >
        <AllDataView />
      </PermissionGate>
    </div>
  );
}
```

### 4. Using Role Utilities Directly

For more complex logic, use the utility functions directly:

```typescript
import { isAdmin, hasPermission, getRolePermissions } from '@/lib/utils/roles';

function checkUserAccess(userRole: string) {
  // Check if admin
  if (isAdmin(userRole)) {
    return 'full_access';
  }

  // Check specific permission
  if (hasPermission(userRole, 'canManageIntegrations')) {
    return 'integration_access';
  }

  // Get all permissions
  const permissions = getRolePermissions(userRole);
  if (permissions.canViewAllData) {
    return 'view_all';
  }

  return 'limited_access';
}
```

### 5. API Route Protection

Protect API routes by checking permissions:

```typescript
// app/api/admin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/utils/roles';

export async function GET(request: NextRequest) {
  // Get user from session/JWT
  const user = await getUserFromRequest(request);

  // Check if admin
  if (!isAdmin(user?.role)) {
    return NextResponse.json(
      { error: 'Yetkisiz erişim' },
      { status: 403 }
    );
  }

  // Admin-only logic
  const adminData = await getAdminData();
  return NextResponse.json(adminData);
}
```

### 6. Middleware Protection

Create middleware for route protection:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAdmin } from '@/lib/utils/roles';

export function middleware(request: NextRequest) {
  // Get user from cookie/JWT
  const user = getUserFromCookie(request);

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!isAdmin(user?.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/settings/:path*'],
};
```

## Best Practices

### 1. Always Check Permissions on Both Client and Server
```typescript
// ❌ Bad - only client-side check
function DeleteButton() {
  const { hasPermission } = useRole();
  if (!hasPermission('canDeleteData')) return null;

  return <Button onClick={() => deleteData()}>Sil</Button>;
}

// ✅ Good - both client and server checks
function DeleteButton() {
  const { hasPermission } = useRole();
  if (!hasPermission('canDeleteData')) return null;

  const handleDelete = async () => {
    // API will also check permissions
    await fetch('/api/data', { method: 'DELETE' });
  };

  return <Button onClick={handleDelete}>Sil</Button>;
}
```

### 2. Use Type-Safe Permission Checks
```typescript
// ✅ Good - TypeScript will catch typos
hasPermission('canManageUsers')

// ❌ Bad - string literal can have typos
hasPermission('canManageUsrs') // typo!
```

### 3. Provide Clear Feedback
```typescript
// ✅ Good - explain why user can't access
<PermissionGate
  permission="canManageUsers"
  fallback={
    <Alert type="warning">
      Bu özelliği kullanmak için admin yetkisine ihtiyacınız var.
    </Alert>
  }
>
  <UserManagement />
</PermissionGate>
```

### 4. Cache Role Data
The `useRole()` hook automatically uses the auth context, which caches user data. Don't fetch role data separately.

```typescript
// ❌ Bad - unnecessary API call
const [role, setRole] = useState<string>();
useEffect(() => {
  fetch('/api/user/role').then(r => r.json()).then(setRole);
}, []);

// ✅ Good - use cached data from auth context
const { role } = useRole();
```

## Testing Role-Based Features

### Unit Testing
```typescript
import { render } from '@testing-library/react';
import { useRole } from '@/hooks/useRole';

// Mock the hook
jest.mock('@/hooks/useRole');

test('shows admin content for admin users', () => {
  (useRole as jest.Mock).mockReturnValue({
    isAdmin: true,
    hasPermission: () => true,
  });

  const { getByText } = render(<MyComponent />);
  expect(getByText('Admin Panel')).toBeInTheDocument();
});
```

### E2E Testing
```typescript
describe('Admin Access', () => {
  it('should redirect non-admin users', () => {
    cy.login('user@example.com'); // Regular user
    cy.visit('/admin');
    cy.url().should('include', '/unauthorized');
  });

  it('should allow admin users', () => {
    cy.login('admin@example.com'); // Admin user
    cy.visit('/admin');
    cy.contains('Admin Panel').should('be.visible');
  });
});
```

## Troubleshooting

### Role Not Updating After Login
- Ensure auth context is properly wrapped around the app
- Check that JWT/cookie includes role information
- Verify role is being extracted correctly in auth-context.tsx

### Permission Check Always Returns False
- Verify role string matches enum values (case-sensitive)
- Check that permission key exists in RolePermissions interface
- Ensure user object has role field populated

### AdminRoute Not Redirecting
- Verify router is from 'next/navigation', not 'next/router'
- Check that /unauthorized page exists
- Ensure AdminRoute is used in client components ('use client')

## Migration Guide

### Updating Existing Components
1. Import `useRole()` hook
2. Replace manual role checks with `isAdmin()` or `hasPermission()`
3. Wrap admin sections with `<AdminOnly>` or `<PermissionGate>`
4. Test thoroughly with different role accounts

### Example Migration
```typescript
// Before
function MyComponent() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'FirmaYöneticisi';

  return (
    <div>
      {isAdmin && <AdminButton />}
    </div>
  );
}

// After
function MyComponent() {
  const { isAdmin } = useRole();

  return (
    <div>
      <AdminOnly>
        <AdminButton />
      </AdminOnly>
    </div>
  );
}
```

## Future Enhancements

Potential improvements to the RBAC system:

1. **Dynamic Permissions**: Load permissions from API instead of hardcoded
2. **Permission Groups**: Create permission sets for common combinations
3. **Audit Logging**: Track permission checks and access attempts
4. **Role Hierarchy**: Allow role inheritance (e.g., Admin inherits Manager permissions)
5. **Custom Roles**: Allow tenants to create custom roles with specific permissions
6. **Time-Based Permissions**: Temporary elevated permissions with expiration
