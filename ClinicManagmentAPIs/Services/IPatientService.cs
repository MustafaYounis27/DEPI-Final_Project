using ClinicManagmentAPIs.DTOs.Common;
using ClinicManagmentAPIs.DTOs.Patient;
namespace ClinicManagmentAPIs.Services;
public interface IPatientService
{
    Task<PagedResponse<PatientResponse>> ListAsync(string? search, int page, int pageSize);
    Task<PatientResponse?> GetAsync(int id);
    Task<PatientResponse> CreateAsync(CreatePatientRequest request);
    Task<PatientResponse?> UpdateAsync(int id, UpdatePatientRequest request);
    Task<bool> DeleteAsync(int id);
}
