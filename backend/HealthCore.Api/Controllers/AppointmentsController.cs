using System.Collections.Generic;
using System.Threading.Tasks;
using HealthCore.Core.Entities;
using HealthCore.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HealthCore.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentsController : ControllerBase
    {
        private readonly IRepository<Appointment> _appointmentRepo;

        public AppointmentsController(IRepository<Appointment> appointmentRepo)
        {
            _appointmentRepo = appointmentRepo;
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<Appointment>>> GetAppointments()
        {
            var appointments = await _appointmentRepo.ListAllAsync();
            return Ok(appointments);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Appointment>> GetAppointment(int id)
        {
            var appointment = await _appointmentRepo.GetByIdAsync(id);
            if (appointment == null) return NotFound();
            return Ok(appointment);
        }

        [HttpPost]
        public async Task<ActionResult<Appointment>> CreateAppointment(Appointment appointment)
        {
            var created = await _appointmentRepo.AddAsync(appointment);
            return CreatedAtAction(nameof(GetAppointment), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAppointment(int id, Appointment appointment)
        {
            if (id != appointment.Id) return BadRequest();
            await _appointmentRepo.UpdateAsync(appointment);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            var appointment = await _appointmentRepo.GetByIdAsync(id);
            if (appointment == null) return NotFound();
            await _appointmentRepo.DeleteAsync(appointment);
            return NoContent();
        }
    }
}
