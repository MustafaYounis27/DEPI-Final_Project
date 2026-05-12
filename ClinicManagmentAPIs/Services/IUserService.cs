using ClinicManagmentAPIs.DTOs.User;

namespace ClinicManagmentAPIs.Services;

public interface IUserService
{
    Task<UserResponse> CreateAsync(CreateUserRequest request);
    Task<UserResponse?> GetAsync(int id);
    Task<IReadOnlyList<UserResponse>> ListAsync();
    Task<UserResponse?> SetActiveAsync(int id, bool active);
    Task<bool> ResetPasswordAsync(int id, string newPassword);
}
