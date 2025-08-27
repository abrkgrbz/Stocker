using System;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace FindIterationCount;

public class Program
{
    private const int KeySize = 256 / 8;
    
    public static void Main(string[] args)
    {
        // Production'daki veriler
        string salt = "4RugQ2UE1Kg86hqjq12mpA==";
        string targetHash = "dPdNogwAbRRePAoQLbXSCM8z/pjt1qZ9h5SJMNrYplc=";
        string password = "Test123456!";
        
        Console.WriteLine("Production Hash'in hangi iteration count ile üretildiğini arıyoruz...");
        Console.WriteLine($"Target Hash: {targetHash}");
        Console.WriteLine($"Salt: {salt}");
        Console.WriteLine($"Password: {password}");
        Console.WriteLine(new string('=', 70));
        
        byte[] saltBytes = Convert.FromBase64String(salt);
        
        // Farklı iteration değerlerini test et
        int[] iterations = new int[] {
            1, 10, 100, 1000, 10000, 100000, 200000, 210000, 260000, 300000, 310000,
            400000, 500000, 600000, 700000, 800000, 900000, 1000000,
            // ASP.NET Identity default değerleri
            10000,  // Old default
            100000, // Current default  
            600000  // OWASP 2023 recommendation
        };
        
        bool found = false;
        foreach (int iter in iterations)
        {
            byte[] hash = KeyDerivation.Pbkdf2(
                password: password,
                salt: saltBytes,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: iter,
                numBytesRequested: KeySize);
            
            string hashBase64 = Convert.ToBase64String(hash);
            
            if (hashBase64 == targetHash)
            {
                Console.WriteLine($"\n✓ BULUNDU! Iteration count: {iter}");
                Console.WriteLine($"  Hash eşleşti: {hashBase64}");
                found = true;
                break;
            }
            else if (iter % 100000 == 0 || iter < 10000)
            {
                Console.WriteLine($"{iter,8} iterations: {hashBase64.Substring(0, 10)}... ✗");
            }
        }
        
        if (!found)
        {
            Console.WriteLine("\n✗ Bu hash Test123456! şifresi ile üretilmemiş!");
            Console.WriteLine("\nOlası sebepler:");
            Console.WriteLine("1. Farklı bir şifre kullanılmış");
            Console.WriteLine("2. Farklı bir hash algoritması kullanılmış (SHA1, SHA512 vs)");
            Console.WriteLine("3. BCrypt veya Argon2 gibi farklı bir kütüphane kullanılmış");
            
            // BCrypt ile dene
            Console.WriteLine("\nBCrypt ile test ediliyor...");
            TestBCrypt(password, targetHash);
        }
    }
    
    static void TestBCrypt(string password, string targetHash)
    {
        try
        {
            // BCrypt hash formatı farklı olduğu için direct karşılaştırma yapamayız
            // Ama en azından BCrypt hash'i gibi görünüyor mu kontrol edebiliriz
            if (targetHash.StartsWith("$2"))
            {
                bool bcryptValid = BCrypt.Net.BCrypt.Verify(password, targetHash);
                Console.WriteLine($"BCrypt verification: {(bcryptValid ? "✓ MATCH" : "✗ NO MATCH")}");
            }
            else
            {
                Console.WriteLine("Bu hash BCrypt formatında değil.");
                
                // Belki de şifre encoding sorunu vardır
                Console.WriteLine("\nFarklı encoding'ler deneniyor...");
                TestDifferentEncodings(password, targetHash, "4RugQ2UE1Kg86hqjq12mpA==");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"BCrypt test failed: {ex.Message}");
        }
    }
    
    static void TestDifferentEncodings(string password, string targetHash, string salt)
    {
        byte[] saltBytes = Convert.FromBase64String(salt);
        var encodings = new[] {
            System.Text.Encoding.UTF8,
            System.Text.Encoding.ASCII,
            System.Text.Encoding.Unicode,
            System.Text.Encoding.UTF32,
            System.Text.Encoding.GetEncoding("ISO-8859-9"), // Turkish
            System.Text.Encoding.GetEncoding("Windows-1254") // Turkish Windows
        };
        
        foreach (var encoding in encodings)
        {
            try
            {
                byte[] passwordBytes = encoding.GetBytes(password);
                
                // 600000 iterations ile test et
                var pbkdf2 = new Rfc2898DeriveBytes(passwordBytes, saltBytes, 600000, HashAlgorithmName.SHA256);
                byte[] hash = pbkdf2.GetBytes(32);
                string hashBase64 = Convert.ToBase64String(hash);
                
                if (hashBase64 == targetHash)
                {
                    Console.WriteLine($"✓ BULUNDU! Encoding: {encoding.EncodingName}");
                    return;
                }
                else
                {
                    Console.WriteLine($"{encoding.EncodingName}: {hashBase64.Substring(0, 10)}... ✗");
                }
            }
            catch { }
        }
    }
}