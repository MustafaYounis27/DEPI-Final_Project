using ClinicManagmentAPIs.DTOs.Specialty;
namespace ClinicManagmentAPIs.Services;
public interface ISpecialtyService
{
    Task<IReadOnlyList<SpecialtyResponse>> ListAsync();
    Task<SpecialtyResponse?> GetAsync(int id);
    Task<SpecialtyResponse> CreateAsync(CreateSpecialtyRequest request);
    Task<SpecialtyResponse?> UpdateAsync(int id, UpdateSpecialtyRequest request);
    Task<bool> DeleteAsync(int id);
}
