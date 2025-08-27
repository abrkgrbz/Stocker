using System;
using Stocker.Domain.Master.ValueObjects;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Identity.Services;
using Microsoft.Extensions.Logging.Abstractions;

namespace TestRegisterLogin;

public class Program
{
    public static void Main(string[] args)
    {
        string testPassword = "Test123456!";
        string testEmail = "test@example.com";
        string testUsername = "testuser";
        
        Console.WriteLine("REGISTER ve LOGIN Hash Uyumsuzluk Testi");
        Console.WriteLine("========================================\n");
        
        // 1. REGISTER - MasterUser.Create() kullanarak kayıt simüle et
        Console.WriteLine("1. REGISTER Simülasyonu (MasterUser.Create):");
        Console.WriteLine("----------------------------------------------");
        
        var email = Email.Create(testEmail).Value;
        var masterUser = MasterUser.Create(
            username: testUsername,
            email: email,
            plainPassword: testPassword,  // Plain password veriyoruz
            firstName: "Test",
            lastName: "User",
            userType: Stocker.Domain.Master.Enums.UserType.TenantOwner,
            phoneNumber: null
        );
        
        Console.WriteLine($"Kayıt - Password: {testPassword}");
        Console.WriteLine($"Kayıt - Salt: {masterUser.Password.Salt}");
        Console.WriteLine($"Kayıt - Hash: {masterUser.Password.Hash}");
        
        // 2. LOGIN - PasswordService.VerifyPassword() kullanarak login simüle et
        Console.WriteLine("\n2. LOGIN Simülasyonu (PasswordService.VerifyPassword):");
        Console.WriteLine("--------------------------------------------------------");
        
        var passwordService = new PasswordService(
            new PasswordHasher(), 
            null, // Validation'ı bypass et
            NullLogger<PasswordService>.Instance
        );
        
        // Login sırasında aynı password ile verify et
        bool loginSuccess = passwordService.VerifyPassword(masterUser.Password, testPassword);
        
        Console.WriteLine($"Login - Password: {testPassword}");
        Console.WriteLine($"Login - Kullanılan Salt: {masterUser.Password.Salt}");
        Console.WriteLine($"Login - Verification: {(loginSuccess ? "✓ BAŞARILI" : "✗ BAŞARISIZ")}");
        
        // 3. Domain kendi hash'ini verify edebiliyor mu?
        Console.WriteLine("\n3. Domain Self-Verification:");
        Console.WriteLine("-----------------------------");
        bool domainVerify = masterUser.Password.Verify(testPassword);
        Console.WriteLine($"Domain kendi hash'ini verify: {(domainVerify ? "✓ BAŞARILI" : "✗ BAŞARISIZ")}");
        
        // 4. Detaylı analiz
        Console.WriteLine("\n4. DETAYLI ANALİZ:");
        Console.WriteLine("------------------");
        
        // PasswordService ile aynı salt'la hash üret
        var testHash = passwordService.CreateHashedPassword(testPassword);
        Console.WriteLine($"PasswordService yeni hash: {testHash.Hash.Substring(0, 20)}...");
        Console.WriteLine($"PasswordService yeni salt: {testHash.Salt.Substring(0, 20)}...");
        
        // Aynı salt ile hash üretmeyi test et
        var fixedSaltHash = HashedPassword.FromHash(masterUser.Password.Hash, masterUser.Password.Salt);
        bool fixedSaltVerify = passwordService.VerifyPassword(fixedSaltHash, testPassword);
        Console.WriteLine($"Sabit salt ile verify: {(fixedSaltVerify ? "✓ BAŞARILI" : "✗ BAŞARISIZ")}");
        
        Console.WriteLine("\n5. SONUÇ:");
        Console.WriteLine("----------");
        if (loginSuccess && domainVerify)
        {
            Console.WriteLine("✓ Register ve Login HASHLERİ UYUMLU!");
            Console.WriteLine("  Sorun bu kullanıcıda değil, production'daki mevcut kullanıcıda.");
        }
        else
        {
            Console.WriteLine("✗ Register ve Login HASHLERİ UYUMSUZ!");
            Console.WriteLine("  Gerçek bir uyumsuzluk var, kodu düzeltmemiz gerekiyor.");
        }
    }
}