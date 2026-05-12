using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ClinicManagmentAPIs.Model;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ClinicManagmentAPIs.Auth;

public class JwtTokenService : IJwtTokenService
{
    private readonly JwtSettings _settings;

    public JwtTokenService(IOptions<JwtSettings> options) => _settings = options.Value;

    public IssuedToken Issue(UserAccount user)
    {
        var expires = DateTime.UtcNow.AddHours(_settings.ExpiryHours);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.user_id.ToString()),
            new(ClaimTypes.NameIdentifier, user.user_id.ToString()),
            new(ClaimTypes.Name, user.username ?? string.Empty),
            new(ClaimTypes.Role, user.employee_type.ToString())
        };
        if (user.doctor_id_FK is int docId)
            claims.Add(new Claim("doctor_id", docId.ToString()));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            expires: expires,
            signingCredentials: creds);

        var jwt = new JwtSecurityTokenHandler().WriteToken(token);
        return new IssuedToken(jwt, expires);
    }
}
