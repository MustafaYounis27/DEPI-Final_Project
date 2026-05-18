using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using HealthCore.Core.Entities;
using HealthCore.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthCore.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BillingsController : ControllerBase
    {
        private readonly HealthCoreDbContext _context;

        public BillingsController(HealthCoreDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<Billing>>> GetBillings()
        {
            var billings = await _context.Billings
                .Include(b => b.Items)
                .ToListAsync();
            return Ok(billings);
        }

        [HttpPost]
        public async Task<ActionResult<Billing>> CreateBilling(Billing billing)
        {
            _context.Billings.Add(billing);
            await _context.SaveChangesAsync();
            return Ok(billing);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBilling(int id, Billing billing)
        {
            if (id != billing.Id) return BadRequest();

            var existing = await _context.Billings.Include(b => b.Items).FirstOrDefaultAsync(b => b.Id == id);
            if (existing == null) return NotFound();

            existing.Status = billing.Status;
            existing.Amount = billing.Amount;
            existing.Date = billing.Date;
            existing.PatientId = billing.PatientId;

            // Remove items not in the request
            existing.Items.RemoveAll(ei => !billing.Items.Any(i => i.Id == ei.Id));

            // Add or update items
            foreach (var item in billing.Items)
            {
                var existingItem = existing.Items.FirstOrDefault(ei => ei.Id == item.Id && item.Id != 0);
                if (existingItem != null)
                {
                    existingItem.Description = item.Description;
                    existingItem.Cost = item.Cost;
                }
                else
                {
                    existing.Items.Add(new BillingItem
                    {
                        Description = item.Description,
                        Cost = item.Cost
                    });
                }
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBilling(int id)
        {
            var billing = await _context.Billings.Include(b => b.Items).FirstOrDefaultAsync(b => b.Id == id);
            if (billing == null) return NotFound();

            _context.Billings.Remove(billing);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
