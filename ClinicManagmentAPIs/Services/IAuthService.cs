using ClinicManagmentAPIs.DTOs.Auth;

namespace ClinicManagmentAPIs.Services;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
}
