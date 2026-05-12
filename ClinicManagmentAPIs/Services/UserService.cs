using ClinicManagmentAPIs.Auth;
using ClinicManagmentAPIs.Common;
using ClinicManagmentAPIs.Data;
using ClinicManagmentAPIs.DTOs.User;
using ClinicManagmentAPIs.Model;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagmentAPIs.Services;

public class UserService : IUserService
{
    private readonly DBContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly IAuditLogger _audit;

    public UserService(DBContext db, IPasswordHasher hasher, IAuditLogger audit)
    {
        _db = db;
        _hasher = hasher;
        _audit = audit;
    }

    public async Task<UserResponse> CreateAsync(CreateUserRequest req)
    {
        if (await _db.Users.AnyAsync(u => u.username == req.username))
            throw new InvalidOperationException("Username already taken.");

        if (req.employee_type == EmployeeType.Doctor && req.doctor is null)
            throw new InvalidOperationException("Doctor details required for Doctor employee_type.");
        if (req.employee_type != EmployeeType.Doctor && req.doctor is not null)
            throw new InvalidOperationException("Doctor details only allowed for Doctor employee_type.");

        await using var tx = await _db.Database.BeginTransactionAsync();

        int? doctorId = null;
        if (req.employee_type == EmployeeType.Doctor)
        {
            var specialty = await _db.Specialties.FirstOrDefaultAsync(s => s.specialty_id == req.doctor!.specialty_id)
                ?? throw new InvalidOperationException("Specialty not found.");

            var doctor = new Doctor
            {
                first_name = req.doctor!.first_name,
                last_name = req.doctor.last_name,
                specialty_id_FK = specialty.specialty_id,
                phone = req.doctor.phone,
                email = req.doctor.email,
                active_flag = true
            };
            _db.Doctors.Add(doctor);
            await _db.SaveChangesAsync();
            doctorId = doctor.doctor_id;
        }

        var user = new UserAccount
        {
            username = req.username,
            password_hash = _hasher.Hash(req.password),
            employee_type = req.employee_type,
            doctor_id_FK = doctorId,
            email = req.email,
            active_flag = true,
            created_at = DateTime.UtcNow
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        await _audit.LogAsync(AuditAction.Insert, "UserAccount", user.user_id);

        return ToResponse(user);
    }

    public async Task<UserResponse?> GetAsync(int id)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.user_id == id);
        return user is null ? null : ToResponse(user);
    }

    public async Task<IReadOnlyList<UserResponse>> ListAsync()
    {
        var users = await _db.Users.OrderBy(u => u.user_id).ToListAsync();
        return users.Select(ToResponse).ToList();
    }

    public async Task<UserResponse?> SetActiveAsync(int id, bool active)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.user_id == id);
        if (user is null) return null;
        user.active_flag = active;
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Update, "UserAccount", user.user_id, $"active_flag={active}");
        return ToResponse(user);
    }

    public async Task<bool> ResetPasswordAsync(int id, string newPassword)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.user_id == id);
        if (user is null) return false;
        user.password_hash = _hasher.Hash(newPassword);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Update, "UserAccount", user.user_id, "password_reset");
        return true;
    }

    private static UserResponse ToResponse(UserAccount u) => new()
    {
        user_id = u.user_id,
        username = u.username,
        employee_type = u.employee_type,
        doctor_id = u.doctor_id_FK,
        email = u.email,
        active_flag = u.active_flag,
        created_at = u.created_at
    };
}
