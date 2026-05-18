using System.Collections.Generic;
using System.Threading.Tasks;
using HealthCore.Core.Entities;
using HealthCore.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HealthCore.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientsController : ControllerBase
    {
        private readonly IRepository<Patient> _patientRepo;

        public PatientsController(IRepository<Patient> patientRepo)
        {
            _patientRepo = patientRepo;
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<Patient>>> GetPatients()
        {
            var patients = await _patientRepo.ListAllAsync();
            return Ok(patients);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Patient>> GetPatient(int id)
        {
            var patient = await _patientRepo.GetByIdAsync(id);
            if (patient == null) return NotFound();
            return Ok(patient);
        }

        [HttpPost]
        public async Task<ActionResult<Patient>> CreatePatient(Patient patient)
        {
            var created = await _patientRepo.AddAsync(patient);
            return CreatedAtAction(nameof(GetPatient), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePatient(int id, Patient patient)
        {
            if (id != patient.Id) return BadRequest();
            await _patientRepo.UpdateAsync(patient);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            var patient = await _patientRepo.GetByIdAsync(id);
            if (patient == null) return NotFound();
            await _patientRepo.DeleteAsync(patient);
            return NoContent();
        }
    }
}
