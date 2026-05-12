using System.Security.Claims;
using ClinicManagmentAPIs.Common;

namespace ClinicManagmentAPIs.Auth;

public class CurrentUser : ICurrentUser
{
    private readonly ClaimsPrincipal _principal;

    public CurrentUser(IHttpContextAccessor accessor)
    {
        _principal = accessor.HttpContext?.User ?? new ClaimsPrincipal();
    }

    public bool IsAuthenticated => _principal.Identity?.IsAuthenticated == true;

    public int UserId => int.Parse(_principal.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new InvalidOperationException("No user_id claim on principal"));

    public EmployeeType EmployeeType => Enum.Parse<EmployeeType>(
        _principal.FindFirstValue(ClaimTypes.Role)
        ?? throw new InvalidOperationException("No role claim on principal"));

    public int? DoctorId
    {
        get
        {
            var raw = _principal.FindFirstValue("doctor_id");
            return string.IsNullOrEmpty(raw) ? null : int.Parse(raw);
        }
    }

    public bool IsAdmin  => EmployeeType == EmployeeType.Admin;
    public bool IsDoctor => EmployeeType == EmployeeType.Doctor;
    public bool IsStaff  => EmployeeType == EmployeeType.Staff;
}
