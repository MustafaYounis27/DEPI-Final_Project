using ClinicManagmentAPIs.Common;
using ClinicManagmentAPIs.Data;
using ClinicManagmentAPIs.DTOs.Common;
using ClinicManagmentAPIs.DTOs.Patient;
using ClinicManagmentAPIs.Model;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagmentAPIs.Services;

public class PatientService : IPatientService
{
    private readonly DBContext _db;
    private readonly IAuditLogger _audit;
    public PatientService(DBContext db, IAuditLogger audit) { _db = db; _audit = audit; }

    public async Task<PagedResponse<PatientResponse>> ListAsync(string? search, int page, int pageSize)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var q = _db.Patients.AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            q = q.Where(p => p.first_name.Contains(s) || p.last_name.Contains(s) || p.mrn.Contains(s));
        }
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(p => p.created_at)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(p => Map(p)).ToListAsync();
        return new PagedResponse<PatientResponse>
        {
            items = items, total = total, page = page, pageSize = pageSize
        };
    }

    public async Task<PatientResponse?> GetAsync(int id)
    {
        var p = await _db.Patients.FirstOrDefaultAsync(x => x.patient_id == id);
        return p is null ? null : Map(p);
    }

    public async Task<PatientResponse> CreateAsync(CreatePatientRequest req)
    {
        var mrn = string.IsNullOrWhiteSpace(req.mrn) ? await NextMrnAsync() : req.mrn;
        if (await _db.Patients.AnyAsync(p => p.mrn == mrn))
            throw new InvalidOperationException("MRN already exists.");

        var p = new Patient
        {
            mrn = mrn,
            first_name = req.first_name,
            last_name = req.last_name,
            date_of_birth = req.date_of_birth,
            sex = req.sex,
            phone = req.phone,
            email = req.email,
            address = req.address,
            created_at = DateTime.UtcNow
        };
        _db.Patients.Add(p);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Insert, "Patient", p.patient_id);
        return Map(p);
    }

    public async Task<PatientResponse?> UpdateAsync(int id, UpdatePatientRequest req)
    {
        var p = await _db.Patients.FirstOrDefaultAsync(x => x.patient_id == id);
        if (p is null) return null;

        if (p.mrn != req.mrn && await _db.Patients.AnyAsync(x => x.mrn == req.mrn))
            throw new InvalidOperationException("MRN already exists.");

        p.mrn = req.mrn;
        p.first_name = req.first_name;
        p.last_name = req.last_name;
        p.date_of_birth = req.date_of_birth;
        p.sex = req.sex;
        p.phone = req.phone;
        p.email = req.email;
        p.address = req.address;

        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Update, "Patient", p.patient_id);
        return Map(p);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var p = await _db.Patients.FirstOrDefaultAsync(x => x.patient_id == id);
        if (p is null) return false;

        if (await _db.Appointments.AnyAsync(a => a.patient_id_FK == id) ||
            await _db.Invoices.AnyAsync(i => i.patient_id_FK == id) ||
            await _db.PatientHistories.AnyAsync(h => h.patient_id_FK == id))
            throw new InvalidOperationException("Patient has related records; cannot delete.");

        _db.Patients.Remove(p);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Delete, "Patient", id);
        return true;
    }

    private async Task<string> NextMrnAsync()
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"MRN-{year}-";
        var lastSeq = await _db.Patients
            .Where(p => p.mrn.StartsWith(prefix))
            .Select(p => p.mrn)
            .ToListAsync();
        var n = lastSeq
            .Select(m => int.TryParse(m[prefix.Length..], out var v) ? v : 0)
            .DefaultIfEmpty(0).Max() + 1;
        return $"{prefix}{n:D5}";
    }

    private static PatientResponse Map(Patient p) => new()
    {
        patient_id = p.patient_id,
        mrn = p.mrn,
        first_name = p.first_name,
        last_name = p.last_name,
        date_of_birth = p.date_of_birth,
        sex = p.sex,
        phone = p.phone,
        email = p.email,
        address = p.address,
        created_at = p.created_at
    };
}
