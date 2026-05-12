using ClinicManagmentAPIs.Data;
using ClinicManagmentAPIs.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;  // For async methods like ToListAsync()
namespace ClinicManagmentAPIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserAccountController : ControllerBase
    {
        private readonly DBContext _context;

        public UserAccountController(DBContext context)
        {
            _context = context;
        }
        [HttpGet("{user_id}")]
        public IActionResult GetUser(int user_id)
        {
            // Find single user by ID
            var user = _context.User.FirstOrDefault(u => u.user_id == user_id);

            // Check if exists
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(user);
        }
    }
}
