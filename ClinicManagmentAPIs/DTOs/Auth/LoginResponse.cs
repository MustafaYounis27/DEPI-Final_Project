using ClinicManagmentAPIs.Common;

namespace ClinicManagmentAPIs.DTOs.Auth;

public class LoginResponse
{
    public string access_token { get; set; } = string.Empty;
    public DateTime expires_at { get; set; }
    public UserSummary user { get; set; } = null!;
}

public class UserSummary
{
    public int user_id { get; set; }
    public string username { get; set; } = string.Empty;
    public EmployeeType employee_type { get; set; }
    public int? doctor_id { get; set; }
}
