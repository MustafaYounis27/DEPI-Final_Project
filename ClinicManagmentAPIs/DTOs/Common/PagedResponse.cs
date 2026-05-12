namespace ClinicManagmentAPIs.DTOs.Common;

public class PagedResponse<T>
{
    public IReadOnlyList<T> items { get; set; } = Array.Empty<T>();
    public int total { get; set; }
    public int page { get; set; }
    public int pageSize { get; set; }
}
