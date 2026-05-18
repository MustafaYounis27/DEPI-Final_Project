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
    public class VitalsController : ControllerBase
    {
        private readonly HealthCoreDbContext _dbContext;

        public VitalsController(HealthCoreDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<Vitals>>> GetVitals()
        {
            var vitals = await _dbContext.Vitals.ToListAsync();
            return Ok(vitals);
        }

        [HttpPost]
        public async Task<ActionResult<Vitals>> CreateVitals(Vitals vitals)
        {
            _dbContext.Vitals.Add(vitals);
            await _dbContext.SaveChangesAsync();
            return Ok(vitals);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateVitals(int id, Vitals vitals)
        {
            if (id != vitals.Id)
                return BadRequest();

            _dbContext.Entry(vitals).State = EntityState.Modified;
            try
            {
                await _dbContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_dbContext.Vitals.Any(e => e.Id == id))
                    return NotFound();
                else
                    throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteVitals(int id)
        {
            var vitals = await _dbContext.Vitals.FindAsync(id);
            if (vitals == null)
                return NotFound();

            // Nullify referencing MedicalRecord VitalsId to prevent SQL Server constraint violation
            var referencingRecords = await _dbContext.MedicalRecords
                .Where(m => m.VitalsId == id)
                .ToListAsync();

            foreach (var record in referencingRecords)
            {
                record.VitalsId = null;
            }

            _dbContext.Vitals.Remove(vitals);
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }
    }
}
