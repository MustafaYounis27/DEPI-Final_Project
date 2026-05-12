using ClinicManagmentAPIs.Common;

namespace ClinicManagmentAPIs.Auth;

public interface ICurrentUser
{
    int UserId { get; }
    EmployeeType EmployeeType { get; }
    int? DoctorId { get; }
    bool IsAdmin { get; }
    bool IsDoctor { get; }
    bool IsStaff { get; }
    bool IsAuthenticated { get; }
}
