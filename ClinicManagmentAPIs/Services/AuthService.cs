using ClinicManagmentAPIs.Auth;
using ClinicManagmentAPIs.Data;
using ClinicManagmentAPIs.DTOs.Auth;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagmentAPIs.Services;

public class AuthService : IAuthService
{
    // Precomputed BCrypt hash that no real password should match. Used to equalize
    // timing between "user not found" and "wrong password" so an attacker can't
    // enumerate valid usernames by timing differences. Computed once at class load.
    private static readonly Lazy<string> DummyHash = new(() =>
        BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString("N")));

    private readonly DBContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _tokens;
    private readonly IAuditLogger _audit;

    public AuthService(DBContext db, IPasswordHasher hasher, IJwtTokenService tokens, IAuditLogger audit)
    {
        _db = db;
        _hasher = hasher;
        _tokens = tokens;
        _audit = audit;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.username == request.username);

        if (user is null)
        {
            // Run a throwaway verify so the unknown-user response takes the same time
            // as a real "wrong password" response.
            _hasher.Verify(request.password, DummyHash.Value);
            await _audit.LogLoginAsync(null, request.username, success: false);
            return null;
        }

        if (!user.active_flag || !_hasher.Verify(request.password, user.password_hash))
        {
            await _audit.LogLoginAsync(user.user_id, request.username, success: false);
            return null;
        }

        var issued = _tokens.Issue(user);
        await _audit.LogLoginAsync(user.user_id, request.username, success: true);

        return new LoginResponse
        {
            access_token = issued.AccessToken,
            expires_at = issued.ExpiresAt,
            user = new UserSummary
            {
                user_id = user.user_id,
                username = user.username,
                employee_type = user.employee_type,
                doctor_id = user.doctor_id_FK
            }
        };
    }
}
