# SMTP Authentication Test Script
# Tests mail.privateemail.com authentication with provided credentials

param(
    [string]$SmtpHost = "mail.privateemail.com",
    [int]$Port = 465,
    [string]$Username = "info@stoocker.app",
    [string]$Password = "A.bg010203",
    [string]$ToEmail = "info@stoocker.app"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SMTP Authentication Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  SMTP Host: $SmtpHost"
Write-Host "  Port: $Port"
Write-Host "  Username: $Username"
Write-Host "  Password: $($Password.Substring(0, 2))***"
Write-Host "  SSL/TLS: Enabled"
Write-Host ""

try {
    # Create credentials
    $securePassword = ConvertTo-SecureString $Password -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($Username, $securePassword)

    Write-Host "[...] Creating SMTP client..." -ForegroundColor Yellow

    # Create SMTP client
    $smtpClient = New-Object System.Net.Mail.SmtpClient($SmtpHost, $Port)
    $smtpClient.EnableSsl = $true
    $smtpClient.Credentials = $credential
    $smtpClient.Timeout = 10000

    Write-Host "[OK] SMTP client created successfully" -ForegroundColor Green
    Write-Host ""
    Write-Host "[...] Testing authentication by sending test email..." -ForegroundColor Yellow

    # Create test message
    $message = New-Object System.Net.Mail.MailMessage
    $message.From = New-Object System.Net.Mail.MailAddress($Username, "Stocker Test")
    $message.To.Add($ToEmail)
    $message.Subject = "SMTP Authentication Test - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    $message.Body = @"
SMTP Authentication Test

This is a test email to verify SMTP authentication.

Test Details:
- Server: $SmtpHost
- Port: $Port
- Username: $Username
- Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

If you received this email, SMTP authentication is working correctly.
"@

    # Send email
    $smtpClient.Send($message)

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "[OK] SUCCESS!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "[OK] SMTP authentication successful" -ForegroundColor Green
    Write-Host "[OK] Test email sent successfully to $ToEmail" -ForegroundColor Green
    Write-Host ""
    Write-Host "The credentials are working correctly:" -ForegroundColor Green
    Write-Host "  Username: $Username" -ForegroundColor Green
    Write-Host "  Password: VERIFIED" -ForegroundColor Green
    Write-Host ""

    # Cleanup
    $message.Dispose()
    $smtpClient.Dispose()

    exit 0
}
catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "[FAILED] AUTHENTICATION FAILED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error Details:" -ForegroundColor Red
    Write-Host "  Type: $($_.Exception.GetType().Name)" -ForegroundColor Red
    Write-Host "  Message: $($_.Exception.Message)" -ForegroundColor Red

    if ($_.Exception.InnerException) {
        Write-Host "  Inner Error: $($_.Exception.InnerException.Message)" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "Possible Causes:" -ForegroundColor Yellow
    Write-Host "  1. [X] Username or password is incorrect" -ForegroundColor Yellow
    Write-Host "  2. [X] Account requires App Password (even without 2FA)" -ForegroundColor Yellow
    Write-Host "  3. [X] SMTP access is disabled for this account" -ForegroundColor Yellow
    Write-Host "  4. [X] Account is locked or restricted" -ForegroundColor Yellow
    Write-Host "  5. [X] Server requires different authentication method" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Recommendations:" -ForegroundColor Cyan
    Write-Host "  1. Verify credentials by logging into mail.privateemail.com web interface" -ForegroundColor Cyan
    Write-Host "  2. Check account SMTP settings in email provider dashboard" -ForegroundColor Cyan
    Write-Host "  3. Generate App Password if available (even without 2FA)" -ForegroundColor Cyan
    Write-Host "  4. Contact mail.privateemail.com support for SMTP access" -ForegroundColor Cyan
    Write-Host ""

    exit 1
}
