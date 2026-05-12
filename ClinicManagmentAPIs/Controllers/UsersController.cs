using ClinicManagmentAPIs.DTOs.User;
using ClinicManagmentAPIs.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagmentAPIs.Controllers;

[Route("api/users")]
[ApiController]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUserService _users;
    public UsersController(IUserService users) => _users = users;

    [HttpGet]
    public async Task<IActionResult> List() => Ok(await _users.ListAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var u = await _users.GetAsync(id);
        return u is null ? NotFound(new { message = "User not found." }) : Ok(u);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        try
        {
            var created = await _users.CreateAsync(request);
            return CreatedAtAction(nameof(Get), new { id = created.user_id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}/active")]
    public async Task<IActionResult> SetActive(int id, [FromBody] UpdateUserActiveRequest request)
    {
        var updated = await _users.SetActiveAsync(id, request.active_flag);
        return updated is null ? NotFound(new { message = "User not found." }) : Ok(updated);
    }

    [HttpPut("{id:int}/password")]
    public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordRequest request)
    {
        var ok = await _users.ResetPasswordAsync(id, request.new_password);
        return ok ? NoContent() : NotFound(new { message = "User not found." });
    }
}
