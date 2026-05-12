using ClinicManagmentAPIs.Common;
using ClinicManagmentAPIs.Data;
using ClinicManagmentAPIs.DTOs.Specialty;
using ClinicManagmentAPIs.Model;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagmentAPIs.Services;

public class SpecialtyService : ISpecialtyService
{
    private readonly DBContext _db;
    private readonly IAuditLogger _audit;
    public SpecialtyService(DBContext db, IAuditLogger audit) { _db = db; _audit = audit; }

    public async Task<IReadOnlyList<SpecialtyResponse>> ListAsync() =>
        await _db.Specialties.OrderBy(s => s.name)
            .Select(s => new SpecialtyResponse { specialty_id = s.specialty_id, name = s.name, description = s.description })
            .ToListAsync();

    public async Task<SpecialtyResponse?> GetAsync(int id)
    {
        var s = await _db.Specialties.FirstOrDefaultAsync(x => x.specialty_id == id);
        return s is null ? null : new SpecialtyResponse { specialty_id = s.specialty_id, name = s.name, description = s.description };
    }

    public async Task<SpecialtyResponse> CreateAsync(CreateSpecialtyRequest req)
    {
        if (await _db.Specialties.AnyAsync(s => s.name == req.name))
            throw new InvalidOperationException("Specialty name already exists.");
        var s = new Specialty { name = req.name, description = req.description };
        _db.Specialties.Add(s);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Insert, "Specialty", s.specialty_id);
        return new SpecialtyResponse { specialty_id = s.specialty_id, name = s.name, description = s.description };
    }

    public async Task<SpecialtyResponse?> UpdateAsync(int id, UpdateSpecialtyRequest req)
    {
        var s = await _db.Specialties.FirstOrDefaultAsync(x => x.specialty_id == id);
        if (s is null) return null;
        if (await _db.Specialties.AnyAsync(x => x.name == req.name && x.specialty_id != id))
            throw new InvalidOperationException("Specialty name already exists.");
        s.name = req.name;
        s.description = req.description;
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Update, "Specialty", s.specialty_id);
        return new SpecialtyResponse { specialty_id = s.specialty_id, name = s.name, description = s.description };
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var s = await _db.Specialties.FirstOrDefaultAsync(x => x.specialty_id == id);
        if (s is null) return false;
        if (await _db.Doctors.AnyAsync(d => d.specialty_id_FK == id))
            throw new InvalidOperationException("Specialty has doctors assigned; cannot delete.");
        _db.Specialties.Remove(s);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Delete, "Specialty", id);
        return true;
    }
}
