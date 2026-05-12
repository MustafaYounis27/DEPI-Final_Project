using ClinicManagmentAPIs.DTOs.Vitals;
namespace ClinicManagmentAPIs.Services;
public interface IVitalsService
{
    Task<IReadOnlyList<VitalsResponse>> ListForAppointmentAsync(int appointmentId);
    Task<VitalsResponse> CreateAsync(int appointmentId, CreateVitalsRequest request);
    Task<VitalsResponse?> UpdateAsync(int id, UpdateVitalsRequest request);
}
