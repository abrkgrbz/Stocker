# Docker Management Service Setup

## Overview
The Docker Management Service connects to your production server via SSH to monitor and manage Docker resources.

## Configuration

### Required Environment Variables

Add these to your `.env` or Coolify environment:

```env
# SSH Connection Settings
DockerManagement__SshHost=95.217.219.4
DockerManagement__SshUser=root

# Option 1: SSH Key as Base64 (Recommended for cloud deployments)
DockerManagement__SshKeyBase64=YOUR_BASE64_ENCODED_SSH_KEY

# Option 2: SSH Key File Path (For local development)
DockerManagement__SshKeyPath=/app/keys/ssh_key
```

## Setting Up SSH Key

### Step 1: Generate SSH Key (if you don't have one)
```bash
ssh-keygen -t ed25519 -f docker_management_key -N ""
```

### Step 2: Add Public Key to Server
```bash
ssh-copy-id -i docker_management_key.pub root@95.217.219.4
```

### Step 3: Encode Private Key as Base64
```bash
# On Linux/Mac:
base64 -w 0 docker_management_key > docker_management_key.base64

# On Windows (PowerShell):
[Convert]::ToBase64String([IO.File]::ReadAllBytes("docker_management_key")) | Out-File docker_management_key.base64
```

### Step 4: Add to Environment Variables

#### For Coolify:
1. Go to your Coolify dashboard
2. Navigate to your application settings
3. Add environment variable:
   - Key: `DockerManagement__SshKeyBase64`
   - Value: (paste the base64 content)

#### For Local Development:
Add to `.env.local`:
```env
DockerManagement__SshKeyBase64=LS0tLS1CRUdJTi...YOUR_BASE64_KEY...
```

## Security Considerations

1. **Never commit SSH keys to Git**
   - Add `*.key` and `*.pem` to `.gitignore`
   - Use environment variables or secrets management

2. **Use Dedicated SSH Key**
   - Create a specific key for Docker management
   - Don't reuse personal SSH keys

3. **Limit SSH Access**
   - Consider creating a limited user for Docker management
   - Use SSH key with passphrase if possible

4. **Rotate Keys Regularly**
   - Change SSH keys every 3-6 months
   - Remove old keys from authorized_keys

## Troubleshooting

### Error: "Could not find file '/app/keys/ssh_key'"
**Cause**: SSH key not provided via environment variable
**Solution**: Add `DockerManagement__SshKeyBase64` to environment

### Error: "Permission denied (publickey)"
**Cause**: SSH key not authorized on server
**Solution**: Add public key to `~/.ssh/authorized_keys` on server

### Error: "Host key verification failed"
**Cause**: Server's host key not trusted
**Solution**:
```bash
ssh-keyscan -H 95.217.219.4 >> ~/.ssh/known_hosts
```

## Testing the Connection

### 1. Test SSH Connection Manually
```bash
ssh -i docker_management_key root@95.217.219.4 "docker --version"
```

### 2. Test in Application
Navigate to `/dashboard/system/docker-stats` to verify connection works.

## Docker Commands Used

The service runs these commands on the remote server:
- `docker system df` - Get disk usage statistics
- `docker system prune` - Clean up unused resources
- `docker container prune` - Remove stopped containers
- `docker image prune` - Remove unused images
- `docker volume prune` - Remove unused volumes
- `docker builder prune` - Clean build cache

## Monitoring

Check Sentry for any SSH connection errors:
```
tags.subdomain:main AND message:"SSH connection"
```

## Alternative: Using Docker API

If SSH access is not available, consider:
1. Exposing Docker API with TLS
2. Using Docker Socket over SSH tunnel
3. Installing monitoring agent on server

## Related Documentation
- [Azure Key Vault Setup](./AZURE_KEY_VAULT_SETUP.md) - For storing SSH keys securely
- [Sentry Monitoring](../monitoring/SENTRY_SUBDOMAIN_TRACKING.md) - For tracking errors