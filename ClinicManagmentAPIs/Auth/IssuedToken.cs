namespace ClinicManagmentAPIs.Auth;

public record IssuedToken(string AccessToken, DateTime ExpiresAt);
