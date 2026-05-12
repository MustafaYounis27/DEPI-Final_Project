using ClinicManagmentAPIs.DTOs.PatientHistory;
namespace ClinicManagmentAPIs.Services;
public interface IPatientHistoryService
{
    Task<IReadOnlyList<PatientHistoryResponse>> ListForPatientAsync(int patientId);
    Task<PatientHistoryResponse?> GetAsync(int id);
    Task<PatientHistoryResponse> CreateAsync(int patientId, CreatePatientHistoryRequest request);
    Task<PatientHistoryResponse?> UpdateAsync(int id, UpdatePatientHistoryRequest request);
    Task<bool> DeleteAsync(int id);
}
