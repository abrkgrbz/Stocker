#!/bin/bash

# SSH Key Setup Script for Docker Management
# This script should be run ON THE SERVER (95.217.219.4)

echo "======================================"
echo "Docker Management SSH Key Setup"
echo "======================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
   echo "Please run as root (use sudo)"
   exit 1
fi

# Define key path
SSH_KEY_PATH="/root/.ssh/docker_management_key"
SSH_KEY_PATH_PUB="${SSH_KEY_PATH}.pub"

echo "This script will:"
echo "1. Generate a new SSH key pair for Docker management"
echo "2. Add the public key to authorized_keys"
echo "3. Display the private key in Base64 format for Coolify"
echo ""

# Check if key already exists
if [ -f "$SSH_KEY_PATH" ]; then
    echo "⚠️  SSH key already exists at: $SSH_KEY_PATH"
    read -p "Do you want to use the existing key? (y/n): " use_existing

    if [ "$use_existing" != "y" ]; then
        read -p "Generate a new key? This will overwrite the existing one (y/n): " generate_new
        if [ "$generate_new" != "y" ]; then
            echo "Exiting..."
            exit 0
        fi
    else
        # Use existing key
        echo ""
        echo "Using existing key..."
    fi
else
    # Generate new key
    echo "Generating new SSH key pair..."
    ssh-keygen -t ed25519 -f "$SSH_KEY_PATH" -N "" -C "docker-management@stocker"

    if [ $? -ne 0 ]; then
        echo "❌ Failed to generate SSH key"
        exit 1
    fi

    echo "✅ SSH key generated successfully"
fi

# Add public key to authorized_keys if not already there
if [ -f "$SSH_KEY_PATH_PUB" ]; then
    # Check if already in authorized_keys
    if ! grep -q "$(cat $SSH_KEY_PATH_PUB)" /root/.ssh/authorized_keys 2>/dev/null; then
        echo "Adding public key to authorized_keys..."
        cat "$SSH_KEY_PATH_PUB" >> /root/.ssh/authorized_keys
        chmod 600 /root/.ssh/authorized_keys
        echo "✅ Public key added to authorized_keys"
    else
        echo "✅ Public key already in authorized_keys"
    fi
fi

# Set correct permissions
chmod 600 "$SSH_KEY_PATH"
chmod 644 "$SSH_KEY_PATH_PUB"

echo ""
echo "======================================"
echo "SSH KEY READY FOR COOLIFY"
echo "======================================"
echo ""

# Convert to Base64
echo "Converting private key to Base64..."
BASE64_KEY=$(base64 -w 0 < "$SSH_KEY_PATH")

# Display instructions
echo "✅ Setup complete!"
echo ""
echo "========== COOLIFY CONFIGURATION =========="
echo ""
echo "Add these environment variables to your Coolify application:"
echo ""
echo "1. DockerManagement__SshKeyBase64"
echo "   (Copy the Base64 string below - it's one long line)"
echo ""
echo "------- COPY FROM HERE -------"
echo "$BASE64_KEY"
echo "------- COPY TO HERE -------"
echo ""
echo "2. DockerManagement__SshHost"
echo "   Value: $(hostname -I | awk '{print $1}')"
echo ""
echo "3. DockerManagement__SshUser"
echo "   Value: root"
echo ""
echo "==========================================="
echo ""

# Test the key
echo "Testing SSH connection..."
ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no root@localhost "echo '✅ SSH key works!'" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ SSH connection test successful"
else
    echo "⚠️  SSH connection test failed (this might be normal if SSH is restricted to localhost)"
fi

echo ""
echo "📝 Key information saved to:"
echo "   Private key: $SSH_KEY_PATH"
echo "   Public key: $SSH_KEY_PATH_PUB"
echo ""
echo "⚠️  IMPORTANT: Keep the Base64 string secure!"
echo "   - Don't commit it to Git"
echo "   - Only paste it in Coolify's secret environment variables"
echo ""
echo "Done!"