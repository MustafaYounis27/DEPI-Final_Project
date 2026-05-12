using ClinicManagmentAPIs.Model;

namespace ClinicManagmentAPIs.Auth;

public interface IJwtTokenService
{
    IssuedToken Issue(UserAccount user);
}
