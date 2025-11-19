namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// HMAC (Hash-based Message Authentication Code) service for data integrity and authentication
/// </summary>
public interface IHmacService
{
    /// <summary>
    /// Generate HMAC signature for the given data
    /// </summary>
    /// <param name="data">Data to sign</param>
    /// <returns>Base64 encoded HMAC signature</returns>
    string GenerateSignature(string data);

    /// <summary>
    /// Verify HMAC signature
    /// </summary>
    /// <param name="data">Original data</param>
    /// <param name="signature">Signature to verify</param>
    /// <returns>True if signature is valid</returns>
    bool VerifySignature(string data, string signature);

    /// <summary>
    /// Generate timestamped signature (data + timestamp)
    /// </summary>
    /// <param name="data">Data to sign</param>
    /// <param name="timestamp">Unix timestamp in milliseconds</param>
    /// <returns>Base64 encoded HMAC signature</returns>
    string GenerateTimestampedSignature(string data, long timestamp);

    /// <summary>
    /// Verify timestamped signature with expiration check
    /// </summary>
    /// <param name="data">Original data</param>
    /// <param name="timestamp">Unix timestamp in milliseconds</param>
    /// <param name="signature">Signature to verify</param>
    /// <param name="validityMinutes">How long the signature is valid (default: 5 minutes)</param>
    /// <returns>True if signature is valid and not expired</returns>
    bool VerifyTimestampedSignature(string data, long timestamp, string signature, int validityMinutes = 5);
}
