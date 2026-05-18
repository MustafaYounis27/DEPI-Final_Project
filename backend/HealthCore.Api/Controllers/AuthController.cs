using System.Threading.Tasks;
using System.Linq;
using HealthCore.Core.Entities;
using HealthCore.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using HealthCore.Api.DTOs;
using BCrypt.Net;
using System.Text.RegularExpressions;

namespace HealthCore.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IRepository<User> _userRepo;

        public AuthController(IRepository<User> userRepo)
        {
            _userRepo = userRepo;
        }

        [HttpPost("login")]
        public async Task<ActionResult<User>> Login([FromBody] LoginDto loginDto)
        {
            var users = await _userRepo.ListAllAsync();
            var user = users.FirstOrDefault(u => u.Email == loginDto.Email);

            if (user == null)
            {
                return Unauthorized("Invalid email or password.");
            }

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);
            
            if (!isPasswordValid)
            {
                return Unauthorized("Invalid email or password.");
            }

            return Ok(user);
        }

        [HttpPost("change-password")]
        public async Task<ActionResult<User>> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            var users = await _userRepo.ListAllAsync();
            var user = users.FirstOrDefault(u => u.Email == changePasswordDto.Email);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(changePasswordDto.OldPassword, user.PasswordHash);
            
            if (!isPasswordValid)
            {
                return BadRequest("Invalid old password.");
            }

            // Password Regex Validation
            var passwordRegex = new Regex(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$");
            if (string.IsNullOrWhiteSpace(changePasswordDto.NewPassword) || !passwordRegex.IsMatch(changePasswordDto.NewPassword))
            {
                return BadRequest("Password must be at least 8 characters long, and include at least one uppercase letter, one lowercase letter, one number, and one special character.");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);
            user.MustChangePassword = false;

            await _userRepo.UpdateAsync(user);

            return Ok(user);
        }
    }
}
