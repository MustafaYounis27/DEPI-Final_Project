using ClinicManagmentAPIs.Common;
using ClinicManagmentAPIs.Data;
using ClinicManagmentAPIs.DTOs.Doctor;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagmentAPIs.Services;

public class DoctorService : IDoctorService
{
    private readonly DBContext _db;
    private readonly IAuditLogger _audit;
    public DoctorService(DBContext db, IAuditLogger audit) { _db = db; _audit = audit; }

    public async Task<IReadOnlyList<DoctorResponse>> ListAsync(int? specialtyId, bool? active)
    {
        var q = _db.Doctors.Include(d => d.Specialty).AsQueryable();
        if (specialtyId is int s) q = q.Where(d => d.specialty_id_FK == s);
        if (active is bool a) q = q.Where(d => d.active_flag == a);
        return await q.OrderBy(d => d.last_name)
            .Select(d => Map(d))
            .ToListAsync();
    }

    public async Task<DoctorResponse?> GetAsync(int id)
    {
        var d = await _db.Doctors.Include(x => x.Specialty).FirstOrDefaultAsync(x => x.doctor_id == id);
        return d is null ? null : Map(d);
    }

    public async Task<DoctorResponse?> UpdateAsync(int id, UpdateDoctorRequest req)
    {
        var d = await _db.Doctors.Include(x => x.Specialty).FirstOrDefaultAsync(x => x.doctor_id == id);
        if (d is null) return null;
        if (!await _db.Specialties.AnyAsync(s => s.specialty_id == req.specialty_id))
            throw new InvalidOperationException("Specialty not found.");

        d.first_name = req.first_name;
        d.last_name = req.last_name;
        d.specialty_id_FK = req.specialty_id;
        d.phone = req.phone;
        d.email = req.email;
        d.active_flag = req.active_flag;

        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Update, "Doctor", d.doctor_id);

        d = await _db.Doctors.Include(x => x.Specialty).FirstAsync(x => x.doctor_id == id);
        return Map(d);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var d = await _db.Doctors.FirstOrDefaultAsync(x => x.doctor_id == id);
        if (d is null) return false;
        if (await _db.Appointments.AnyAsync(a => a.doctor_id_FK == id))
            throw new InvalidOperationException("Doctor has appointments; cannot delete.");

        await using var tx = await _db.Database.BeginTransactionAsync();

        // Also disable the linked UserAccount, if any
        var linkedUser = await _db.Users.FirstOrDefaultAsync(u => u.doctor_id_FK == id);
        if (linkedUser is not null) linkedUser.active_flag = false;

        _db.Doctors.Remove(d);
        await _db.SaveChangesAsync();
        await tx.CommitAsync();
        await _audit.LogAsync(AuditAction.Delete, "Doctor", id);
        return true;
    }

    private static DoctorResponse Map(ClinicManagmentAPIs.Model.Doctor d) => new()
    {
        doctor_id = d.doctor_id,
        first_name = d.first_name,
        last_name = d.last_name,
        specialty_id = d.specialty_id_FK,
        specialty_name = d.Specialty?.name ?? string.Empty,
        phone = d.phone,
        email = d.email,
        active_flag = d.active_flag
    };
}
