using ClinicManagmentAPIs.Common;

namespace ClinicManagmentAPIs.DTOs.User;

public class UserResponse
{
    public int user_id { get; set; }
    public string username { get; set; } = string.Empty;
    public EmployeeType employee_type { get; set; }
    public int? doctor_id { get; set; }
    public string? email { get; set; }
    public bool active_flag { get; set; }
    public DateTime created_at { get; set; }
}
