using ClinicManagmentAPIs.Data;
using ClinicManagmentAPIs.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagmentAPIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientController : ControllerBase
    {
        private readonly DBContext _context;

        public PatientController(DBContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPatients()
        {
            var patients = await _context.Patients
                .OrderByDescending(p => p.created_at)
                .ToListAsync();

            return Ok(patients);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPatientById(int id)
        {
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.patient_id == id);
            if (patient == null)
            {
                return NotFound(new { message = "Patient not found" });
            }

            return Ok(patient);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePatient([FromBody] Patient patient)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPatientById), new { id = patient.patient_id }, patient);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePatient(int id, [FromBody] Patient updatedPatient)
        {
            if (id != updatedPatient.patient_id)
            {
                return BadRequest(new { message = "Route id and patient_id do not match" });
            }

            var existingPatient = await _context.Patients.FirstOrDefaultAsync(p => p.patient_id == id);
            if (existingPatient == null)
            {
                return NotFound(new { message = "Patient not found" });
            }

            existingPatient.mrn = updatedPatient.mrn;
            existingPatient.first_name = updatedPatient.first_name;
            existingPatient.last_name = updatedPatient.last_name;
            existingPatient.date_of_birth = updatedPatient.date_of_birth;
            existingPatient.sex = updatedPatient.sex;
            existingPatient.phone = updatedPatient.phone;
            existingPatient.email = updatedPatient.email;
            existingPatient.address = updatedPatient.address;

            await _context.SaveChangesAsync();

            return Ok(existingPatient);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.patient_id == id);
            if (patient == null)
            {
                return NotFound(new { message = "Patient not found" });
            }

            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Patient deleted successfully" });
        }
    }
}
