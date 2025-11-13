# Coolify SSH Key Setup for Docker Management

## Quick Setup Guide

### Step 1: Get the SSH Private Key

Since the Docker Management Service needs to connect to the server (95.217.219.4), you need the SSH private key that can access this server.

**Option A: If you already have SSH access to the server:**
```bash
# On your local machine where you can SSH to the server
cat ~/.ssh/id_rsa  # or the key you use to connect
```

**Option B: Generate a new key pair for Docker Management:**
```bash
# Generate new key
ssh-keygen -t ed25519 -C "docker-management@stocker" -f docker_key -N ""

# Add public key to server
ssh-copy-id -i docker_key.pub root@95.217.219.4
```

### Step 2: Convert Private Key to Base64

```bash
# Linux/Mac:
base64 -w 0 < ~/.ssh/id_rsa > ssh_key_base64.txt

# Windows PowerShell:
$keyContent = Get-Content ~/.ssh/id_rsa -Raw
$base64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($keyContent))
$base64 | Out-File ssh_key_base64.txt -NoNewline
```

### Step 3: Add to Coolify

1. Go to your Coolify dashboard
2. Navigate to your Stocker application
3. Go to **Environment Variables** section
4. Add new variable:
   - **Key**: `DockerManagement__SshKeyBase64`
   - **Value**: (paste the entire base64 string from ssh_key_base64.txt)

5. Also add these if not already present:
   - **Key**: `DockerManagement__SshHost`
   - **Value**: `95.217.219.4`
   - **Key**: `DockerManagement__SshUser`
   - **Value**: `root`

### Step 4: Deploy and Test

1. Deploy the application with new environment variables
2. Check the logs for successful SSH connection
3. Visit `/dashboard/system/docker-stats` to verify it works

## Example Base64 Encoded Key Format

Your base64 encoded key should look something like this (this is just an example, don't use this):
```
LS0tLS1CRUdJTiBPUEVOU1NIIFBSSVZBVEUgS0VZLS0tLS0KYjNCbGJuTnphQzFyWlhrdGRqRUFBQUFBQkc1dmJtVUFBQUFFYm05dVpRQUFBQUFBQUFBQkFBQUJGd0FBQUFkemMyZ3RjbgpOaEFBQUFBd0VBQVFBQUFRRUF...
```

## Troubleshooting

### Error: "Could not find file '/app/keys/ssh_key'"
This means the environment variable is not set or not being read correctly.

### Error: "Permission denied (publickey)"
The SSH key is not authorized on the server. Add the public key to `~/.ssh/authorized_keys` on the server.

### Error: "Invalid base64 string"
Make sure the entire key is encoded as a single line without line breaks.

## Security Notes

1. **Never commit the SSH key or base64 string to Git**
2. **Use Coolify's secret management** for sensitive values
3. **Rotate keys regularly** (every 3-6 months)
4. **Use a dedicated key** for Docker management, not your personal SSH key

## Verification Commands

After setup, these commands should work from within the container:

```bash
# Test SSH connection
ssh -i /app/keys/ssh_key root@95.217.219.4 "docker --version"

# Test Docker stats
ssh -i /app/keys/ssh_key root@95.217.219.4 "docker system df"
```

## Alternative: Direct File Mount (Not Recommended)

If base64 encoding doesn't work, you can mount the key file directly in Coolify:

1. Upload the private key to the server where Coolify runs
2. Mount it as a volume in your application:
   ```yaml
   volumes:
     - /path/to/ssh_key:/app/keys/ssh_key:ro
   ```
3. Set permissions: `chmod 600 /path/to/ssh_key`

**Note**: This method is less secure and harder to manage.