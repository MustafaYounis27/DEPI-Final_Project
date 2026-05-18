using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HealthCore.Core.Entities;
using HealthCore.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthCore.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PrescriptionsController : ControllerBase
    {
        private readonly HealthCoreDbContext _context;

        public PrescriptionsController(HealthCoreDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<Prescription>>> GetPrescriptions()
        {
            var prescriptions = await _context.Prescriptions
                .Include(p => p.Medications)
                .ToListAsync();
            return Ok(prescriptions);
        }

        [HttpPost]
        public async Task<ActionResult<Prescription>> CreatePrescription(Prescription prescription)
        {
            _context.Prescriptions.Add(prescription);
            await _context.SaveChangesAsync();
            return Ok(prescription);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePrescription(int id, Prescription prescription)
        {
            if (id != prescription.Id) return BadRequest();

            var existing = await _context.Prescriptions
                .Include(p => p.Medications)
                .FirstOrDefaultAsync(p => p.Id == id);
            if (existing == null) return NotFound();

            existing.Status = prescription.Status;
            existing.Date = prescription.Date;
            existing.PatientId = prescription.PatientId;
            existing.DoctorId = prescription.DoctorId;
            existing.RecordId = prescription.RecordId;

            // Remove medications not in the request
            existing.Medications.RemoveAll(em => !prescription.Medications.Any(m => m.Id == em.Id));

            // Add or update medications
            foreach (var med in prescription.Medications)
            {
                var existingMed = existing.Medications.FirstOrDefault(em => em.Id == med.Id && med.Id != 0);
                if (existingMed != null)
                {
                    existingMed.Name = med.Name;
                    existingMed.Dosage = med.Dosage;
                    existingMed.Frequency = med.Frequency;
                    existingMed.Duration = med.Duration;
                    existingMed.Instructions = med.Instructions;
                }
                else
                {
                    existing.Medications.Add(new Medication
                    {
                        Name = med.Name,
                        Dosage = med.Dosage,
                        Frequency = med.Frequency,
                        Duration = med.Duration,
                        Instructions = med.Instructions
                    });
                }
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePrescription(int id)
        {
            var prescription = await _context.Prescriptions
                .Include(p => p.Medications)
                .FirstOrDefaultAsync(p => p.Id == id);
            if (prescription == null) return NotFound();

            _context.Prescriptions.Remove(prescription);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
