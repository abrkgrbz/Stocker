# Tenant Registration Debug Checklist

## 1. Email Verification Log Check
After entering verification code, check logs for:
```
Email verified successfully for: {email}
🚀 Tenant provisioning job enqueued with ID {jobId}
```

If you see "⚠️ Tenant provisioning NOT enqueued":
- Check registration status in database
- Should be "Pending" or "Approved"

If you see "ℹ️ Tenant already exists":
- TenantId is already set on registration
- Check Tenants table

## 2. Hangfire Job Check
In Hangfire dashboard (/hangfire):
- Check "Enqueued" tab
- Look for "IMediator.Send" job
- Should show CreateTenantFromRegistrationCommand

## 3. Job Execution Check
Watch for these logs:
```
Starting tenant provisioning for TenantId: {id}
Creating database for tenant: {name}
Seeding data for tenant: {name}
Tenant provisioning completed successfully
```

## 4. SignalR Notification Check
```
📢 Published TenantActivatedDomainEvent
🔵 Sending SignalR notification to group: registration-{email}
✅ SignalR notification sent successfully
```

## 5. Database Check
After job completes, verify:
- Tenant database created: `Stocker_{CompanyCode}_Db`
- Hangfire tables in Hangfire DB (if tables not there, job won't run)
- Seed data in tenant DB

## 6. Common Issues

### Hangfire Tables Not Created
**Symptom**: No jobs in dashboard, tables don't exist
**Fix**: 
1. Restart application - HangfireInitializationService should create them
2. Check logs for "Initializing Hangfire database schema"
3. If connection string error, check appsettings.json

### Job Enqueued But Not Running
**Symptom**: Job shows in "Enqueued" but never moves to "Processing"
**Fix**:
1. Check Hangfire server is running (should see server in dashboard)
2. Check for errors in "Failed" tab
3. Restart Hangfire server

### Seed Data Not Created  
**Symptom**: Database created but empty
**Fix**:
1. Check if SeedTenantDataAsync is called (log: "Seeding data for tenant")
2. Check TenantDataSeeder for errors
3. Verify package name is correct

