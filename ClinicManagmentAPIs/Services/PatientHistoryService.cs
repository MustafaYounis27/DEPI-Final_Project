using ClinicManagmentAPIs.Auth;
using ClinicManagmentAPIs.Common;
using ClinicManagmentAPIs.Data;
using ClinicManagmentAPIs.DTOs.PatientHistory;
using ClinicManagmentAPIs.Model;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagmentAPIs.Services;

public class PatientHistoryService : IPatientHistoryService
{
    private readonly DBContext _db;
    private readonly ICurrentUser _user;
    private readonly IAuditLogger _audit;
    public PatientHistoryService(DBContext db, ICurrentUser user, IAuditLogger audit) { _db = db; _user = user; _audit = audit; }

    public async Task<IReadOnlyList<PatientHistoryResponse>> ListForPatientAsync(int patientId) =>
        await _db.PatientHistories
            .Include(h => h.Doctor)
            .Where(h => h.patient_id_FK == patientId)
            .OrderByDescending(h => h.created_at)
            .Select(h => Map(h))
            .ToListAsync();

    public async Task<PatientHistoryResponse?> GetAsync(int id)
    {
        var h = await _db.PatientHistories.Include(x => x.Doctor).FirstOrDefaultAsync(x => x.history_id == id);
        return h is null ? null : Map(h);
    }

    public async Task<PatientHistoryResponse> CreateAsync(int patientId, CreatePatientHistoryRequest req)
    {
        var appt = await _db.Appointments.FirstOrDefaultAsync(a => a.appointment_id == req.appointment_id)
            ?? throw new InvalidOperationException("Appointment not found.");
        if (appt.patient_id_FK != patientId)
            throw new InvalidOperationException("Appointment does not belong to this patient.");
        if (_user.IsDoctor && appt.doctor_id_FK != _user.DoctorId)
            throw new UnauthorizedAccessException("You can only add history for your own appointments.");

        var h = new PatientHistory
        {
            patient_id_FK = patientId,
            doctor_id_FK = appt.doctor_id_FK,         // taken from appointment, NOT request — prevents impersonation
            appointment_id_FK = appt.appointment_id,
            diagnosis = req.diagnosis,
            notes = req.notes,
            prescription = req.prescription,
            created_at = DateTime.UtcNow
        };
        _db.PatientHistories.Add(h);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Insert, "PatientHistory", h.history_id);

        h = await _db.PatientHistories.Include(x => x.Doctor).FirstAsync(x => x.history_id == h.history_id);
        return Map(h);
    }

    public async Task<PatientHistoryResponse?> UpdateAsync(int id, UpdatePatientHistoryRequest req)
    {
        var h = await _db.PatientHistories.Include(x => x.Doctor).FirstOrDefaultAsync(x => x.history_id == id);
        if (h is null) return null;
        if (_user.IsDoctor && h.doctor_id_FK != _user.DoctorId)
            throw new UnauthorizedAccessException("Not your history entry.");

        h.diagnosis = req.diagnosis;
        h.notes = req.notes;
        h.prescription = req.prescription;
        h.updated_at = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Update, "PatientHistory", h.history_id);
        return Map(h);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var h = await _db.PatientHistories.FirstOrDefaultAsync(x => x.history_id == id);
        if (h is null) return false;
        _db.PatientHistories.Remove(h);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Delete, "PatientHistory", id);
        return true;
    }

    private static PatientHistoryResponse Map(PatientHistory h) => new()
    {
        history_id = h.history_id,
        patient_id = h.patient_id_FK,
        doctor_id = h.doctor_id_FK,
        doctor_name = h.Doctor is null ? string.Empty : $"{h.Doctor.first_name} {h.Doctor.last_name}",
        appointment_id = h.appointment_id_FK,
        diagnosis = h.diagnosis,
        notes = h.notes,
        prescription = h.prescription,
        created_at = h.created_at,
        updated_at = h.updated_at
    };
}
