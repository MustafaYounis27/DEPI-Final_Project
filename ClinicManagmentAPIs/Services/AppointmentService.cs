using ClinicManagmentAPIs.Auth;
using ClinicManagmentAPIs.Common;
using ClinicManagmentAPIs.Data;
using ClinicManagmentAPIs.DTOs.Appointment;
using ClinicManagmentAPIs.DTOs.Common;
using ClinicManagmentAPIs.Model;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagmentAPIs.Services;

public class AppointmentService : IAppointmentService
{
    private readonly DBContext _db;
    private readonly ICurrentUser _user;
    private readonly IAuditLogger _audit;

    public AppointmentService(DBContext db, ICurrentUser user, IAuditLogger audit)
    {
        _db = db;
        _user = user;
        _audit = audit;
    }

    public Task<PagedResponse<AppointmentResponse>> ListAsync(int? doctorId, int? patientId, DateTime? from, DateTime? to, AppointmentStatus? status, int page, int pageSize) =>
        QueryAsync(doctorId, patientId, from, to, status, page, pageSize);

    public Task<PagedResponse<AppointmentResponse>> ListMineAsync(DateTime? from, DateTime? to, AppointmentStatus? status, int page, int pageSize)
    {
        if (_user.DoctorId is not int docId)
            throw new InvalidOperationException("Caller is not a doctor.");

        // Default: today and future when no range supplied
        from ??= DateTime.UtcNow.Date;
        return QueryAsync(docId, null, from, to, status, page, pageSize);
    }

    private async Task<PagedResponse<AppointmentResponse>> QueryAsync(int? doctorId, int? patientId, DateTime? from, DateTime? to, AppointmentStatus? status, int page, int pageSize)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var q = _db.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .AsQueryable();

        if (doctorId is int d) q = q.Where(a => a.doctor_id_FK == d);
        if (patientId is int p) q = q.Where(a => a.patient_id_FK == p);
        if (from is DateTime f) q = q.Where(a => a.scheduled_at >= f);
        if (to is DateTime t) q = q.Where(a => a.scheduled_at <= t);
        if (status is AppointmentStatus s) q = q.Where(a => a.status == s);

        var total = await q.CountAsync();
        var items = await q.OrderBy(a => a.scheduled_at)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(a => Map(a))
            .ToListAsync();

        return new PagedResponse<AppointmentResponse>
        {
            items = items, total = total, page = page, pageSize = pageSize
        };
    }

    public async Task<AppointmentResponse?> GetAsync(int id)
    {
        var a = await _db.Appointments.Include(x => x.Patient).Include(x => x.Doctor)
            .FirstOrDefaultAsync(x => x.appointment_id == id);
        if (a is null) return null;
        // Doctor can only see own
        if (_user.IsDoctor && a.doctor_id_FK != _user.DoctorId) return null;
        return Map(a);
    }

    public async Task<AppointmentResponse> CreateAsync(CreateAppointmentRequest req)
    {
        if (!await _db.Patients.AnyAsync(p => p.patient_id == req.patient_id))
            throw new InvalidOperationException("Patient not found.");
        if (!await _db.Doctors.AnyAsync(d => d.doctor_id == req.doctor_id))
            throw new InvalidOperationException("Doctor not found.");
        if (await _db.Appointments.AnyAsync(x => x.doctor_id_FK == req.doctor_id && x.scheduled_at == req.scheduled_at))
            throw new InvalidOperationException("Doctor already has an appointment at that time.");

        var a = new Appointment
        {
            patient_id_FK = req.patient_id,
            doctor_id_FK = req.doctor_id,
            scheduled_at = req.scheduled_at,
            appointment_type = req.appointment_type,
            status = AppointmentStatus.Scheduled,
            reason = req.reason,
            created_by_user_id_FK = _user.UserId,
            created_at = DateTime.UtcNow
        };
        _db.Appointments.Add(a);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Insert, "Appointment", a.appointment_id);

        a = await _db.Appointments.Include(x => x.Patient).Include(x => x.Doctor).FirstAsync(x => x.appointment_id == a.appointment_id);
        return Map(a);
    }

    public async Task<AppointmentResponse?> UpdateAsync(int id, UpdateAppointmentRequest req)
    {
        var a = await _db.Appointments.Include(x => x.Patient).Include(x => x.Doctor).FirstOrDefaultAsync(x => x.appointment_id == id);
        if (a is null) return null;

        if (_user.IsDoctor)
        {
            if (a.doctor_id_FK != _user.DoctorId)
                throw new UnauthorizedAccessException("Not your appointment.");
            // Doctors may ONLY change status
            if (req.doctor_id is not null || req.scheduled_at is not null || req.appointment_type is not null || req.reason is not null)
                throw new UnauthorizedAccessException("Doctors can only update status.");
            if (req.status is AppointmentStatus s) a.status = s;
        }
        else // Staff or Admin
        {
            if (req.doctor_id is int newDoc)
            {
                if (!await _db.Doctors.AnyAsync(d => d.doctor_id == newDoc))
                    throw new InvalidOperationException("Doctor not found.");
                a.doctor_id_FK = newDoc;
            }
            if (req.scheduled_at is DateTime newWhen) a.scheduled_at = newWhen;
            if (req.appointment_type is AppointmentType t) a.appointment_type = t;
            if (req.status is AppointmentStatus s) a.status = s;
            if (req.reason is not null) a.reason = req.reason;
        }

        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Update, "Appointment", a.appointment_id);

        a = await _db.Appointments.Include(x => x.Patient).Include(x => x.Doctor).FirstAsync(x => x.appointment_id == id);
        return Map(a);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var a = await _db.Appointments.FirstOrDefaultAsync(x => x.appointment_id == id);
        if (a is null) return false;
        if (await _db.PatientHistories.AnyAsync(h => h.appointment_id_FK == id) ||
            await _db.Vitals.AnyAsync(v => v.appointment_id_FK == id) ||
            await _db.Invoices.AnyAsync(i => i.appointment_id_FK == id))
            throw new InvalidOperationException("Appointment has dependent records; cannot delete.");
        _db.Appointments.Remove(a);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Delete, "Appointment", id);
        return true;
    }

    private static AppointmentResponse Map(Appointment a) => new()
    {
        appointment_id = a.appointment_id,
        patient_id = a.patient_id_FK,
        patient_name = a.Patient is null ? string.Empty : $"{a.Patient.first_name} {a.Patient.last_name}",
        doctor_id = a.doctor_id_FK,
        doctor_name = a.Doctor is null ? string.Empty : $"{a.Doctor.first_name} {a.Doctor.last_name}",
        scheduled_at = a.scheduled_at,
        appointment_type = a.appointment_type,
        status = a.status,
        reason = a.reason,
        created_at = a.created_at
    };
}
