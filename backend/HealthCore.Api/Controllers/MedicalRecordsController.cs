using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using HealthCore.Core.Entities;
using HealthCore.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HealthCore.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MedicalRecordsController : ControllerBase
    {
        private readonly IRepository<MedicalRecord> _recordRepo;

        public MedicalRecordsController(IRepository<MedicalRecord> recordRepo)
        {
            _recordRepo = recordRepo;
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<MedicalRecord>>> GetMedicalRecords()
        {
            var records = await _recordRepo.ListAllAsync();
            return Ok(records);
        }

        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<IReadOnlyList<MedicalRecord>>> GetPatientRecords(int patientId)
        {
            var allRecords = await _recordRepo.ListAllAsync();
            var patientRecords = allRecords.Where(r => r.PatientId == patientId).ToList();
            return Ok(patientRecords);
        }

        [HttpPost]
        public async Task<ActionResult<MedicalRecord>> CreateMedicalRecord(MedicalRecord record)
        {
            var created = await _recordRepo.AddAsync(record);
            return Ok(created);
        }
    }
}
