using System.Text;
using System.Text.Json.Serialization;
using ClinicManagmentAPIs.Auth;
using ClinicManagmentAPIs.Data;
using ClinicManagmentAPIs.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ---- Options ----
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));

// ---- MVC + JSON enum strings ----
builder.Services
    .AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// ---- EF Core ----
builder.Services.AddDbContext<DBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ClinicalApplicationDBCon")));

// ---- Auth services ----
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, CurrentUser>();
builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();
builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();

// ---- Domain services (registered as later tasks add them) ----
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAuditLogger, AuditLogger>();
// builder.Services.AddScoped<IUserService, UserService>();
// builder.Services.AddScoped<ISpecialtyService, SpecialtyService>();
// builder.Services.AddScoped<IDoctorService, DoctorService>();
// builder.Services.AddScoped<IPatientService, PatientService>();
// builder.Services.AddScoped<IAppointmentService, AppointmentService>();
// builder.Services.AddScoped<IPatientHistoryService, PatientHistoryService>();
// builder.Services.AddScoped<IVitalsService, VitalsService>();
// builder.Services.AddScoped<IInvoiceService, InvoiceService>();
// builder.Services.AddScoped<IPaymentService, PaymentService>();

// ---- JWT bearer ----
var jwt = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()!;
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
            ClockSkew = TimeSpan.Zero
        };
    });
builder.Services.AddAuthorization();

// ---- Swagger w/ Bearer button ----
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Clinic Management API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Paste JWT here (no 'Bearer ' prefix needed in the box).",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
