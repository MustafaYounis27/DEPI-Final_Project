namespace ClinicManagmentAPIs.DTOs.Common;

public class ErrorResponse
{
    public int status { get; set; }
    public string message { get; set; } = string.Empty;
    public IReadOnlyList<string> errors { get; set; } = Array.Empty<string>();

    public static ErrorResponse Of(int status, string message, IEnumerable<string>? errors = null)
        => new() { status = status, message = message, errors = errors?.ToArray() ?? Array.Empty<string>() };
}
