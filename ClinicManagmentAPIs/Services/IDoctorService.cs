using ClinicManagmentAPIs.DTOs.Doctor;
namespace ClinicManagmentAPIs.Services;
public interface IDoctorService
{
    Task<IReadOnlyList<DoctorResponse>> ListAsync(int? specialtyId, bool? active);
    Task<DoctorResponse?> GetAsync(int id);
    Task<DoctorResponse?> UpdateAsync(int id, UpdateDoctorRequest request);
    Task<bool> DeleteAsync(int id);
}
