using ClinicManagmentAPIs.Auth;
using ClinicManagmentAPIs.Common;
using ClinicManagmentAPIs.Data;
using ClinicManagmentAPIs.DTOs.Vitals;
using ClinicManagmentAPIs.Model;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagmentAPIs.Services;

public class VitalsService : IVitalsService
{
    private readonly DBContext _db;
    private readonly ICurrentUser _user;
    private readonly IAuditLogger _audit;
    public VitalsService(DBContext db, ICurrentUser user, IAuditLogger audit) { _db = db; _user = user; _audit = audit; }

    public async Task<IReadOnlyList<VitalsResponse>> ListForAppointmentAsync(int appointmentId) =>
        await _db.Vitals.Where(v => v.appointment_id_FK == appointmentId)
            .OrderBy(v => v.recorded_at)
            .Select(v => Map(v)).ToListAsync();

    public async Task<VitalsResponse> CreateAsync(int appointmentId, CreateVitalsRequest req)
    {
        var appt = await _db.Appointments.FirstOrDefaultAsync(a => a.appointment_id == appointmentId)
            ?? throw new InvalidOperationException("Appointment not found.");
        if (_user.IsDoctor && appt.doctor_id_FK != _user.DoctorId)
            throw new UnauthorizedAccessException("Not your appointment.");

        var v = new Vitals
        {
            appointment_id_FK = appointmentId,
            patient_id_FK = appt.patient_id_FK,
            recorded_by_user_id_FK = _user.UserId,
            blood_pressure = req.blood_pressure,
            heart_rate = req.heart_rate,
            temperature = req.temperature,
            weight_kg = req.weight_kg,
            height_cm = req.height_cm,
            recorded_at = req.recorded_at
        };
        _db.Vitals.Add(v);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Insert, "Vitals", v.vitals_id);
        return Map(v);
    }

    public async Task<VitalsResponse?> UpdateAsync(int id, UpdateVitalsRequest req)
    {
        var v = await _db.Vitals.Include(x => x.Appointment).FirstOrDefaultAsync(x => x.vitals_id == id);
        if (v is null) return null;
        if (_user.IsDoctor && v.Appointment.doctor_id_FK != _user.DoctorId)
            throw new UnauthorizedAccessException("Not your appointment.");

        v.blood_pressure = req.blood_pressure;
        v.heart_rate = req.heart_rate;
        v.temperature = req.temperature;
        v.weight_kg = req.weight_kg;
        v.height_cm = req.height_cm;
        v.recorded_at = req.recorded_at;
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Update, "Vitals", v.vitals_id);
        return Map(v);
    }

    private static VitalsResponse Map(Vitals v) => new()
    {
        vitals_id = v.vitals_id,
        appointment_id = v.appointment_id_FK,
        patient_id = v.patient_id_FK,
        recorded_by_user_id = v.recorded_by_user_id_FK,
        blood_pressure = v.blood_pressure,
        heart_rate = v.heart_rate,
        temperature = v.temperature,
        weight_kg = v.weight_kg,
        height_cm = v.height_cm,
        recorded_at = v.recorded_at
    };
}
