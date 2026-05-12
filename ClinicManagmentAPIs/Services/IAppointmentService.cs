using ClinicManagmentAPIs.Common;
using ClinicManagmentAPIs.DTOs.Appointment;
using ClinicManagmentAPIs.DTOs.Common;

namespace ClinicManagmentAPIs.Services;

public interface IAppointmentService
{
    Task<PagedResponse<AppointmentResponse>> ListAsync(int? doctorId, int? patientId, DateTime? from, DateTime? to, AppointmentStatus? status, int page, int pageSize);
    Task<PagedResponse<AppointmentResponse>> ListMineAsync(DateTime? from, DateTime? to, AppointmentStatus? status, int page, int pageSize);
    Task<AppointmentResponse?> GetAsync(int id);
    Task<AppointmentResponse> CreateAsync(CreateAppointmentRequest request);
    Task<AppointmentResponse?> UpdateAsync(int id, UpdateAppointmentRequest request);
    Task<bool> DeleteAsync(int id);
}
